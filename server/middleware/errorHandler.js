// Catches every error and sends a safe message.
// It never leaks stack traces, API keys or database details.
function errorHandler(error, req, res, next) {
    console.error('Error:', error.message);

    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Request body is not valid JSON' });
    }

    // 502 and 503 come from our AI service and have friendly messages
    if (error.status === 502 || error.status === 503) {
        return res.status(error.status).json({ error: error.message });
    }

    res.status(500).json({ error: 'Something went wrong on the server' });
}

module.exports = errorHandler;