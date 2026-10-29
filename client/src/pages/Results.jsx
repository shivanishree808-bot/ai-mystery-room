import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getResult, getErrorMessage } from '../services/api.js'

export default function Results() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let cancelled = false

        async function load() {
            try {
                const data = await getResult(id)
                if (!cancelled) setResult(data)
            } catch (err) {
                if (cancelled) return

                // 403 means the player has not accused yet, so send them back
                if (err.response && err.response.status === 403) {
                    navigate(`/case/${id}`, { replace: true })
                    return
                }
                setError(getErrorMessage(err))
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        load()
        return () => {
            cancelled = true
        }
    }, [id, navigate])

    if (loading) {
        return (
            <main className="mx-auto max-w-3xl px-4 py-10">
                <p className="text-amber-300">Reading the final report...</p>
            </main>
        )
    }

    if (error || !result) {
        return (
            <main className="mx-auto max-w-3xl px-4 py-10">
                <div role="alert" className="rounded-md border border-red-400/50 bg-red-950/60 p-4 text-red-200">
                    {error || 'Result not found.'}
                </div>
                <Link to="/create" className="mt-4 inline-block text-amber-300 underline">
                    Start a new case
                </Link>
            </main>
        )
    }

    const { score } = result

    return (
        <main className="mx-auto max-w-3xl px-4 py-8">
            {/* Outcome banner */}
            <header
                className={`rounded-md border p-6 text-center ${result.isCorrect
                        ? 'border-amber-300 bg-stone-800'
                        : 'border-red-400/60 bg-red-950/60'
                    }`}
            >
                <h1
                    className={`text-3xl font-bold uppercase tracking-wide sm:text-4xl ${result.isCorrect ? 'text-amber-300' : 'text-red-200'
                        }`}
                >
                    {result.isCorrect
                        ? 'Case solved!'
                        : 'The investigation continues no longer. The real culprit has been identified.'}
                </h1>
                <p className="mt-3 text-amber-50/70">{result.title}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-amber-50/50">
                    Difficulty: {result.difficulty}
                </p>
            </header>

            {/* Accusation vs truth */}
            <section className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-md border border-amber-300/20 bg-stone-800 p-4">
                    <p className="text-xs uppercase tracking-wide text-amber-50/60">You accused</p>
                    <p className="mt-1 text-xl font-semibold text-amber-300">
                        {result.accusedSuspect ? result.accusedSuspect.name : 'No one'}
                    </p>
                </div>
                <div className="rounded-md border border-amber-300/20 bg-stone-800 p-4">
                    <p className="text-xs uppercase tracking-wide text-amber-50/60">The real culprit</p>
                    <p className="mt-1 text-xl font-semibold text-amber-300">
                        {result.culprit ? result.culprit.name : 'Unknown'}
                    </p>
                    {result.culprit && (
                        <p className="text-sm text-amber-50/60">{result.culprit.role}</p>
                    )}
                </div>
            </section>

            {/* Explanation */}
            <section className="mt-6 rounded-md border border-amber-300/20 bg-stone-800 p-5">
                <h2 className="text-xl font-bold text-amber-300">How it was solved</h2>
                <p className="mt-3 leading-relaxed text-amber-50/90">{result.explanation}</p>
            </section>

            {/* Supporting clues */}
            {result.supportingClues.length > 0 && (
                <section className="mt-6 rounded-md border border-amber-300/20 bg-stone-800 p-5">
                    <h2 className="text-xl font-bold text-amber-300">The evidence</h2>
                    <ul className="mt-3 space-y-3">
                        {result.supportingClues.map((clue) => (
                            <li
                                key={clue.id}
                                className="border-l-2 border-amber-300/50 pl-3 text-sm text-amber-50/90"
                            >
                                {clue.description}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Score breakdown */}
            <section className="mt-6 rounded-md border border-amber-300/20 bg-stone-800 p-5">
                <h2 className="text-xl font-bold text-amber-300">Your score</h2>
                <p className="mt-1 text-sm text-amber-50/60">
                    Clues found: {result.cluesDiscovered} / {result.cluesTotal} &middot; Hints used:{' '}
                    {result.hintsUsed}
                </p>

                <dl className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <dt className="text-amber-50/80">Correct accusation bonus</dt>
                        <dd className="font-semibold text-amber-50">+{score.bonus}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-amber-50/80">Clues discovered</dt>
                        <dd className="font-semibold text-amber-50">+{score.cluePoints}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-amber-50/80">Hints used</dt>
                        <dd className="font-semibold text-amber-50">-{score.hintPenalty}</dd>
                    </div>
                    <div className="flex justify-between border-t border-amber-300/30 pt-3 text-lg">
                        <dt className="font-bold text-amber-300">Final score</dt>
                        <dd className="font-bold text-amber-300">{score.finalScore}</dd>
                    </div>
                </dl>
                <p className="mt-2 text-xs text-amber-50/50">The lowest possible score is 0.</p>
            </section>

            <div className="mt-8 text-center">
                <Link
                    to="/create"
                    className="inline-block rounded-md bg-amber-300 px-8 py-3 font-bold uppercase tracking-wide text-stone-900 transition hover:bg-amber-200"
                >
                    Play again
                </Link>
            </div>
        </main>
    )
}