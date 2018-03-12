var nconf = require('nconf')
var path = require('path')

// Setup nconf to use (in-order):
nconf
	
	// 1. Command-line arguments
	.argv()
	
	// 2. Environment variables
	.env()

	// 3. A file located at current directory
	.file({file: path.join(__dirname, 'config.json')})

module.exports = nconf