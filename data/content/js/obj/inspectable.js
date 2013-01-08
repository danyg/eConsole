/**
 * @overview 
 * @author Daniel Goberitz <daniel.goberitz@laviniainteractiva.com>
 */

(function(){

	window.inspectElement = function(label, ulClass, tagName){
		this.label = label;

		if(tagName === undefined){
			tagName = 'div';
		}

		this.element = $('<' + tagName + '>');

		if(label){
			this.element
				.append($('<span class="label">').text(this.label))
			;
		}

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
		
		addChild: function(key, val, className){
			var elm = $('<li>')
				.addClass(className)
				.append(
					$('<span class="label">').text(key)
				)
			;

			if(!(val instanceof window.inspectElement)){
				elm.append($('<span class"value">').text(val));
			}else{
				elm.append(val.getElement());
			}

			elm.appendTo(this.childsPlace);

			return elm;
		},

		_setEvents: function(){
			var me = this;
			this.element.click(function(){
				me._toggle();
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
