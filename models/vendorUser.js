
var async = require('async')
var mongoose = require('../libs/mongoose')
var Schema = mongoose.Schema

var schema = new Schema({
	provider: {
		type: String,
		required: true
	},
	identifier: {
		type: String,
		required: true
	},
	displayName: {
		type: String,
		required: true
	},
	profileImage: {
		type: String,
		required: true
	},
	gender: {
		type: String,
		required: true
	},
	profileUrl: {
		type: String
	}
})

schema.methods.preventProfileImageCaching = function() {

	var nocache = 'nocache=' + String(Math.random()).split('.')[1]

	if (/\?.+$/.test(this.profileImage)) {
		this.profileImage += '&' + nocache
	}
	else if (/\?$/.test(this.profileImage)) {
		this.profileImage += nocache
	}
	else {
		this.profileImage += '?' + nocache
	}

	return this
}

// Если данные пользователя в хранилище не 
// совпадают с данными пользователя в профиле
// обновляем
schema.methods.actualize = function(profile, callback) {
	
	var update = {}
	
	var displayName = this.get('displayName')
	var profileUrl = this.get('profileUrl')
	var profileImage = this.get('profileImage')
	var gender = this.get('gender')
	
	if (displayName != profile.displayName) {
		update.displayName = profile.displayName
	}

	if (gender != profile.gender) {
		update.gender = profile.gender
	}
	
	switch(this.provider) {
		case 'vkontakte':
			if (profileUrl != profile.profileUrl) {
				update.profileUrl = profile.profileUrl
			}
			if (profileImage != profile._json.photo) {
				update.profileImage = profile._json.photo
			}
			break

		case 'google':
			if (profileUrl != profile._json.url) {
				update.profileUrl = profile._json.url
			}
			if (profileImage != profile._json.image.url) {
				update.profileImage = profile._json.image.url
			}
			break

		case 'facebook':
			if (profileUrl != profile._json.link) {
				update.profileUrl = profile._json.link
			}
			if (profileImage != profile._json.picture.data.url) {
				update.profileImage = profile._json.picture.data.url
			}
			break

		case 'odnoklassniki':
			if (profileUrl != profile.profileUrl) {
				update.profileUrl = profile.profileUrl
			}
			if (profileImage != profile._json.pic_1) {
				update.profileImage = profile._json.pic_1
			}
			break
	}

	if (Object.keys(update).length > 0) {
		this.model('VendorUser').findByIdAndUpdate(this.get('_id'), { $set: update }, { new: true }, callback)
	}
	else {
		callback(null, this)
	}
}

schema.statics.findOrCreate = function(profile, callback) {

	var VendorUser = this

	async.waterfall([
		function(callback) {
			VendorUser.findOne()
				.where('provider').equals(profile.provider)
				.where('identifier').equals(profile.id)
				.select('_id provider identifier displayName profileImage gender profileUrl')
				.exec(callback)
		},
		function(user, callback) {
			if (user) {
				user.actualize(profile, callback)
			}
			else {
				var vendorUserArgs = {
					provider: profile.provider,
					identifier: profile.id,
					displayName: profile.displayName,
					gender: profile.gender
				}
				switch(profile.provider) {
					
					case 'vkontakte':
						vendorUserArgs.profileUrl = profile.profileUrl
						vendorUserArgs.profileImage = profile._json.photo
						break

					case 'google':
						vendorUserArgs.profileUrl = profile._json.url
						vendorUserArgs.profileImage = profile._json.image.url
						break
					
					case 'facebook':
						vendorUserArgs.profileUrl = profile._json.link
						vendorUserArgs.profileImage = profile._json.picture.data.url
						break

					case 'odnoklassniki':
						vendorUserArgs.profileUrl = profile.profileUrl
						vendorUserArgs.profileImage = profile._json.pic_1
						break

				}
				new VendorUser(vendorUserArgs).save(function(err, user, affected) {
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

exports.VendorUser = mongoose.model('VendorUser', schema)