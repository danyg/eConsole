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
			this.slider = $('.SLIDER');
			this.scrollBtns = $('.scrollBtns');
			
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
			
			var scrollI, elm = this.slider, step;
			$('.LEFT_SCROLL').mousedown(function(){
				var i = 0;
				step = 5;
				scrollI = setInterval(function(){
					step = step + (i/3);
					i++;
					console.log( elm.scrollLeft() - step )
					elm.scrollLeft( elm.scrollLeft() - step);
				}, 100);
			}).bind('mouseout mouseup blur', function(){
				clearInterval(scrollI);
			});
			$('.RIGHT_SCROLL').mousedown(function(){
				var i = 0;
				step = 5;
				scrollI = setInterval(function(){
					step = step + (i/3);
					i++;
					console.log( elm.scrollLeft() + step )
					elm.scrollLeft( elm.scrollLeft() + step);
				}, 100);
			}).bind('mouseout mouseup blur', function(){
				clearInterval(scrollI);
			});
			
			
			window.emit('gui-ready');
		},
		
		wResize: function(){
			this.consoles.height(
				$(window).height() - 
				this.tabs.boundHeight()
			);
				
			this.slider.width(
				$(window).width() - this.scrollBtns.boundWidth()
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
				.click(function(){
					me.hideAll();
					controller.show();
				})
				.appendTo(this.tabs)
				.disableSelection()
			;
console.log('name', name);
			ret.tab
				.text(name)
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
			try{
			var client = new window.Client(data, id);
			this.clients[id] = client;
			this.clientsCount++;
			
			if(this.clientsCount === 1){
				client.show();
			}
			
			return client;
			}catch(e){
				console.log(e);
			}
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

$.fn.extend({
	enableSelection: function() {
		return this
			.attr('unselectable', 'off')
			.css('MozUserSelect', '')
			.unbind('selectstart.ui');
	},

	disableSelection: function() {
		return this
			.attr('unselectable', 'on')
			.css('MozUserSelect', 'none')
			.bind('selectstart.ui', function() { return false; });
	}
});


}(jQuery));
