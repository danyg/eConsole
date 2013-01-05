//require('test_server')
var logger = require('logger');
var app = module.exports = require('appjs');

app.serveFilesFrom(__dirname + '/content');

var window = app.createWindow({
	width  : 640,
	height : 460,
	icons  : __dirname + '/content/icons'
});

window.on('create', function(){
	logger.info("Window Created");
	window.frame.show();
	window.frame.center();
	// to foot!
});

window.on('ready', function(){
	logger.info("Window Ready");
	window.process = process;
	window.module = module;
	window.logger = logger;

	function F12(e){
		return e.keyIdentifier === 'F12'
	}
	function F5(e){
		return e.keyIdentifier === 'F5'
	}
	function Command_Option_J(e){
		return e.keyCode === 74 && e.metaKey && e.altKey
	}

	window.addEventListener('keydown', function(e){
		if (F12(e) || Command_Option_J(e)) {
			window.frame.openDevTools();
		}
		if(F5(e)){
			stop_io();
			window.location.reload();
		}
	});
	
	window.clientToServer = clientToServer;
	
	new window.Event('app-ready');
	window.on('gui-ready', function(){
		serverToClient = window.serverToClient;
		start_io();
	});
});
var serverToClient;
var clientToServer = {
	exec: function(sID, code){
		try{
			logger.debug('emitiendo a ' + sID + ' exec' );

			io.sockets.socket(sID).emit('exec', {
				code: code
			});
			
			logger.debug('Emitido a' + sID );
		}catch(e){
			logger.error(e);
		}
	},
	openRecord: function(sID, key, argNum, path){
		try{
			io.sockets.socket(sID).emit('openRecord', {
				key: key,
				argNum: argNum,
				path: path || ''
			});
		}catch(e){
			logger.error(e);
		}
	}
};

window.on('close', function(){
	logger.info("Window Closed");
});


process.on('uncaughtException', function(e){
	logger.error(e);
})

socketIO = require('socket.io');
var io;
function start_io(){
	io = socketIO.listen(4040);
	io.sockets.on('connection', function (socket) {
		var clientID;
		//window.GUI.newElement('newClient id:' + socket.id, 'SYSTEM');
		socket.on('clientInfo', function(data){
			try{
				clientID = serverToClient.newClient(data, socket.id);
			}catch(e){
				logger.error(e);
			}
		});

		socket.on('log', function(data){
			try{
				serverToClient.newRecord(socket.id, data);
			}catch(e){
				logger.error(e);
			}
		});
		socket.on('openedRecord', function(data){
			try{
				serverToClient.newRecord(socket.id, data);
			}catch(e){
				logger.error(e);
			}
		});
		socket.on('execReturn', function(data){
			try{
				serverToClient.newRecord(socket.id, data);
			}catch(e){
				logger.error(e);
			}
		});

		socket.emit('welcome');
	//	socket.emit('exec', {code: 'console.log("TESTEANDO!!!")'});

		socket.on('disconnect', function(data){
			logger.log(socket.id + ' desconectado');
		});
	});
}

function stop_io(){
	io.close();
}
