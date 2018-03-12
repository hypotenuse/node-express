var express = require('express')
var passport = require('passport')
var router = express.Router()

router.get('/', passport.authenticate('facebook', {
	scope: ['public_profile']
}))

router.get('/callback', passport.authenticate('facebook', {failureRedirect: '/login?autherror=internal'}), function(req, res, next) {

	console.log(req.user)

	if ('nostore' == req.user._id) {
		
		var authErrorType = req.user.authErrorType
		req.logout()

		if ('nogender' == authErrorType) {
			res.redirect('/login?autherror=nogender')
		}
	}
	else {
		res.redirect('/chat')
	}

})

module.exports = router
