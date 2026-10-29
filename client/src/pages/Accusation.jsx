import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getCase, accuse, getErrorMessage } from '../services/api.js'

export default function Accusation() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [caseData, setCaseData] = useState(null)
    const [selectedId, setSelectedId] = useState(null)
    const [confirming, setConfirming] = useState(false)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [submitError, setSubmitError] = useState('')

    // Load the suspects when the page opens
    useEffect(() => {
        let cancelled = false

        async function load() {
            try {
                const data = await getCase(id)
                if (cancelled) return

                // A finished case cannot be accused again
                if (data.status === 'completed') {
                    navigate(`/case/${id}/result`, { replace: true })
                    return
                }
                setCaseData(data)
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

    async function handleSubmit() {
        if (submitting || !selectedId) return
        setSubmitError('')
        setSubmitting(true)

        try {
            await accuse(id, selectedId)
            navigate(`/case/${id}/result`)
        } catch (err) {
            // 409 means the case was already completed, so just show the result
            if (err.response && err.response.status === 409) {
                navigate(`/case/${id}/result`)
                return
            }
            setSubmitError(getErrorMessage(err))
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <main className="mx-auto max-w-4xl px-4 py-10">
                <p className="text-amber-300">Gathering the suspects...</p>
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

    const selectedSuspect = caseData.suspects.find((s) => s.id === selectedId)

    return (
        <main className="mx-auto max-w-4xl px-4 py-8">
            <Link to={`/case/${id}`} className="text-sm text-amber-300/80 hover:text-amber-300">
                &larr; Back to the investigation
            </Link>

            <h1 className="mt-4 text-3xl font-bold text-amber-300">Who did it?</h1>
            <p className="mt-2 text-amber-50/70">
                {caseData.title}. Choose the suspect you believe is guilty. You get only one accusation.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {caseData.suspects.map((suspect) => {
                    const selected = suspect.id === selectedId
                    return (
                        <button
                            key={suspect.id}
                            type="button"
                            onClick={() => {
                                setSelectedId(suspect.id)
                                setConfirming(false)
                                setSubmitError('')
                            }}
                            disabled={submitting}
                            aria-pressed={selected}
                            className={`rounded-md border p-4 text-left transition ${selected
                                    ? 'border-amber-300 bg-red-950/60'
                                    : 'border-amber-300/20 bg-stone-800 hover:border-amber-300/60'
                                } disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                            <h2 className="text-lg font-semibold text-amber-300">{suspect.name}</h2>
                            <p className="text-sm text-amber-50/60">{suspect.role}</p>
                            <p className="mt-3 text-sm text-amber-50/80">{suspect.description}</p>
                            <p className="mt-3 border-l-2 border-amber-300/50 pl-3 text-sm italic text-amber-50/90">
                                &ldquo;{suspect.statement}&rdquo;
                            </p>
                            {selected && (
                                <p className="mt-3 text-xs font-bold uppercase tracking-wide text-amber-300">
                                    Selected
                                </p>
                            )}
                        </button>
                    )
                })}
            </div>

            {submitError && (
                <div role="alert" className="mt-6 rounded-md border border-red-400/50 bg-red-950/60 p-3 text-sm text-red-200">
                    {submitError}
                </div>
            )}

            <div className="mt-8">
                {!confirming ? (
                    <button
                        type="button"
                        onClick={() => setConfirming(true)}
                        disabled={!selectedId}
                        className="w-full rounded-md bg-red-900 px-6 py-3 font-bold uppercase tracking-wide text-amber-50 transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                        Submit accusation
                    </button>
                ) : (
                    <div className="rounded-md border border-amber-300/50 bg-stone-800 p-5">
                        <p className="text-amber-50">
                            Are you sure you want to accuse{' '}
                            <span className="font-bold text-amber-300">{selectedSuspect?.name}</span>? You
                            cannot change your answer afterward.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="rounded-md bg-amber-300 px-6 py-2 font-bold uppercase tracking-wide text-stone-900 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {submitting ? 'Submitting...' : 'Yes, accuse'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setConfirming(false)}
                                disabled={submitting}
                                className="rounded-md border border-amber-300/60 px-6 py-2 font-bold uppercase tracking-wide text-amber-300 transition hover:bg-amber-300/10 disabled:opacity-60"
                            >
                                Go back
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}