/**
 * @overview 
 * @author Daniel Goberitz <daniel.goberitz@laviniainteractiva.com>
 */

(function(){

	window.inspectElement = function(label, type, ulClass, tagName){
		if(undefined === label || label === ''){
			label = 'unknowObject';
		}
		this.label = label;

		if(type === undefined){
			type = 'Object';
		}
		this.type = type;

		if(tagName === undefined){
			tagName = 'div';
		}

		this.element = $('<' + tagName + '>')
			.addClass('inspectable')
		;

		this.element
			.append(
				this.labelElm = $('<span class="label">')
						.addClass('type_' + this.type)
					.text(this.label)
			)
		;

		this.element
			.append(
				this.childsPlace = $('<ul>')
			)
		;
		if(ulClass){
			this.childsPlace.addClass(ulClass)
		}
		
		this._setEvents();
		
		this._foldState = true;
	}
	
	window.inspectElement.prototype = {
		_foldState: null,
		
		$: function(selector){
			return this.$(selector);
		},
		
		appendTo: function(selector){
			this.element.appendTo(selector);
		},
		
		getElement: function(){
			return this.element;
		},
		
		cleanChilds: function(){
			this.childsPlace.empty();
		},
		
		addChild: function(key, val, className){
			var elm = $('<li>')
				.addClass('clearfix')
				.addClass(className)
				.append(
					$('<span class="label key">').text(key)
				)
			;

			if(!(val instanceof window.inspectElement)){
				elm.append(val);
			}else{
				elm.append(val.getElement());
			}

			elm.appendTo(this.childsPlace);

			return elm;
		},

		_setEvents: function(){
			var me = this;
			this.labelElm.click(function(e){
				if(!e.isPropagationStopped()){
					me._toggle();
				}
				e.stopImmediatePropagation();
				e.stopPropagation();
				e.preventDefault();
				return false;
			});
		},
		
		_toggle: function(){
			if(this._foldState){
				this.open();
				this._foldState = false;
			}else{
				this.close();
				this._foldState = true;
			}
		},
		
		open: function(){
			this.childsPlace.show();
			this.onOpen();
		},
		close: function(){
			this.childsPlace.hide();
		}
	};
}());
