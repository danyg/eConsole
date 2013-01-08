/**
 * @overview 
 * @author Daniel Goberitz <daniel.goberitz@laviniainteractiva.com>
 */

(function($){

	window.Record = function(data, controller){
		this.controller = controller;
		this.data = data;
		this.classNamesToData = {};
		
		
		var className = this.getClassName(this.data);
		this.element = this.place(this.data, true);
	}
	
	window.Record.prototype = {
		data: null,
		classNamesToData: null,
		$: function(selector){
			return $(selector, this.element);
		},
		getClassName: function(data){
			return this._getClassName(
				data.type,
				data.key,
				data.argNum,
				data.path
			);
		},
		_getClassName: function(type,key,argNum,path){
			var className = type + '_' + key;
			if(argNum){
				className += '_' + argNum;
				if(path){
					className += '_' + path.replace(/\./g, '-');
				}
			}
			this.classNamesToData[className] = {
				key: key,
				argNum: argNum,
				path: path
			};
			return className
		},
		createElement: function(className, principal){
			if(this.element && this.element.hasClass(className)){
				return this.element;
			}
			var me = this;
			var	elm = $('<li>')
					.addClass(className)
					.append(
						principal === true ? $('<ul>').addClass('LinkBar clearfix')
						: $('<ul>') 
					)
				;
				
			if(!principal){
				elm.click(function(e){
					if(!e.isPropagationStopped()){
						me.openObj(className);
					}
					e.stopImmediatePropagation();
					e.stopPropagation();
					e.preventDefault();
					return false;
				})
			}

			return elm;
		},
		appendTo: function(selector){
			this.element.appendTo(selector);
		},
		setData: function(data){
			var className = this.getClassName(data);

			if(this.$('.' + className).length > 0){
				this.$('.' + className).replaceWith( this.place(data) );
			}else{
				throw 'Falta una ruta intermedia? ' + className;
			}
			return this;
		},
		place_alpha: function(data, principal){
			var className = this.getClassName(data),
				elm,
				key,
				O,
				i,
				val
			;
			/*
			 * data: {
			 *	type: // string: recordType (log | returnExec ...)
			 *	key: // int: recordKey
			 *	argNum: // int: recordArgNum numero de argumento, undefined si no es un arg si no todo el bloque
			 *	path: // string:path Path dentro del argumento, undefined si es el arg en si
			 *  args: // valor o valores del argumento
			 * }
			 */

			if('object' === typeof(data.args)){
				if(principal){
					O = new window.inspectElement(null, 'LinkBar clearfix', 'li');
				}else{
					key = this._getKey(data.path);
					O = new window.inspectElement(key);
				}
				
				for(i in data.args){
					if(data.args.hasOwnProperty(i)){
						
						switch(this.typeOfDS(data.args[i])){
							case 'array':
							case 'object':
								val = new window.inspectElement( this.typeOfDS(data.args[i]) );
								
								// on open de esos
								
							break;
							case 'function':
							case 'number':
							case 'string':
								val = this.parseArg(data.args[i]);
							break;
							default: 
								if(typeof( data.args[i] ) === 'object'){
									console.log ( 'no se que hacer con esto', i, data.args[i]);
								}
						}
						
						O.addChild(i, val, className)
						
						// que es ?
						
						
						
						
					}
				}
				
				elm = O.getElement();
			}else{
				if(principal){
					elm = $('<li>').text(data.args)
				}else{
					key = this._getKey(data.path);
					
					elm = $('<li>').text('cunado??? ' + data.args)
				}
			}
			
			
			return elm;
		},
		
		_getKey: function(path){
			if(path){
				return path.split('.').reverse()[0];
			}else{
				return '[NO-KEY]';
			}
		},
		
		place: function(data, principal){
var M = 'place: ';
			var className = this.getClassName(data), subClassName;
			var elm = this.createElement(className,principal), subElm;
			// de donde saca elm?
			var ul = $('ul', elm);
			var i, path, key;

console.log(M, className);
console.log(M, elm[0]);


			if(typeof(data.args) === 'object'){
				// REFACTOR!!!

console.log(M, 'args are object');
				path = (data.path) ? data.path + '.' : '';
				key = path.split('.').reverse()[1];
				if(this.isKey(key)){
					elm.prepend(key);
				}

				for(i in data.args){
					if(data.argNum){
						subClassName = this._getClassName(
							data.type, data.key, data.argNum, path + i
						);
					}else{
						subClassName = this._getClassName(
							data.type, data.key, i
						);
					}
console.log(M, 'subclass ' + subClassName, data.args[i]);
					if(typeof(data.args[i]) === 'object'){
console.log(M, 'subclass ' + subClassName, ' is object');
						subElm = this.place({
							args: data.args[i],
							type: data.key,
							key: data.key,
							argNum: data.argNum,
							path: path + i
						});
					}else{
console.log(M, 'subclass ' + subClassName, ' is string');
						subElm = this.createElement(subClassName);
						subElm.html(
							principal ? this.parseArg( data.args[i] ) : (
								(this.isKey(i) ? i + ': ' : '') +
								this.parseArg( data.args[i] )
							)
						);
					}

					ul.append(subElm);
				}
				
			}else{
				elm.html(this.parseArg( data.args ));
			}
			
console.log(M, elm[0].innerHTML);
			
			return elm;			
		},
		isKey: function(key){
			return key && undefined !== key;
		},
		isNumberKey: function(key){
			return !isNaN(parseInt(key));
		},
		
		openObj: function(className){
			if(undefined !== this.classNamesToData[className]){
				var d = this.classNamesToData[className];
				this.controller.openRecord(d.key, d.argNum, d.path);
			}else{
				throw 'Imposible abrir ' + className;
			}
		},
		
		parseArg: function(a){
			if(typeof(a) === 'string'){
				
				var tmp = a.split('|#|');
				
				if(tmp[1]){
					return '<span class="' + tmp[0] +'">' + tmp[1].replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span>';
				}else{
					return a.replace(/</g, '&lt;').replace(/>/g, '&gt;');
				}
				
			}else{
				console.log('esto no es una string macho', a);
			}
		},
		
		isObject: function(dataSlice){
			return this.typeOfDS(dataSlice) === 'object';
		},
		
		isArray: function(dataSlice){
			return this.typeOfDS(dataSlice) === 'array';
		},
		
		isString: function(dataSlice){
			return this.typeOfDS(dataSlice) === 'string';
		},
		
		isNumber: function(dataSlice){
			return this.typeOfDS(dataSlice) === 'number';
		},
		
		typeOfDS: function(dataSlice){
			if(typeof(dataSlice) === 'string'){
				var tmp = dataSlice.split('|#|');
				return tmp[0];
			}else{
				return false;
			}
			
		}
	};



}(jQuery));
