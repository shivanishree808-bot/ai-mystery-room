const express = require('express');
const {
    createCase,
    getCase,
    discoverClue,
    requestHint,
    accuse,
    getResult,
} = require('../controllers/caseController');

const router = express.Router();

router.post('/', createCase);
router.get('/:id', getCase);
router.post('/:id/clues/:clueId/discover', discoverClue);
router.post('/:id/hints', requestHint);
router.post('/:id/accuse', accuse);
router.get('/:id/result', getResult);

module.exports = router;