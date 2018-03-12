var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ port: 8080 })
  , wslist = []
  , initialized = false

console.log('WebSocketServer connected on port 8080')

wss.on('connection', function(ws) {

	wslist.push(ws)
  console.log(wslist.length)

  ws.on('message', function(message) {
    console.log('received: %s', message)
  })

  ws.on('close', function() {
  	console.log('wsc disconnected')
  	for (var wsi = 0; wsi < wslist.length; ++wsi) {
  		if (wslist[wsi] == ws) {
  			return wslist.splice(wsi, 1)
  		}
  	}
  })

  function notificate() {
	  setTimeout(function() {
	  	try {
		  	wslist.forEach(function(ws, index) {
		  		ws.send('CONNECTED WS CLIENTS: ' + wslist.length)
		  	})
		  }
		  catch(exc) {}
	  	
	  	notificate()

	  }, 1000)

	  initialized = true
	}

	if (false == initialized) notificate()

})