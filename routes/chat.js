var express = require('express')
var router = express.Router()

router.get('/', require('../middleware/auth/forbidUnauthorized'), function(req, res, next) {

	res.append('Cache-Control', 'no-store')
	res.append('Pragma', 'no-cache')

  res.render('pages/chat', { user: req.user })
})

module.exports = router
