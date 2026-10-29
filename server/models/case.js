const mongoose = require('mongoose');

const suspectSchema = new mongoose.Schema(
    {
        id: { type: String, required: true },
        name: { type: String, required: true },
        role: { type: String, required: true },
        description: { type: String, required: true },
        statement: { type: String, required: true },
    },
    { _id: false }
);

const clueSchema = new mongoose.Schema(
    {
        id: { type: String, required: true },
        description: { type: String, required: true },
        relevance: { type: String, required: true },
    },
    { _id: false }
);

// The secret part of the case. Never sent to the browser before the accusation.
const solutionSchema = new mongoose.Schema(
    {
        culpritId: { type: String, required: true },
        explanation: { type: String, required: true },
        supportingClueIds: { type: [String], default: [] },
    },
    { _id: false }
);

const caseSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        premise: { type: String, required: true },
        story: { type: String, required: true },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            required: true,
        },

        suspects: { type: [suspectSchema], default: [] },
        clues: { type: [clueSchema], default: [] },

        // Hidden by default: hints are handed out one at a time by the hint endpoint
        hints: { type: [String], default: [], select: false },

        // Hidden by default: only the accusation endpoint may read this
        solution: { type: solutionSchema, required: true, select: false },

        // Progress is tracked by the server, never trusted from the browser
        playerProgress: {
            discoveredClueIds: { type: [String], default: [] },
            hintsUsed: { type: Number, default: 0 },
        },

        accusation: {
            accusedSuspectId: { type: String, default: null },
            isCorrect: { type: Boolean, default: null },
        },

        score: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ['active', 'completed'],
            default: 'active',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Case', caseSchema);