
var util = require('util')
var User = require('../models/user').User

module.exports = function(req, res, next) {
	if (!util.isNullOrUndefined(req.user)) {
		res.locals.user = req.user
		return next()
	}
	else if (!util.isNullOrUndefined(req.session.user)) {
		User.findById(req.session.user, function(err, user) {
			if (err) {
				return next(err)
			}
			res.locals.user = req.user = user
			next()
		})
	}
	else {
		res.locals.user = req.user = null
		return next()
	}
}