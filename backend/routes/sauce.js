const express = require('express');
const router = express.Router();

const sauceCtrl = require('../controllers/sauce');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

router.post('/', auth, multer, sauceCtrl.createThing);
router.put('/:id', auth, multer, sauceCtrl.modifyThing);
router.delete('/:id', auth, sauceCtrl.deleteThing);
router.get('/:id', auth, sauceCtrl.getOneThing);
router.get('/', auth, sauceCtrl.getAllStuff);

module.exports = router;