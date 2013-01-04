/**
 * @overview 
 * @author Daniel Goberitz <daniel.goberitz@laviniainteractiva.com>
 */
(function($){

	window.Client = function(data, id){
		this.id = id;
		this.name = id; // podra cambiarse!
		this.ua = data.ua;
		this.screen = data.screen;
		this.window = data.window; // pa que?
		this.records = {};
		
		var me = this,
			tmp = window.GUI.buildNewClientElements(this.name, this)
		;
		
		this.element = tmp.element;
		this.logger = $('.logger', this.element);
		this.clientInfo = $('.clientInfo', this.element);
		this.prompt = $('.PROMPT', this.element);
		this.tab = tmp.tab;
		
		this.fillInfo();
		this.resize();
		this.promptFnc();
		$(window).resize(function(){
			me.resize();
		})
	};
	
	window.Client.prototype = {
		active: null,
		records: null,
		
		resize: function(){
			this.logger.height(
				this.element.innerHeight() - (
					this.clientInfo.boundHeight() +
					this.prompt.boundHeight()
				)
			);
		},

		fillInfo: function(){
			this.clientInfo.html(
				'<strong>ID:</strong> ' + this.id + '<br/>' +
				'<strong>UserAgent:</strong> ' + this.ua + '<br/>' +
				'<strong>Screen:</strong> ' + this.screen.width + ' x ' + this.screen.height + '<br/>' +
				'<strong>Window:</strong> ' + this.window.width + ' x ' + this.window.height + '<br/>'
			);
		},
		
		newRecord: function(data){
			console.log(this.id, data);
			
			if(undefined === this.records[data.key]){
				this.records[data.key] = new window.Record(data, this);
				this.records[data.key].appendTo(this.logger);
			}else{
				this.records[data.key].setData(data);
			}
		},
		
		_getClassName: function(record){
			
		},
		
		openRecord: function(key, argNum, path){
			window.clientToServer.openRecord(this.id, key, argNum, path);
		},

		newElement: function(msg){
			this.highlight();
			$('<li>')
				.html(msg)
				.appendTo(this.logger)
			;
			var b = this.logger[0];
			b.scrollTop = b.scrollHeight
		},
		
		show: function(){
			this.active = true;
			this.tab
				.removeClass('highlight')
				.addClass('active')
			;
			this.element.addClass('active');
		},
		
		highlight: function(){
			if(this.active !== true){
				this.tab.addClass('highlight');
			}
		},
		
		hide: function(){
			this.active = false;
			this.tab
				.removeClass('highlight')
				.removeClass('active')
			;
			this.element
				.removeClass('active')
			;
		},

		disconnect: function(){
			this.highlight();
			this.newElement('<span style="color:red;font-weight:bold;">DISCONECTED</span>')
		},
		
		promptActivity: null,
		
		promptFnc: function(){
			var me = this;
			
			this.promptActivity = [];
			this.promptAIx = 0;
			
			this.prompt.keyup(function(e){
				if(e.ctrlKey && e.keyCode === 13){
					var code = $(this).val();
					me.pushPA(code);
					me.exec(code);
					$(this).val('');
				}
				if(e.ctrlKey && e.keyCode === 38){
					$(this).val( me.prevPA() );
				}
				if(e.ctrlKey && e.keyCode === 40){
					$(this).val( me.nextPA() );					
				}
			});
		},
		
		exec: function(code){
			window.clientToServer.exec(this.id, code);
		},
		
		pushPA: function(code){
			this.promptAIx = this.promptActivity.push(code) - 1;
		},
		
		prevPA: function(){ // arriba
			if(this.promptAIx < 0){
				this.promptAIx = this.promptActivity.length - 1;
			}
			return this.promptActivity[this.promptAIx--];
		},
		nextPA: function(){ // abajo
			if(this.promptAIx >= this.promptActivity.length){
				this.promptAIx = 0;
			}
			return this.promptActivity[this.promptAIx++];
		}
	};
	
	
}(jQuery));
