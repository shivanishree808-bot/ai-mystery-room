const { shuffleMystery } = require('./services/shuffleMystery');

const sample = {
    title: 'Test',
    story: 'A test story.',
    difficulty: 'easy',
    suspects: [
        { id: 'suspect_01', name: 'Alice', role: 'A', description: 'd', statement: 's' },
        { id: 'suspect_02', name: 'Bob', role: 'B', description: 'd', statement: 's' },
        { id: 'suspect_03', name: 'Cara', role: 'C', description: 'd', statement: 's' },
    ],
    clues: [1, 2, 3, 4, 5].map((n) => ({
        id: `clue_0${n}`,
        description: `Clue ${n} text`,
        relevance: 'r',
    })),
    hints: ['Look at clue_01 carefully.', 'Compare the statements.'],
    solution: {
        culpritId: 'suspect_01', // Alice is always the culprit
        explanation: 'Alice lied, as clue_01 and clue_03 show.',
        supportingClueIds: ['clue_01', 'clue_03'],
    },
};

const positions = { suspect_01: 0, suspect_02: 0, suspect_03: 0 };
let allConsistent = true;

for (let i = 0; i < 300; i++) {
    const result = shuffleMystery(sample);
    positions[result.solution.culpritId]++;

    // The culprit must still be Alice
    const culprit = result.suspects.find((s) => s.id === result.solution.culpritId);
    if (culprit.name !== 'Alice') allConsistent = false;

    // The supporting clues must still be the same two clues
    const texts = result.solution.supportingClueIds.map(
        (id) => result.clues.find((c) => c.id === id).description
    );
    if (!(texts.includes('Clue 1 text') && texts.includes('Clue 3 text'))) allConsistent = false;
}

console.log('Culprit position counts over 300 runs:', positions);
console.log('Culprit and clues stayed correct every time:', allConsistent);