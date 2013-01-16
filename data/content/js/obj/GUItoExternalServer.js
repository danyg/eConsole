/**
 * @overview 
 * @author Daniel Goberitz <daniel.goberitz@laviniainteractiva.com>
 */

define(function(){
	GUItoServer = {
		socket: null,
		exec: function(sID, code){
			var args = Array.prototype.slice.apply(arguments);
			this.socket.emit('eConsoleExec', {
				cmd: 'exec',
				args: args
			});
		},
		openRecord: function(sID, key, argNum, path){
			var args = Array.prototype.slice.apply(arguments);
			this.socket.emit('eConsoleExec', {
				cmd: 'openRecord',
				args: args
			});
		},
		command: function(){
			var args = Array.prototype.slice.apply(arguments);
			this.socket.emit('eConsoleExec', {
				cmd: 'command',
				args: args
			});
		}
	};
	
	return GUItoServer;
});