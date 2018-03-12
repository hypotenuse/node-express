
var HttpError = require('../../error').HttpError

module.exports = function(req, res, next) {
	if (req.session.user || req.user) {
		return next()
	}
	next(new HttpError(401, 'Unauthorized'))
}