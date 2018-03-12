
var crypto = require('crypto')
var mongoose = require('../libs/mongoose')
var async = require('async')
var Schema = mongoose.Schema
var AuthError = require('../error').AuthError

var schema = new Schema({
	username: {
		type: String,
		unique: true,
		required: true
	},
	hpassword: {
		type: String,
		required: true
	},
	salt: {
		type: String,
		required: true
	},
	created: {
		type: Date,
		default: Date.now
	}
})

schema.methods.encryptPassword = function(password) {
	return crypto.createHmac('sha1', this.salt).update(password).digest('hex')
}

schema.methods.checkPassword = function(password) {
	return this.encryptPassword(password) === this.hpassword
}

schema.virtual('password').set(function(password) {
	this.salt = String(Math.random())
	this.hpassword = this.encryptPassword(password)
})

schema.statics.authorize = function(username, password, callback) {
	var User = this
	async.waterfall([
		function(callback) {
			User.findOne({ username: username }).select('_id hpassword salt').exec(callback)
		},
		function(user, callback) {
			if (user) {
				if (user.checkPassword(password)) {
					callback(null, user)
				}
				else {
					callback(new AuthError('INCORRECT_PASSWORD'))
				}
			}
			else {
				(new User({username: username, password: password})).save(function(err, user, affected) {
					if (err) {
						callback(err)
					}
					else {
						callback(null, user)
					}
				})
			}
		}
	], callback)
}

exports.User = mongoose.model('User', schema)