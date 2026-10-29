const { z } = require('zod');

// The rules for each difficulty (from SPEC.md)
const DIFFICULTY_RULES = {
    easy: { suspects: 3, clues: 5, hints: 2, bonus: 100 },
    medium: { suspects: 4, clues: 7, hints: 3, bonus: 150 },
    hard: { suspects: 5, clues: 9, hints: 3, bonus: 200 },
};

// Checks what the player sends when creating a mystery
const createCaseSchema = z.object({
    premise: z
        .string()
        .trim()
        .min(10, 'Premise must be at least 10 characters')
        .max(300, 'Premise must be at most 300 characters'),
    difficulty: z.enum(['easy', 'medium', 'hard']),
});

// Checks the shape of what Gemini returns
const suspectSchema = z.object({
    id: z.string().min(1).max(40),
    name: z.string().min(1).max(60),
    role: z.string().min(1).max(80),
    description: z.string().min(1).max(400),
    statement: z.string().min(1).max(500),
});

const clueSchema = z.object({
    id: z.string().min(1).max(40),
    description: z.string().min(1).max(400),
    relevance: z.string().min(1).max(400),
});

const mysterySchema = z.object({
    title: z.string().min(1).max(120),
    story: z.string().min(1).max(2000),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    suspects: z.array(suspectSchema),
    clues: z.array(clueSchema),
    hints: z.array(z.string().min(1).max(300)),
    solution: z.object({
        culpritId: z.string().min(1).max(40),
        explanation: z.string().min(1).max(1500),
        supportingClueIds: z.array(z.string().min(1).max(40)),
    }),
});

// Returns { valid: true, data } or { valid: false, errors: [...] }
function validateMystery(rawData, expectedDifficulty) {
    // Step 1: is the structure correct (fields, types, lengths)?
    const parsed = mysterySchema.safeParse(rawData);
    if (!parsed.success) {
        const errors = parsed.error.issues.map(
            (issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`
        );
        return { valid: false, errors };
    }

    const mystery = parsed.data;
    const rules = DIFFICULTY_RULES[expectedDifficulty];
    const errors = [];

    // Step 2: do the game rules hold?
    if (mystery.difficulty !== expectedDifficulty) {
        errors.push(`difficulty should be "${expectedDifficulty}"`);
    }
    if (mystery.suspects.length !== rules.suspects) {
        errors.push(`expected ${rules.suspects} suspects, got ${mystery.suspects.length}`);
    }
    if (mystery.clues.length !== rules.clues) {
        errors.push(`expected ${rules.clues} clues, got ${mystery.clues.length}`);
    }
    if (mystery.hints.length !== rules.hints) {
        errors.push(`expected ${rules.hints} hints, got ${mystery.hints.length}`);
    }

    // Step 3: are the IDs unique?
    const suspectIds = mystery.suspects.map((s) => s.id);
    const clueIds = mystery.clues.map((c) => c.id);
    if (new Set(suspectIds).size !== suspectIds.length) {
        errors.push('suspect IDs must be unique');
    }
    if (new Set(clueIds).size !== clueIds.length) {
        errors.push('clue IDs must be unique');
    }

    // Step 4: does the solution point at things that really exist?
    const { culpritId, supportingClueIds } = mystery.solution;
    if (!suspectIds.includes(culpritId)) {
        errors.push('culpritId is not one of the suspects');
    }
    if (supportingClueIds.length === 0) {
        errors.push('solution must reference at least one supporting clue');
    }
    for (const id of supportingClueIds) {
        if (!clueIds.includes(id)) {
            errors.push(`supporting clue "${id}" does not exist`);
        }
    }

    // Step 5: hints must not give the culprit away by name
    const culprit = mystery.suspects.find((s) => s.id === culpritId);
    if (culprit) {
        const culpritName = culprit.name.toLowerCase();
        const leaked = mystery.hints.some((hint) =>
            hint.toLowerCase().includes(culpritName)
        );
        if (leaked) {
            errors.push('a hint names the culprit directly');
        }
    }

    if (errors.length > 0) {
        return { valid: false, errors };
    }
    return { valid: true, data: mystery };
}

module.exports = { DIFFICULTY_RULES, createCaseSchema, validateMystery };