/**
 * @overview 
 * @author Daniel Goberitz <daniel.goberitz@laviniainteractiva.com>
 */

(function(){

	window.serverToClient = {
		clients: {},
		newClient: function(data, sID){
			var me = this;
			setTimeout(function(){
				me.clients[sID] = window.GUI.newClient(data, sID);
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
		}
	};


}());
