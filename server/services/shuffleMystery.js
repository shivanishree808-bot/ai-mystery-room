// Fisher-Yates shuffle: a fair way to put a list in random order
function shuffle(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function makeId(prefix, index) {
    return `${prefix}_${String(index + 1).padStart(2, '0')}`;
}

// Puts suspects and clues in random order, gives them fresh ids,
// and updates every reference to the old ids.
function shuffleMystery(mystery) {
    const idMap = {}; // old id -> new id

    const suspects = shuffle(mystery.suspects).map((s, i) => {
        const newId = makeId('suspect', i);
        idMap[s.id] = newId;
        return { ...s, id: newId };
    });

    const clues = shuffle(mystery.clues).map((c, i) => {
        const newId = makeId('clue', i);
        idMap[c.id] = newId;
        return { ...c, id: newId };
    });

    // Text may mention ids like "clue_03", so rewrite those mentions too
    const fixText = (text) =>
        text.replace(/\b(suspect|clue)_\d+\b/g, (match) => idMap[match] || match);

    return {
        ...mystery,
        suspects,
        clues: clues.map((c) => ({
            ...c,
            description: fixText(c.description),
            relevance: fixText(c.relevance),
        })),
        hints: mystery.hints.map(fixText),
        solution: {
            culpritId: idMap[mystery.solution.culpritId],
            explanation: fixText(mystery.solution.explanation),
            supportingClueIds: mystery.solution.supportingClueIds.map((id) => idMap[id]),
        },
    };
}

module.exports = { shuffleMystery };