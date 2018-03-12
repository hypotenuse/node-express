
var express = require('express')
var router = express.Router()
var util = require('util')
var HttpError = require('../error').HttpError
var OID = require('mongodb').ObjectID
var User = require('../models/user').User

router.get('/', function(req, res, next) {
	var IEE = /\bEdge/i.test(req.headers['user-agent'])
	res.append('Content-Type', 'text/plain; charset=utf-8')
	res.status(200)
	if (IEE) {
		res.send('Вы используете IE Edge.')
	}
	else {
		res.send('Вы не используете IE Edge.')
	}

})

router.get('/get', function(req, res, next) {
	User.find({}).select('_id username created').exec(function(err, users) {
		if (err) {
			return next(err)
		}
		else {
			res.status(200).json(users)
		}
	})
})

router.get('/get/:userid', function(req, res, next) {
	try { 
		new OID(req.params.userid)
	} 
	catch(ex) {
		return next(404)
	}
	User.findById(req.params.userid, function(err, user) {
		if (err) {
			return next(err)
		}
		else {
			if (util.isNull(user)) {
				next(new HttpError(404, 'User not found'))
			}
			else {
				res.status(200).json(user)
			}
		}
	})
})

module.exports = router
