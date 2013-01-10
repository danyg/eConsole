/**
 * @overview 
 * @author Daniel Goberitz <daniel.goberitz@laviniainteractiva.com>
 */
(function($){

	window.Client = function(data, id){
		this.id = id;
		this.ua = data.ua;
		this.screen = data.screen;
		this.records = {};
		this.connected = true;
		this.active = false;
		this.name = data.name;
		
		if(this.name === null || this.name === ''){
			this.name = this.id;
		}
		
		var me = this,
			tmp = window.GUI.buildNewClientElements(this.name, this)
		;
		
		this.element = tmp.element;
		this.logger = $('.logger', this.element);
		this.clientInfo = $('.clientInfo', this.element);
		this.prompt = $('.PROMPT', this.element);
		this.tab = tmp.tab;
		this.tab.dblclick(function(){
			me.rename();
		})
		
		this.fillInfo();
		this.resize();
		this.promptFnc();
		$(window).resize(function(){
			me.resize();
		})
		
		if(this.name !== null && this.name !== '' && this.name !== this.id){
			this.setName(this.name, false);
		}
	};
	
	window.Client.prototype = {
		active: null,
		records: null,
		connected: null,
		highlightTimer: null,
		
		resize: function(){
			this.logger.height(
				this.element.innerHeight() - (
					this.clientInfo.boundHeight() +
					this.prompt.boundHeight()
				)
			);
			var Of = this.prompt.outerWidth() - this.prompt.width();
			this.prompt.width( $(window).width() - Of );
		},

		fillInfo: function(){
			this.clientInfo.html(
				'<strong>ID:</strong> ' + this.id + '<br/>' +
				'<strong>UserAgent:</strong> ' + this.ua + '<br/>' +
				'<strong>Screen:</strong> ' + this.screen.width + ' x ' + this.screen.height + '<br/>'
			);
		},
		
		newRecord: function(data){
			this.highlight();
			if(undefined === this.records[data.key]){
				this.records[data.key] = new window.Record(data, this);
				this.records[data.key].appendTo(this.logger);
			}else{
				this.records[data.key].setData(data);
			}
			
			var b = this.logger[0];
			b.scrollTop = b.scrollHeight;
		},
		
		_getClassName: function(record){
			
		},
		
		openRecord: function(key, argNum, path){
			if(this.connected){
				window.GUItoServer.openRecord(this.id, key, argNum, path);
			}
		},

		newElement: function(msg, className){
			$('<li>')
				.addClass(className)
				.html(msg)
				.appendTo(this.logger)
			;
			var b = this.logger[0];
			b.scrollTop = b.scrollHeight
		},
		
		show: function(){
			clearInterval( this.highlightTimer );
			this.active = true;
			this.tab
				.removeClass('highlight')
				.removeClass('highlight2')
				.addClass('active')
			;
			this.element.addClass('active');
		},
		
		rename: function(){
			var text = this.tab.text(),
				input
			;
			this.tab.empty().append(
				input = this._createRenameInput(text)
			);
				
			input
				.focus()
				.select()
			;
		},
		
		_createRenameInput: function(val){
			var me = this;
			return $('<input>')
				.addClass('editField')
				.attr('type', 'text')
				.attr('max', '30')
				.keypress(function(e){
					if(e.keyCode === 13){
						me.setName($(this).val());
					}
				})
				.blur(function(){
					me.setName($(this).val());
				})
				.change(function(){
					me.setName($(this).val());
				})
				.val(val)
			;
		},
		
		setName: function(name, anounce){
			if(undefined === name || name === ''){
				name = this.id;
				if(anounce !== false){
					window.GUItoServer.command(this.id, 'setName', null);
				}
			}else{
				if(anounce !== false){
					window.GUItoServer.command(this.id, 'setName', name);
				}
			}
			this.tab.text(name);
			this.name = name;
		},
		
		highlight: function(){
console.log(this.id, ' highlight');
			if(this.active !== true){
				this.tab.addClass('highlight');

				clearInterval( this.highlightTimer );
				var me = this;
				this.highlightTimer = setInterval(function(){
					me._toggleHighlight();
				}, 500);
				
			}
		},
		
		_toggleHighlight: function(){
			if(this.tab.hasClass('highlight2')){
				this.tab.removeClass('highlight2');
			}else{
				this.tab.addClass('highlight2');
			}
		},
		
		hide: function(){
			this.active = false;
			this.tab
				.removeClass('active')
			;
			this.element
				.removeClass('active')
			;
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
				me.analizePromptRows();

				if(e.ctrlKey && e.keyCode === 38){
					$(this).val( me.prevPA() );
				}
				if(e.ctrlKey && e.keyCode === 40){
					$(this).val( me.nextPA() );					
				}
			});
		},
		
		analizePromptRows: function(){
			var lH = parseInt(this.prompt.css('lineHeight'), 10);
			var rO = parseInt(this.prompt.attr('rows'), 10), rN;
			var m = this.prompt.val().match(/\n/g);
			if(m){
				rN = m.length + 1;
			}else{
				rN = 1;
			}
			
			if((rN * lH) > (this.element.height()/2)){
				rN = parseInt( (this.element.height()/2) / lH);
			}

			if(rN != rO){
				this.prompt
					.attr('rows',rN)
					.height(rN * lH)
				;
				this.resize();
			}
		},
		
		exec: function(code){
			window.GUItoServer.exec(this.id, code);
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
		},
		
		serverMessage: function(msg){
			if(msg === 'DISCONNECT'){
				this.newElement('DISCONNECT','DISCONNECT');
				this.prompt.attr('disabled', 'disabled');
				this.connected = false;
				this.enableClose();
			}
		},
		
		enableClose: function(){
			this.tab.addClass('unactive');
			var me = this;
			this.tab.click(function(e){
				if(e.button === 1 || e.which === 2){
					me.destroy();
				}
			});
		},
		
		destroy: function(){
			this.tab.remove();
			this.element.remove();

			window.serverToGUI.removeClient(this.id);
		}
	};
	
	
}(jQuery));
