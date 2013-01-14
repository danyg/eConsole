/**
 * @overview 
 * @author Daniel Goberitz <daniel.goberitz@laviniainteractiva.com>
 */
(function(){
	$(window).bind('app-ready', function(){
		if(window.externalServer !== null){
			var socket = io.connect('http://' + window.externalServer + '/');
			socket.on('welcome', function(){
				socket.emit('clientInfo', {
					eConsole: true
				});
			});
			socket.on('eConsoleExec', function(data){
				window.serverToGUI[data.cmd].apply(window.serverToGUI, data.args);
			});

			if(undefined === window.GUItoServer){
				requirejs(['GUItoExternalServer'], function(GUItoServer){
					GUItoServer.socket = socket;
					window.GUItoServer = GUItoServer;
				})
			}
		}
	});
	

	window.serverToGUI = {
		clients: {},
		newClient: function(data, sID){
			var me = this;
			setTimeout(function(){
				try{
					me.clients[sID] = window.GUI.newClient(data, sID);
				}catch(e){
					console.error(e);
					window.logger.error('Error creando objeto client',data,e);
				}
			}, 1);
		},
		newRecord: function(sID, data){
			var me = this;
			setTimeout(function(){
				if(undefined === me.clients[sID]){
					window.logger.error('Client ID: ' + sID + ' not exists');
					throw 'Client ID: ' + sID + ' not exists';
				}else{
					me.clients[sID].newRecord(data);
				}
			}, 1);
		},
		serverMessage: function(sID, data){
			var me = this;
			setTimeout(function(){
				if(undefined === me.clients[sID]){
					window.logger.error('Client ID: ' + sID + ' not exists');
					throw 'Client ID: ' + sID + ' not exists';
				}else{
					me.clients[sID].serverMessage(data);
				}
			}, 1);
		},
		
		removeClient: function(sID){
			var me = this;
			setTimeout(function(){
				try{
					delete(me.clients[sID]);
				}catch(e){}
			}, 1);
		}
	};


}());
