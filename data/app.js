var logger = require('logger');
var CLIArgs = require('CLIArgs');
require('test_server');

CLIArgs.add('noServer', 'Actuara como consola externa, debe especificarse el argumento server');
CLIArgs.add('server', 'IP o hostname del servidor al ser usado como consola externa', true);
CLIArgs.add('server_port', 'Puerto en el que trabaja el Socket.io del servidor eConsole Remoto', true, '4040');

var GUI = require('GUI');
var Server = require('Server');
// require things

CLIArgs.process();

var initGUI = !CLIArgs.has('noGUI');
var hasServer = !CLIArgs.has('noServer');
var initServer = !initGUI && hasServer;
var extServer = CLIArgs.has('server') + ':' + CLIArgs.has('server_port') ;

if(initGUI && hasServer){
	require('GUItoServer');
}

if(initGUI){
	if(!hasServer){
		GUI.initialize(extServer);
	}else{
		GUI.initialize();
	}

	if(hasServer){
		GUI.on('gui-ready', function(){
			Server.open();
		});
		GUI.on('gui-close', function(){
			Server.close();
		});
	}
}else if(initServer){
	Server.open(); // Inicio Servidor sin importar GUI	
}