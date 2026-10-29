const { validateMystery } = require('./services/mysteryValidator');

const makeMystery = () => ({
    title: 'The Missing Diamond',
    story: 'A diamond vanished from the mansion during a dinner party.',
    difficulty: 'easy',
    suspects: Array.from({ length: 3 }, (_, i) => ({
        id: `suspect_0${i + 1}`,
        name: ['Adrian', 'Maya', 'Daniel'][i],
        role: 'Guest',
        description: 'Was at the party.',
        statement: 'I never left the dining room.',
    })),
    clues: Array.from({ length: 5 }, (_, i) => ({
        id: `clue_0${i + 1}`,
        description: `Clue number ${i + 1}`,
        relevance: 'Connects to a suspect statement.',
    })),
    hints: [
        'Compare the timeline with the statements.',
        'Look at who had access to the study.',
    ],
    solution: {
        culpritId: 'suspect_02',
        explanation: 'The timeline contradicts the culprit statement.',
        supportingClueIds: ['clue_01', 'clue_03'],
    },
});

// Test 1: a good mystery
console.log('Good mystery:', validateMystery(makeMystery(), 'easy').valid);

// Test 2: only 2 suspects
const tooFew = makeMystery();
tooFew.suspects.pop();
console.log('Too few suspects:', validateMystery(tooFew, 'easy'));

// Test 3: culprit is not a suspect
const badCulprit = makeMystery();
badCulprit.solution.culpritId = 'suspect_99';
console.log('Bad culprit:', validateMystery(badCulprit, 'easy'));

// Test 4: a hint names the culprit
const leakyHint = makeMystery();
leakyHint.hints[0] = 'Maya is hiding something.';
console.log('Leaky hint:', validateMystery(leakyHint, 'easy'));