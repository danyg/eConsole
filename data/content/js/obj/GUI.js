/**
 * @overview 
 * @author Daniel Goberitz <daniel.goberitz@laviniainteractiva.com>
 */

(function($){

	window.GUI = {
		consoles: null,
		tabs: null,
		tabTmpl: null,
		clientTmpl: null,
		
		clients: null,
		clientsCount: null,
		
		init: function(){
			this.clientsCount = 0;
			this.clients = {};
			
			var me = this,
				tmp
			;
			this.tabs = $('#CLIENTS');
			this.consoles = $('#CLIENTS_CONSOLES');
			tmp = $('.CLIENT_CONSOLE_TEMPLATE')
					.removeClass('CLIENT_CONSOLE_TEMPLATE')
			;

			this.clientTmpl = tmp.clone();
			tmp.remove();

			this.tabTmpl = $('<li class="Tab"></li>');
			
			this.wResize();
			$(window).resize(function(){
				me.wResize();
			});
			
			window.emit('gui-ready');
		},
		
		wResize: function(){
			this.consoles.height(
				$(window).height() - 
				this.tabs.outerHeight()
			);
		},

		buildNewClientElements: function(name, controller){
			var me = this,
				ret = {
					element: null,
					tab: null
				}
			;
			
			ret.element = this.clientTmpl.clone()
				.appendTo(this.consoles)
			;
			
			ret.tab = this.tabTmpl.clone()
				.text(name)
				.click(function(){
					me.hideAll();
					controller.show();
				})
				.appendTo(this.tabs)
			;
			return ret;
		},

		hideAll: function(){
			var id;
			for(id in this.clients){
				if(this.clients.hasOwnProperty(id)){
					this.clients[id].hide();
				}
			}
		},

		newClient: function(data, id){
			var client = new window.Client(data, id);
			this.clients[id] = client;
			this.clientsCount++;
			
			if(this.clientsCount === 1){
				client.show();
			}
			
			return client;
		},

		clientDisconnect: function(id){
			if(undefined !== this.clients[id]){
				this.clients[id].disconnect();
			}
		}
	};
	
	$(window).bind('app-ready', function(){
		window.GUI.init();
	});

	


}(jQuery));
