var logger = require('logger');
var CLIArgs = require('CLIArgs');
require('test_server');

CLIArgs.add('noGUI', 'Si se pasa este parametro, solo se actuara como servidor, esperando consolas externas.');
CLIArgs.add('noServer', 'Actuara como consola externa, debe especificarse el argumento server');
CLIArgs.add('server', 'IP o hostname del servidor al ser usado como consola externa', true);
CLIArgs.add('server_port', 'Puerto en el que trabaja el Socket.io del servidor eConsole Remoto', true);

require('GUItoServer');
var GUI = require('GUI');
var Server = require('Server');
// require things

CLIArgs.process();

if(!CLIArgs.has('noGUI')){
	GUI.initialize();
}
// SERVER SI, CLI NO, inicio server
if(!CLIArgs.has('noServer') && CLIArgs.has('noCLI')){
	Server.open();
}
// SERVER SI, CLI SI, espero a CLI OK para iniciar server
if(!CLIArgs.has('noServer') && !CLIArgs.has('noCLI')){
	GUI.on('gui-ready', function(){
		Server.open();
	});
	GUI.on('gui-close', function(){
		Server.close();
	});
}
// clientToServer | serverToClient !!!
/*
logger.debug('port: ', CLIArgs.has('port'));
logger.debug('testserver: ', CLIArgs.has('testserver'));
logger.debug('testserver_port: ', CLIArgs.has('testserver_port'));
logger.debug('devtools: ', CLIArgs.has('devtools'));
logger.debug('noGUI: ', CLIArgs.has('noGUI'));
logger.debug('noServer: ', CLIArgs.has('noServer'));
logger.debug('server: ', CLIArgs.has('server'));
logger.debug('server_port: ', CLIArgs.has('server_port'));

process.exit();
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
// GUIToServer
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
*/