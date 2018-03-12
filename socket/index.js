
module.exports = function(sio) {
	sio.on('connection', function(socket) {

	  socket.on('broadcast', function(message) {
	    sio.emit('broadcast', message)
	  })

	  socket.on('disconnect', function() {
	    console.log('user disconnected')
	  })
	})
}