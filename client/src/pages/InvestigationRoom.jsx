import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
    getCase,
    discoverClue,
    requestHint,
    getErrorMessage,
} from '../services/api.js'

export default function InvestigationRoom() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [caseData, setCaseData] = useState(null)
    const [hints, setHints] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [actionError, setActionError] = useState('')
    const [busyClue, setBusyClue] = useState(null)
    const [hintBusy, setHintBusy] = useState(false)

    // Load the case when the page opens
    useEffect(() => {
        let cancelled = false

        async function load() {
            try {
                const data = await getCase(id)
                if (cancelled) return

                if (data.status === 'completed') {
                    navigate(`/case/${id}/result`, { replace: true })
                    return
                }
                setCaseData(data)

                // Hints the player already used are re-read for free
                const loaded = []
                for (let n = 1; n <= data.progress.hintsUsed; n++) {
                    const res = await requestHint(id, n)
                    loaded.push(res.hint)
                }
                if (!cancelled) setHints(loaded)
            } catch (err) {
                if (!cancelled) setError(getErrorMessage(err))
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        load()
        return () => {
            cancelled = true
        }
    }, [id, navigate])

    async function handleInvestigate(clueId) {
        if (busyClue) return
        setActionError('')
        setBusyClue(clueId)
        try {
            const res = await discoverClue(id, clueId)
            setCaseData(res.case)
        } catch (err) {
            setActionError(getErrorMessage(err))
        } finally {
            setBusyClue(null)
        }
    }

    async function handleHint() {
        if (hintBusy) return
        setActionError('')
        setHintBusy(true)
        try {
            const res = await requestHint(id)
            setHints((previous) => {
                const copy = [...previous]
                copy[res.hintNumber - 1] = res.hint
                return copy
            })
            setCaseData(res.case)
        } catch (err) {
            setActionError(getErrorMessage(err))
        } finally {
            setHintBusy(false)
        }
    }

    if (loading) {
        return (
            <main className="mx-auto max-w-4xl px-4 py-10">
                <p className="text-amber-300">Opening the case file...</p>
            </main>
        )
    }

    if (error || !caseData) {
        return (
            <main className="mx-auto max-w-4xl px-4 py-10">
                <div role="alert" className="rounded-md border border-red-400/50 bg-red-950/60 p-4 text-red-200">
                    {error || 'Case not found.'}
                </div>
                <Link to="/create" className="mt-4 inline-block text-amber-300 underline">
                    Start a new case
                </Link>
            </main>
        )
    }

    const { progress } = caseData
    const hintsLeft = progress.hintsTotal - progress.hintsUsed
    const cluesFound = progress.discoveredClueIds.length

    return (
        <main className="mx-auto max-w-4xl px-4 py-8">
            {/* Case header */}
            <header className="rounded-md border border-amber-300/20 bg-stone-800 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <span className="rounded bg-red-950 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-amber-300">
                            {caseData.difficulty}
                        </span>
                        <h1 className="mt-3 text-2xl font-bold text-amber-300 sm:text-3xl">
                            {caseData.title}
                        </h1>
                    </div>
                    <div className="text-right">
                        <p className="text-xs uppercase tracking-wide text-amber-50/60">Current score</p>
                        <p className="text-3xl font-bold text-amber-300">{progress.currentScore}</p>
                    </div>
                </div>
                <p className="mt-4 leading-relaxed text-amber-50/90">{caseData.story}</p>
                <p className="mt-4 text-sm text-amber-50/60">
                    Clues found: {cluesFound} / {caseData.clues.length} &middot; Hints used:{' '}
                    {progress.hintsUsed} / {progress.hintsTotal}
                </p>
            </header>

            {actionError && (
                <div role="alert" className="mt-4 rounded-md border border-red-400/50 bg-red-950/60 p-3 text-sm text-red-200">
                    {actionError}
                </div>
            )}

            {/* Suspects */}
            <section className="mt-8">
                <h2 className="text-xl font-bold text-amber-300">Suspects</h2>
                <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {caseData.suspects.map((suspect) => (
                        <article key={suspect.id} className="rounded-md border border-amber-300/20 bg-stone-800 p-4">
                            <h3 className="text-lg font-semibold text-amber-300">{suspect.name}</h3>
                            <p className="text-sm text-amber-50/60">{suspect.role}</p>
                            <p className="mt-3 text-sm text-amber-50/80">{suspect.description}</p>
                            <p className="mt-3 border-l-2 border-amber-300/50 pl-3 text-sm italic text-amber-50/90">
                                &ldquo;{suspect.statement}&rdquo;
                            </p>
                        </article>
                    ))}
                </div>
            </section>

            {/* Clue board */}
            <section className="mt-8">
                <h2 className="text-xl font-bold text-amber-300">Clue board</h2>
                <p className="text-sm text-amber-50/60">Each clue you investigate is worth +5 points.</p>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    {caseData.clues.map((clue, index) => (
                        <article
                            key={clue.id}
                            className={`rounded-md border p-4 ${clue.discovered
                                    ? 'border-amber-300/60 bg-stone-800'
                                    : 'border-dashed border-amber-300/20 bg-stone-900'
                                }`}
                        >
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-300">
                                Clue {index + 1}
                            </h3>
                            {clue.discovered ? (
                                <p className="mt-2 text-sm text-amber-50/90">{clue.description}</p>
                            ) : (
                                <>
                                    <p className="mt-2 text-sm text-amber-50/50">Not investigated yet.</p>
                                    <button
                                        type="button"
                                        onClick={() => handleInvestigate(clue.id)}
                                        disabled={busyClue !== null}
                                        className="mt-3 rounded bg-amber-300 px-4 py-2 text-sm font-bold text-stone-900 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {busyClue === clue.id ? 'Investigating...' : 'Investigate clue'}
                                    </button>
                                </>
                            )}
                        </article>
                    ))}
                </div>
            </section>

            {/* Hints */}
            <section className="mt-8 rounded-md border border-amber-300/20 bg-stone-800 p-5">
                <h2 className="text-xl font-bold text-amber-300">Hints</h2>
                <p className="text-sm text-amber-50/60">
                    Each new hint costs 10 points. Hints left: {hintsLeft}
                </p>

                {hints.length > 0 && (
                    <ol className="mt-3 space-y-2">
                        {hints.map((hint, index) => (
                            <li key={index} className="rounded border border-amber-300/20 bg-stone-900 p-3 text-sm text-amber-50/90">
                                <span className="font-semibold text-amber-300">Hint {index + 1}: </span>
                                {hint}
                            </li>
                        ))}
                    </ol>
                )}

                <button
                    type="button"
                    onClick={handleHint}
                    disabled={hintBusy || hintsLeft === 0}
                    className="mt-4 rounded border border-amber-300 px-4 py-2 text-sm font-bold uppercase tracking-wide text-amber-300 transition hover:bg-amber-300 hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {hintBusy ? 'Getting hint...' : hintsLeft === 0 ? 'No hints left' : 'Request hint'}
                </button>
            </section>

            {/* Accusation */}
            <div className="mt-8 text-center">
                <Link
                    to={`/case/${id}/accuse`}
                    className="inline-block rounded-md bg-red-900 px-8 py-3 font-bold uppercase tracking-wide text-amber-50 transition hover:bg-red-800"
                >
                    I&apos;m ready to accuse
                </Link>
            </div>
        </main>
    )
}