const { generateMystery } = require('./services/geminiService');

async function main() {
    const premise = 'A priceless painting disappeared from a museum during a private exhibition.';
    const difficulty = 'easy';

    console.log('Generating a mystery... this can take 10 to 30 seconds.');

    try {
        const { mystery, attempts } = await generateMystery(premise, difficulty);

        console.log('\nTitle:', mystery.title);
        console.log('Attempts needed:', attempts);
        console.log('\nSTORY:\n', mystery.story);

        console.log('\nSUSPECTS:');
        mystery.suspects.forEach((s) => {
            console.log(`- ${s.id} ${s.name} (${s.role}): "${s.statement}"`);
        });

        console.log('\nCLUES:');
        mystery.clues.forEach((c) => console.log(`- ${c.id}: ${c.description}`));

        console.log('\nHINTS:');
        mystery.hints.forEach((h, i) => console.log(`${i + 1}. ${h}`));

        console.log('\n(Developer view only) CULPRIT:', mystery.solution.culpritId);
        console.log('SUPPORTING CLUES:', mystery.solution.supportingClueIds.join(', '));
        console.log('EXPLANATION:', mystery.solution.explanation);
    } catch (error) {
        console.error('Generation failed:', error.message);
    }
}

main();