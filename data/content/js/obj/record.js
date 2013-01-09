/**
 * @overview 
 * @author Daniel Goberitz <daniel.goberitz@laviniainteractiva.com>
 */

(function($){

	window.Record = function(data, controller){
		this.controller = controller;
		this.data = data;
		this.key = data.key;
		this.classNamesToData = {};
		this.publisher = new Publisher(this);

		this.element = this.place(this.data, true);
	}
	
	window.Record.prototype = {
		data: null,
		classNamesToData: null,
		myName: 'Record',
		key: null,
		
		on: function(){
			return this.publisher.subscribe.apply(this.publisher, arguments);
		},
		emit: function(){
			return this.publisher.deliver.apply(this.publisher, arguments);
		},

		$: function(selector){
			return $(selector, this.element);
		},
		appendTo: function(selector){
			this.element.appendTo(selector);
		},
		setData: function(data){
			var principal = (data.argNum === undefined && data.path === undefined);
			
			if(!principal){
				this.emit('open_' + data.argNum + '_' + data.path || '', data);
			}else{
				console.group('Esto no deberia pasar, un data princpal en Record::setData');
				console.log(data);
				console.trace(data);
				console.groupEnd(data);
				throw 'Que haces aqui?'
			}

			return this;
		},
		place: function(data){
			var principal = (data.argNum === undefined && data.path === undefined);
			
			if(principal){
				return this._placePrincipal(data);
			}else{
				console.group('Esto no deberia pasar, un data no princpal en Record::place');
				console.log(data);
				console.trace(data);
				console.groupEnd(data);
				throw 'Que haces aqui?'
			}
		},
		
		_placePrincipal: function(data){
			var argNum, argData, elm, list, O, me = this;
			elm = $('<li>')
				.append(
					list = $('<ul class="LinkBar clearfix">')
				)
			;

			if(typeof(data.args) === 'string'){
				this._getSubElement(data.args, 'li', 0)
					.appendTo(list)
				;
			}else{
				for(argNum in data.args){
					if(data.args.hasOwnProperty(argNum)){

						if(typeof(data.args[argNum]) === 'string'){
							this._getSubElement(data.args[argNum], 'li', argNum)
								.appendTo(list)
							;
						}else{
							console.group('RECORD::_placePrincipal ERROR: Se esperaba una string');
							console.log('argNum:', argNum);
							console.log('data:', data);
							console.groupEnd();

							throw 'Se esperaba una string';
						}

					}
				}
			}

			return elm;
		},
		
		_addChilds: function(iElm, data){
			if(typeof(data.args) === 'object'){
				var key, argData, val, args = data.args, path;
				path = data.path === '' ? '' : data.path + '.';
				iElm.cleanChilds();
				for(key in args){
					if(args.hasOwnProperty(key)){
						
						if(typeof(args[key]) === 'string'){
							val = this._getSubElement(args[key], 'div', data.argNum, path + key);
						}else if(typeof(args[key]) === 'object'){
							// prototype data...
							// make inspectElement & addChilds & close!
							val = this._getSubElmentOfObject(args[key], 'div', data.argNum, path + key);
						}

						iElm.addChild(key, val);
					}
				}
			}else{
				console.group('RECORD::_addChilds ERROR: se esperaba un objeto');
				console.log(data);
				console.log(O);
				console.groupEnd();
			}
		},
		
		_getSubElmentOfObject: function(data, tagName, argNum, path){
			var O = new window.inspectElement('Object', typeof(data), '', tagName),
				subO,
				key
			;
			if(undefined !== path && path !== ''){
				path = path + '.';
			}
			for(key in data){
				if(data.hasOwnProperty(key)){
					if(typeof(data[key]) === 'string'){
						O.addChild(key, 
							this._getSubElement(
								data[key], 
								'div', 
								argNum,
								path + key
							)
						);
					}else{
						O.addChild(key, 
							this._getSubElmentOfObject(
								data[key], 
								'div', 
								argNum,
								path + key
							)
						);
					}
				}
			}
			return O.getElement();
		},
		
		_getSubElement: function(arg, tagName, argNum, path){
			if(undefined === path){
				path = '';
			}
			if(undefined === tagName){
				tagName = 'div';
			}
			var argData = this.argToObj(arg), 
				me = this,
				elm
			;
			switch(argData.type){
				case 'object':
				case 'array':
					O = new window.inspectElement(argData.label, argData.type, '', tagName);
					O.onOpen = function(){
						me.sendOpenObj(argNum, path);
					}
					this.on('open_' + argNum + '_' + path, (function(iElm){
						return function(data){
							me._addChilds(iElm, data);
						}
					}(O)));

					elm = O.getElement();
				break;
				case 'function':
					elm = $('<' + tagName + '>')
						.addClass('type_' + argData.type)
						.text(argData.label)
					;
				break;
				case 'number':
				case 'string':
				default:
					elm = $('<' + tagName + '>')
						.addClass('type_' + argData.type)
						.text(argData.label)
					;
			}
			return elm;
		},
		sendOpenObj: function(argNum, path){
			this.controller.openRecord(this.key, argNum, path);
		},
		argToObj: function(argString){
			if(typeof(argString) === 'string'){
				var ret = {
					type: 'object',
					label: 'Object'
				};
				var tmp = argString.split('|#|');
				ret.type = tmp[0];
				ret.label = tmp[1];
				return ret;
			}else{
				console.group('RECORD::argToObj, Se esperaba una string');
				console.log(argString);
				console.trace();
				console.groupEnd();
			}
		}
	};



}(jQuery));
