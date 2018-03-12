var express = require('express')
var passport = require('passport')
var router = express.Router()

router.get('/', passport.authenticate('google', {
	scope: ['https://www.googleapis.com/auth/userinfo.profile']
}))

router.get('/callback', passport.authenticate('google', {failureRedirect: '/login?autherror=internal'}), function(req, res, next) {

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
