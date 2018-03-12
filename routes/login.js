
var express = require('express')
var router = express.Router()

router.get('/', require('../middleware/auth/forbidAuthorized'), function(req, res, next) {
	res.render('pages/login', { autherror: req.query.autherror })
})

module.exports = router