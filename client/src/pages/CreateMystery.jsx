import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createCase, getErrorMessage } from '../services/api.js'

const DIFFICULTIES = [
    { value: 'easy', label: 'Easy', detail: '3 suspects, 5 clues, 2 hints', bonus: 100 },
    { value: 'medium', label: 'Medium', detail: '4 suspects, 7 clues, 3 hints', bonus: 150 },
    { value: 'hard', label: 'Hard', detail: '5 suspects, 9 clues, 3 hints', bonus: 200 },
]

const MIN_LENGTH = 10
const MAX_LENGTH = 300

export default function CreateMystery() {
    const navigate = useNavigate()
    const [premise, setPremise] = useState('')
    const [difficulty, setDifficulty] = useState('easy')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(event) {
        event.preventDefault()
        if (loading) return

        const trimmed = premise.trim()
        if (trimmed.length < MIN_LENGTH) {
            setError(`Please describe your mystery in at least ${MIN_LENGTH} characters.`)
            return
        }
        if (trimmed.length > MAX_LENGTH) {
            setError(`Please keep your premise under ${MAX_LENGTH} characters.`)
            return
        }

        setError('')
        setLoading(true)

        try {
            const newCase = await createCase(trimmed, difficulty)
            navigate(`/case/${newCase.caseId}`)
        } catch (err) {
            setError(getErrorMessage(err))
            setLoading(false)
        }
    }

    return (
        <main className="mx-auto max-w-2xl px-4 py-10">
            <Link to="/" className="text-sm text-amber-300/80 hover:text-amber-300">
                &larr; Back to home
            </Link>

            <h1 className="mt-4 text-3xl font-bold text-amber-300 sm:text-4xl">
                Open a new case
            </h1>
            <p className="mt-2 text-amber-50/70">
                Describe the crime and choose how hard it should be. Our AI detective
                agency will write the case for you.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-8">
                <div>
                    <label htmlFor="premise" className="block text-sm font-semibold uppercase tracking-wide text-amber-300">
                        Mystery premise
                    </label>
                    <textarea
                        id="premise"
                        value={premise}
                        onChange={(e) => setPremise(e.target.value)}
                        disabled={loading}
                        rows={4}
                        maxLength={MAX_LENGTH}
                        placeholder="A priceless painting disappeared from a museum during a private exhibition."
                        className="mt-2 w-full rounded-md border border-amber-300/30 bg-stone-800 p-3 text-amber-50 placeholder:text-amber-50/40 focus:border-amber-300 focus:outline-none disabled:opacity-60"
                    />
                    <p className="mt-1 text-right text-xs text-amber-50/50">
                        {premise.length} / {MAX_LENGTH}
                    </p>
                </div>

                <fieldset disabled={loading}>
                    <legend className="block text-sm font-semibold uppercase tracking-wide text-amber-300">
                        Difficulty
                    </legend>
                    <div className="mt-2 grid gap-3 sm:grid-cols-3">
                        {DIFFICULTIES.map((option) => {
                            const selected = difficulty === option.value
                            return (
                                <label
                                    key={option.value}
                                    className={`cursor-pointer rounded-md border p-4 transition ${selected
                                            ? 'border-amber-300 bg-red-950/60'
                                            : 'border-amber-300/20 bg-stone-800 hover:border-amber-300/60'
                                        } ${loading ? 'opacity-60' : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="difficulty"
                                        value={option.value}
                                        checked={selected}
                                        onChange={() => setDifficulty(option.value)}
                                        className="sr-only"
                                    />
                                    <span className="block text-lg font-semibold text-amber-300">
                                        {option.label}
                                    </span>
                                    <span className="mt-1 block text-sm text-amber-50/70">
                                        {option.detail}
                                    </span>
                                    <span className="mt-2 block text-xs text-amber-50/50">
                                        Correct answer bonus: {option.bonus}
                                    </span>
                                </label>
                            )
                        })}
                    </div>
                </fieldset>

                {error && (
                    <div role="alert" className="rounded-md border border-red-400/50 bg-red-950/60 p-4 text-sm text-red-200">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md bg-amber-300 px-6 py-3 font-bold uppercase tracking-wide text-stone-900 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? 'Analyzing the evidence...' : 'Generate my case'}
                </button>

                {loading && (
                    <p className="text-center text-sm text-amber-50/70">
                        Preparing your case. This can take up to 30 seconds.
                    </p>
                )}
            </form>
        </main>
    )
}