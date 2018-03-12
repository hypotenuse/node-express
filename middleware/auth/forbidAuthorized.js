
var HttpError = require('../../error').HttpError

module.exports = function(req, res, next) {
	if (req.session.user || req.user) {
		return next(new HttpError(403, 'Forbidden'))
	}
	next()
}