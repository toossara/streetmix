var compression = require('compression')
var cookieParser = require('cookie-parser')
var cookieSession = require('cookie-session')
var express = require('express')
var assets = require('connect-assets')
var bodyParser = require('body-parser')
var config = require('config')
var controllers = require('./app/controllers')
var resources = require('./app/resources')
var requestHandlers = require('./lib/request_handlers')
var logger = require('./lib/logger')()

if (process.env.NEW_RELIC_LICENSE_KEY) {
  require('newrelic')
}

var app = module.exports = express()

app.locals.config = config

app.use(bodyParser.json())
app.use(compression())
app.use(cookieParser())
app.use(cookieSession({ secret: config.cookie_session_secret }))

app.use(requestHandlers.login_token_parser)
app.use(requestHandlers.request_log)
app.use(requestHandlers.request_id_echo)

app.set('view engine', 'jade')
app.set('views', __dirname + '/app/views')

// Redirect to environment-appropriate domain, if necessary
app.all('*', function (req, res, next) {
  if (config.header_host_port !== req.headers.host) {
    var redirectUrl = 'http://' + config.header_host_port + req.url
    console.log('req.hostname = %s but config.header_host_port = %s; redirecting to %s...', req.hostname, config.header_host_port, redirectUrl)
    res.redirect(301, redirectUrl)
  } else {
    next('route')
  }
})

app.get('/twitter-sign-in', controllers.twitter_sign_in.get)
app.get(config.twitter.oauth_callback_uri, controllers.twitter_sign_in_callback.get)

app.post('/api/v1/users', resources.v1.users.post)
app.get('/api/v1/users/:user_id', resources.v1.users.get)
app.put('/api/v1/users/:user_id', resources.v1.users.put)
app.delete('/api/v1/users/:user_id/login-token', resources.v1.users.delete)
app.get('/api/v1/users/:user_id/streets', resources.v1.users_streets.get)

app.post('/api/v1/streets', resources.v1.streets.post)
app.get('/api/v1/streets', resources.v1.streets.find)
app.head('/api/v1/streets', resources.v1.streets.find)

app.delete('/api/v1/streets/:street_id', resources.v1.streets.delete)
app.head('/api/v1/streets/:street_id', resources.v1.streets.get)
app.get('/api/v1/streets/:street_id', resources.v1.streets.get)
app.put('/api/v1/streets/:street_id', resources.v1.streets.put)

app.post('/api/v1/feedback', resources.v1.feedback.post)

app.get('/api/v1/translate/:locale_code', resources.v1.translate.get)

app.get('/.well-known/status', resources.well_known_status.get)

app.use(assets({
  precompile: ['styles.less', 'app.js']
}))
app.use(express.static(__dirname + '/public'))

// Catch-all
app.use(function (req, res) {
  res.render('main', {})
})
