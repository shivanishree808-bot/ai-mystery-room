import { Link } from 'react-router-dom'

const DIFFICULTIES = [
    {
        name: 'Easy',
        suspects: 3,
        clues: 5,
        hints: 2,
        bonus: 100,
        text: 'A gentle first case. Few suspects, clear trails.',
    },
    {
        name: 'Medium',
        suspects: 4,
        clues: 7,
        hints: 3,
        bonus: 150,
        text: 'More people, more lies, and more red herrings.',
    },
    {
        name: 'Hard',
        suspects: 5,
        clues: 9,
        hints: 3,
        bonus: 200,
        text: 'A crowded room and a very careful culprit.',
    },
]

const STEPS = [
    {
        title: 'Describe the crime',
        text: 'Type any premise, like a stolen painting or a missing research file.',
    },
    {
        title: 'Investigate',
        text: 'Read the suspects\u2019 statements and uncover clues. Each clue is worth +5 points.',
    },
    {
        title: 'Use hints wisely',
        text: 'Stuck? A hint helps, but it costs 10 points.',
    },
    {
        title: 'Name the culprit',
        text: 'You get one accusation. A correct one earns a bonus.',
    },
]

export default function Home() {
    return (
        <div className="min-h-screen">
            {/* Top bar */}
            <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
                <span className="text-lg font-bold tracking-wide text-amber-300">
                    AI Mystery Room
                </span>
                <Link
                    to="/create"
                    className="text-sm font-semibold text-amber-300/80 hover:text-amber-300"
                >
                    New case
                </Link>
            </header>

            <main>
                {/* Hero */}
                <section className="mx-auto max-w-5xl px-4 py-16 text-center sm:py-24">
                    <p className="text-sm font-semibold uppercase tracking-widest text-red-300">
                        Case files open
                    </p>
                    <h1 className="mt-4 text-4xl font-bold uppercase tracking-wide text-amber-300 sm:text-6xl">
                        Every secret leaves a clue.
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-amber-50/80">
                        Enter a world of hidden motives, suspicious alibis, and unsolved
                        mysteries. Your next case awaits.
                    </p>
                    <Link
                        to="/create"
                        className="mt-10 inline-block rounded-md bg-amber-300 px-8 py-4 text-lg font-bold uppercase tracking-wide text-stone-900 transition hover:bg-amber-200"
                    >
                        Start investigation
                    </Link>
                </section>

                {/* How it works */}
                <section className="mx-auto max-w-5xl px-4 py-10">
                    <h2 className="text-center text-2xl font-bold text-amber-300">
                        How to play
                    </h2>
                    <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {STEPS.map((step, index) => (
                            <li
                                key={step.title}
                                className="rounded-md border border-amber-300/20 bg-stone-800 p-5"
                            >
                                <span className="text-sm font-bold text-red-300">
                                    Step {index + 1}
                                </span>
                                <h3 className="mt-1 text-lg font-semibold text-amber-300">
                                    {step.title}
                                </h3>
                                <p className="mt-2 text-sm text-amber-50/70">{step.text}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                {/* Difficulty cards */}
                <section className="mx-auto max-w-5xl px-4 py-10">
                    <h2 className="text-center text-2xl font-bold text-amber-300">
                        Choose your difficulty
                    </h2>
                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                        {DIFFICULTIES.map((level) => (
                            <article
                                key={level.name}
                                className="rounded-md border border-amber-300/30 bg-stone-800 p-6"
                            >
                                <h3 className="text-xl font-bold text-amber-300">{level.name}</h3>
                                <p className="mt-2 text-sm text-amber-50/70">{level.text}</p>
                                <ul className="mt-4 space-y-1 text-sm text-amber-50/80">
                                    <li>{level.suspects} suspects</li>
                                    <li>{level.clues} clues</li>
                                    <li>{level.hints} hints</li>
                                </ul>
                                <p className="mt-4 border-t border-amber-300/20 pt-3 text-xs uppercase tracking-wide text-amber-50/60">
                                    Correct answer bonus:{' '}
                                    <span className="font-bold text-amber-300">{level.bonus}</span>
                                </p>
                            </article>
                        ))}
                    </div>
                </section>

                {/* Final call to action */}
                <section className="mx-auto max-w-5xl px-4 py-16 text-center">
                    <p className="text-amber-50/70">
                        Every mystery is written fresh by AI, so no two cases are the same.
                    </p>
                    <Link
                        to="/create"
                        className="mt-6 inline-block rounded-md border border-amber-300 px-8 py-3 font-bold uppercase tracking-wide text-amber-300 transition hover:bg-amber-300 hover:text-stone-900"
                    >
                        Open a new case
                    </Link>
                </section>
            </main>

            <footer className="border-t border-amber-300/10 py-6 text-center text-xs text-amber-50/40">
                AI Mystery Room &middot; All mysteries are fictional.
            </footer>
        </div>
    )
}