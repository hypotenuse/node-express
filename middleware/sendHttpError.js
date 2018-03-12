
var isAJAXRequest = function(req) {
	return req.xhr || req.headers['X-Requested-With'] == 'XMLHttpRequest'
}

var prepareStack = function(stack) {
	return '<i>' + stack.replace(/\<\/?anonymous\>/g, '').replace(/(\s+at\s+)(.+?)(?=\s+at\s+|$)/g, '$1<b>$2</b>').replace(/\s+at/g, '<br>$&') + '</i>'
}

module.exports = function(req, res, next) {
	res.sendHttpError = function(error) {
		
		res.status(error.status)

		if (isAJAXRequest(req)) {
			delete error.stack
			res.json({error: error})
		}
		else {
			error.stack = prepareStack(error.stack)
			res.render('pages/error', { message: error.message, error: error })
		}
	}

	next()

}