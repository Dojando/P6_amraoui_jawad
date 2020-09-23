const express = require('express');
const router = express.Router();

const sauceCtrl = require('../controllers/sauce');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

router.get('/', auth, sauceCtrl.getAllStuff);
router.get('/:id', auth, sauceCtrl.getOneThing);
router.post('/', auth, multer, sauceCtrl.createThing);
router.put('/:id', auth, multer, sauceCtrl.modifyThing);
router.post('/:id/like', auth, sauceCtrl.likeThing);
router.delete('/:id', auth, sauceCtrl.deleteThing);

module.exports = router;