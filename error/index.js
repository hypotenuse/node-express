var path = require('path')
var util = require('util')
var http = require('http')

function extend(instance, args, constructor) {
	Error.apply(instance, args)
	Error.captureStackTrace(instance, constructor)
}

function HttpError(status, message) {
	extend(this, arguments, HttpError)
	this.status = status
	this.message = message || http.STATUS_CODES[status] || 'Error'
}

function AuthError(message) {
	extend(this, arguments, AuthError)
	this.message = message
}

util.inherits(HttpError, Error)
util.inherits(AuthError, Error)

HttpError.prototype.name = 'HttpError'
AuthError.prototype.name = 'AuthError'

if (HttpError.prototype.constructor != HttpError) HttpError.prototype.constructor = HttpError
if (AuthError.prototype.constructor != AuthError) AuthError.prototype.constructor = AuthError

exports.HttpError = HttpError
exports.AuthError = AuthError