const mongoose = require('mongoose');
const { z } = require('zod');
const Case = require('../models/Case');
const { createCaseSchema, DIFFICULTY_RULES } = require('../services/mysteryValidator');
const { generateMystery } = require('../services/geminiService');
const { shuffleMystery } = require('../services/shuffleMystery');

const CLUE_POINTS = 5;
const HINT_PENALTY = 10;

const accuseSchema = z.object({
    suspectId: z.string().trim().min(1).max(40),
});

// Score so far (the correct-accusation bonus is added only at the end)
function calculateCurrentScore(discoveredCount, hintsUsed) {
    return Math.max(0, discoveredCount * CLUE_POINTS - hintsUsed * HINT_PENALTY);
}

// Final score, used exactly once when the accusation is accepted
function calculateFinalScore(difficulty, isCorrect, discoveredCount, hintsUsed) {
    const bonus = isCorrect ? DIFFICULTY_RULES[difficulty].bonus : 0;
    const cluePoints = discoveredCount * CLUE_POINTS;
    const hintPenalty = hintsUsed * HINT_PENALTY;
    const rawScore = bonus + cluePoints - hintPenalty;

    return {
        bonus,
        cluePoints,
        hintPenalty,
        rawScore,
        finalScore: Math.max(0, rawScore),
    };
}

// The version of a case that is safe to send to the browser.
// It never includes the solution or the hints.
function toPublicCase(doc) {
    const discovered = doc.playerProgress.discoveredClueIds;
    const hintsUsed = doc.playerProgress.hintsUsed;
    const rules = DIFFICULTY_RULES[doc.difficulty];

    return {
        caseId: doc._id,
        title: doc.title,
        premise: doc.premise,
        story: doc.story,
        difficulty: doc.difficulty,
        status: doc.status,
        suspects: doc.suspects.map((s) => ({
            id: s.id,
            name: s.name,
            role: s.role,
            description: s.description,
            statement: s.statement,
        })),
        // A clue's text is only sent after the player discovers it
        clues: doc.clues.map((c) => {
            const found = discovered.includes(c.id);
            return {
                id: c.id,
                discovered: found,
                description: found ? c.description : null,
            };
        }),
        progress: {
            discoveredClueIds: [...discovered],
            hintsUsed,
            hintsTotal: rules.hints,
            currentScore: calculateCurrentScore(discovered.length, hintsUsed),
        },
        createdAt: doc.createdAt,
    };
}

// The full result. Only call this for a COMPLETED case.
function toResult(doc) {
    const { culpritId, explanation, supportingClueIds } = doc.solution;
    const culprit = doc.suspects.find((s) => s.id === culpritId);
    const accused = doc.suspects.find((s) => s.id === doc.accusation.accusedSuspectId);
    const discovered = doc.playerProgress.discoveredClueIds;
    const hintsUsed = doc.playerProgress.hintsUsed;

    return {
        caseId: doc._id,
        title: doc.title,
        difficulty: doc.difficulty,
        status: doc.status,
        isCorrect: doc.accusation.isCorrect,
        accusedSuspect: accused ? { id: accused.id, name: accused.name } : null,
        culprit: culprit ? { id: culprit.id, name: culprit.name, role: culprit.role } : null,
        explanation,
        supportingClues: doc.clues
            .filter((c) => supportingClueIds.includes(c.id))
            .map((c) => ({ id: c.id, description: c.description })),
        cluesDiscovered: discovered.length,
        cluesTotal: doc.clues.length,
        hintsUsed,
        score: {
            ...calculateFinalScore(doc.difficulty, doc.accusation.isCorrect, discovered.length, hintsUsed),
            finalScore: doc.score,
        },
    };
}

// POST /api/cases
async function createCase(req, res, next) {
    try {
        const parsed = createCaseSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: 'Invalid request',
                details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
            });
        }

        const { premise, difficulty } = parsed.data;
        const { mystery: generated } = await generateMystery(premise, difficulty);
        const mystery = shuffleMystery(generated);

        const created = await Case.create({
            title: mystery.title,
            premise,
            story: mystery.story,
            difficulty,
            suspects: mystery.suspects,
            clues: mystery.clues,
            hints: mystery.hints,
            solution: mystery.solution,
        });

        res.status(201).json(toPublicCase(created));
    } catch (error) {
        next(error);
    }
}

// GET /api/cases/:id
async function getCase(req, res, next) {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ error: 'Invalid case ID' });
        }

        // solution and hints are hidden by default in the model,
        // so they are not even loaded here
        const found = await Case.findById(id);
        if (!found) {
            return res.status(404).json({ error: 'Case not found' });
        }

        res.json(toPublicCase(found));
    } catch (error) {
        next(error);
    }
}

// POST /api/cases/:id/clues/:clueId/discover
async function discoverClue(req, res, next) {
    try {
        const { id, clueId } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ error: 'Invalid case ID' });
        }

        const existing = await Case.findById(id);
        if (!existing) {
            return res.status(404).json({ error: 'Case not found' });
        }
        if (existing.status !== 'active') {
            return res.status(409).json({ error: 'This case is already completed' });
        }

        const clue = existing.clues.find((c) => c.id === clueId);
        if (!clue) {
            return res.status(404).json({ error: 'Clue not found' });
        }

        // $addToSet never adds the same clue twice, so repeating this
        // request cannot award extra points
        const updated = await Case.findOneAndUpdate(
            { _id: id, status: 'active' },
            { $addToSet: { 'playerProgress.discoveredClueIds': clueId } },
            { new: true }
        );
        if (!updated) {
            return res.status(409).json({ error: 'This case is already completed' });
        }

        res.json({
            clue: { id: clue.id, description: clue.description },
            case: toPublicCase(updated),
        });
    } catch (error) {
        next(error);
    }
}

// POST /api/cases/:id/hints
// Optional body: { "hintNumber": 1 } to re-read a hint that was already given (free)
async function requestHint(req, res, next) {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ error: 'Invalid case ID' });
        }

        // hints are hidden by default, so we ask for them on purpose here
        const existing = await Case.findById(id).select('+hints');
        if (!existing) {
            return res.status(404).json({ error: 'Case not found' });
        }
        if (existing.status !== 'active') {
            return res.status(409).json({ error: 'This case is already completed' });
        }

        const total = existing.hints.length;
        const used = existing.playerProgress.hintsUsed;
        const requested = Number.isInteger(req.body && req.body.hintNumber)
            ? req.body.hintNumber
            : null;

        // Asking again for a hint the player already received is free
        if (requested !== null && requested >= 1 && requested <= used) {
            return res.json({
                hint: existing.hints[requested - 1],
                hintNumber: requested,
                charged: false,
                case: toPublicCase(existing),
            });
        }

        if (used >= total) {
            return res.status(409).json({ error: 'No hints left for this case' });
        }

        // One atomic update: it only succeeds while hintsUsed is below the limit,
        // so fast double-clicks can never hand out an extra hint
        const updated = await Case.findOneAndUpdate(
            {
                _id: id,
                status: 'active',
                'playerProgress.hintsUsed': { $lt: total },
            },
            { $inc: { 'playerProgress.hintsUsed': 1 } },
            { new: true }
        ).select('+hints');

        if (!updated) {
            return res.status(409).json({ error: 'No hints left for this case' });
        }

        const hintNumber = updated.playerProgress.hintsUsed;
        res.json({
            hint: updated.hints[hintNumber - 1],
            hintNumber,
            charged: true,
            case: toPublicCase(updated),
        });
    } catch (error) {
        next(error);
    }
}

// POST /api/cases/:id/accuse
async function accuse(req, res, next) {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ error: 'Invalid case ID' });
        }

        const parsed = accuseSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'suspectId is required' });
        }
        const { suspectId } = parsed.data;

        // The solution is hidden by default, so we ask for it on purpose here
        const existing = await Case.findById(id).select('+solution');
        if (!existing) {
            return res.status(404).json({ error: 'Case not found' });
        }
        if (existing.status !== 'active') {
            return res.status(409).json({ error: 'This case is already completed' });
        }
        if (!existing.suspects.some((s) => s.id === suspectId)) {
            return res.status(400).json({ error: 'That suspect is not part of this case' });
        }

        // The SERVER decides if the accusation is correct
        const isCorrect = existing.solution.culpritId === suspectId;
        const discoveredCount = existing.playerProgress.discoveredClueIds.length;
        const hintsUsed = existing.playerProgress.hintsUsed;
        const { finalScore } = calculateFinalScore(
            existing.difficulty,
            isCorrect,
            discoveredCount,
            hintsUsed
        );

        // This only succeeds while the case is still active, so only one
        // accusation can ever be saved, even if two requests arrive together
        const completed = await Case.findOneAndUpdate(
            { _id: id, status: 'active' },
            {
                $set: {
                    status: 'completed',
                    'accusation.accusedSuspectId': suspectId,
                    'accusation.isCorrect': isCorrect,
                    score: finalScore,
                },
            },
            { new: true }
        ).select('+solution');

        if (!completed) {
            return res.status(409).json({ error: 'This case is already completed' });
        }

        res.json(toResult(completed));
    } catch (error) {
        next(error);
    }
}

// GET /api/cases/:id/result
async function getResult(req, res, next) {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ error: 'Invalid case ID' });
        }

        const found = await Case.findById(id).select('+solution');
        if (!found) {
            return res.status(404).json({ error: 'Case not found' });
        }

        // Nothing about the solution leaves the server before an accusation
        if (found.status !== 'completed') {
            return res.status(403).json({ error: 'The result is not available until you submit an accusation' });
        }

        res.json(toResult(found));
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createCase,
    getCase,
    discoverClue,
    requestHint,
    accuse,
    getResult,
    toPublicCase,
};