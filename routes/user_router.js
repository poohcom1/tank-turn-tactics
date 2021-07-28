const { getUser } = require("../controllers/UserController.js");
router = require('express').Router()

router.get('/', getUser)

module.exports = router;