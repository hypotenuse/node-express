var express = require('express')

var session = require('express-session')
var MongoStore = require('connect-mongo')(session)

var mongoose = require('./libs/mongoose')
var path = require('path')
var util = require('util')
var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var config = require('./config')
var HttpError = require('./error').HttpError
var errorhandler = require('errorhandler')({log: false})

var VendorUser = require('./models/vendorUser').VendorUser

var passport = require('passport')
var GoogleOAuth2Strategy = require('passport-google-oauth').OAuth2Strategy
var VKontakteStrategy = require('passport-vkontakte').Strategy
var FacebookStrategy = require('passport-facebook').Strategy
var OdnoklassnikiStrategy = require('passport-odnoklassniki').Strategy

var app = express()

passport.use(new GoogleOAuth2Strategy({
  clientID: config.get('auth:google:clientID'),
  clientSecret: config.get('auth:google:clientSecret'),
  callbackURL: config.get('auth:google:callbackURL')
}, 
function(accessToken, refreshToken, profile, done) {
  if (util.isNullOrUndefined(profile.gender) == false) {
    VendorUser.findOrCreate(profile, function(err, user) {
      done(err, user)
    })
  }
  else {
    done(void 0, {_id: 'nostore', authErrorType: 'nogender'})
  }
}))

passport.use(new OdnoklassnikiStrategy({
  clientID: config.get('auth:ok:clientID'),
  clientPublic: config.get('auth:ok:clientPublic'),
  clientSecret: config.get('auth:ok:clientSecret'),
  callbackURL: config.get('auth:ok:callbackURL')
},
function(accessToken, refreshToken, profile, done) {
  if (util.isNullOrUndefined(profile.gender) == false) {
    VendorUser.findOrCreate(profile, function(err, user) {
      done(err, user)
    })
  }
  else {
    done(void 0, {_id: 'nostore', authErrorType: 'nogender'})
  }
}))

// instagram (approval), 
// yandex, 
// mail, 
// ok (default icon), 
// skype

passport.use(new VKontakteStrategy({
  clientID: config.get('auth:vk:clientID'),
  clientSecret: config.get('auth:vk:clientSecret'),
  callbackURL: config.get('auth:vk:callbackURL')
},
function(accessToken, refreshToken, profile, done) {
  if (util.isNullOrUndefined(profile.gender) == false) {
    VendorUser.findOrCreate(profile, function(err, user) {
      done(err, user)
    })
  }
  else if (util.isString(profile.deactivated)) {
    done(void 0, {_id: 'nostore', authErrorType: profile.deactivated}) // deleted или banned
  }
  else if (profile.hidden == 1) {
    done(void 0, {_id: 'nostore', authErrorType: 'hidden'})
  }
  else {
    done(void 0, {_id: 'nostore', authErrorType: 'nogender'})
  }
}))

passport.use(new FacebookStrategy({
  clientID: config.get('auth:facebook:clientID'),
  clientSecret: config.get('auth:facebook:clientSecret'),
  callbackURL: config.get('auth:facebook:callbackURL'),
  profileFields: config.get('auth:facebook:profileFields').split(',')
},
function(accessToken, refreshToken, profile, done) {
  if (util.isNullOrUndefined(profile.gender) == false) {
    VendorUser.findOrCreate(profile, function(err, user) {
      done(err, user)
    })
  }
  else {
    done(void 0, {_id: 'nostore', authErrorType: 'nogender'})
  }
}))

passport.serializeUser(function(user, done) {
  done(void 0, user._id)
})

passport.deserializeUser(function(_id, done) {
  VendorUser.findById(_id, function(err, user) {
    done(err, user.preventProfileImageCaching())
  })
})

app.engine('ejs', require('ejs-mate'))

app.set('views', path.join(__dirname, 'views'))

app.set('view engine', 'ejs')

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'images', 'logo', 'favicon.ico')))

if ('development' == app.get('env')) {
  app.use(logger('dev'))
}
else {
  app.use(logger(':remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms'))
}

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({ extended: false }))

app.use(cookieParser())

app.use(session({
  secret: config.get('session:secret'),
  name: config.get('session:name'),
  cookie: config.get('session:cookie'),
  rolling: true,
  saveUninitialized: true,
  resave: false,
  store: new MongoStore({ 
    mongooseConnection: mongoose.connection,
    collection: config.get('session:store:collection')
  })
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(require('./middleware/sendHttpError'))
app.use(require('./middleware/sessionUser'))

app.use(express.static(path.join(__dirname, 'public')))

app.use('/', require('./routes/index'))
app.use('/users', require('./routes/users'))
app.use('/chat', require('./routes/chat'))
app.use('/login', require('./routes/login'))
app.use('/logout', require('./routes/logout'))

app.use('/auth/google', require('./routes/auth/google'))
app.use('/auth/vk', require('./routes/auth/vk'))
app.use('/auth/facebook', require('./routes/auth/facebook'))
app.use('/auth/ok', require('./routes/auth/ok'))

app.use(function(req, res, next) {
  next(404)
})

app.use(function(err, req, res, next) {
  if (util.isNumber(err)) {
    err = new HttpError(err)
  }
  if (err instanceof HttpError) {
    res.sendHttpError(err)
  }
  else {
    if (app.get('env') == 'development' && !req.xhr) {
      errorhandler(err, req, res, next)
    }
    else {
      // winston? log.error(err)
      res.sendHttpError(new HttpError(500))
    }
  }
})

module.exports = app
