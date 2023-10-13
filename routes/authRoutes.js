const { Router } = require('express');
const authController = require('../controllers/authControllers');
const {requireAuth, checkUser} = require('../middleware/authMiddleware');

const router = Router();

router.get('/', authController.index);
// router.get('/refresh', authController.refresh);
router.get('/login', authController.login_get);
router.post('/login', authController.login_post);
router.get('/register', authController.register_get);
router.post('/register', authController.register_post);
router.get('/logout', authController.logout_get);
router.get('/:username/journals', requireAuth, authController.journals_get);
router.post('/:username/journals', requireAuth, authController.journals_post);
router.get('/:username/journals/:journalId', requireAuth, authController.notes_get);
router.get('/:username/journals/:journalId/fetchNotes', requireAuth, authController.fetchNotes_get);
router.post('/:username/journals/:journalId/updateNotes', requireAuth, authController.updateNotes_post);

module.exports = router;
