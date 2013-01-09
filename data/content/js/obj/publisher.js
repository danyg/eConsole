/**
 * @overview	Clase Publisher
 * @description		Clase que permite implementar el patron Observador. Define
 *					una clase Publisher instanciable, que provee metodos para
 *					subscribir, entregrar y desubscribir un mensaje.
 * @author			Daniel Goberitz <daniel.goberitz@laviniainteractiva.com>
 * @package			MVC
 */

/*jslint white: true, nomen: true, plusplus: true, maxerr: 999, maxlen: 82, 
 indent: 4, browser: true, devel: true*/
/*globals MVC,jQuery*/

var Publisher;
(function(){
	
	"use strict";
	
	/**
	 * @inner 
	 * @name genUID
	 * @description Genera un identificador unico basado en el timestamp.
	 * Esta preparado para ser llamado en un bucle y nunca devolvera el mismo
	 * numero.
	 * Es probable que en ordenadores distintos se genere el mismo id, no es
	 * seguro utilizar esta funcion para identificar usuarios por ejemplo.
	 *
	 * @memberof Publisher
	 *
	 * @return {String}
	 */
	function genUID(){
		var p = new Date();
		if('undefined' === typeof(genUID.counter)){
			genUID.counter = 0;
		}

		return (p.getTime() + (++genUID.counter)).toString();
	}

	/**
	 * @constructor Publisher
	 * @param [{Object}] owner	Objeto que utiliza este publisher. OPCIONAL!
	 */
	Publisher = function(owner){
		this.messages = {};
		this.messagesLive = {};
		this.delivered = {};
		this.owner = owner;
	};

	Publisher.prototype = /** @lends Publisher.prototype */{
		/**
		 * @type {Object}
		 * @description Guarda que mensajes fueron entregados y cuantas veces.
		 */
		delivered: null,
		
		msgDelivering: null,

		/**
		 * @description Guarda como registro que el msg fue entregado, y acumula 
		 * cuantas veces se emitio este mensaje, si se esta en modo debug genera
		 * un grupo con el nombre del mensaje y un stack trace.
		 * 
		 * @param {String}	msg		Mensaje que ha sido entregado.
		 * 
		 * @return {Publisher}
		 */
		_setDelivered: function(){
			if('undefined' === typeof(this.delivered[ this.msgDelivering ])){
				this.delivered[ this.msgDelivering ] = 0;
			}
			this.delivered[ this.msgDelivering ]++;

			return this;
		},

		/**
		 * @description Subscribe la function al mensaje dado, Tambien se puede 
		 * agregar un contexto que se retornara en el this cuando se llame a la 
		 * funcion.
		 * 
		 * @param {String}	  msg		Mensaje/Evento al cual se suscribira/
		 *								escuchara
		 * @param {function}  fnc		Callback que se ejecutara cuando se 
		 *								entrege el 
		 *								mensaje / dispare el evento.
		 * @param {Object}	  [ctx]		Contexto, objecto que se utilizara 
		 *								como this al llamar a fnc. Este 
		 *								parametro es opcional.
		 *								
		 * @return {Publisher}
		 */
		subscribe: function(msg, fnc, ctx){
			// Compruebo que se haya pasado una funcion
			if('function' !== typeof(fnc)){
				throw 'Publisher.subscribe: The fnc parameter must be a ' + 
					'funciton';
			}

			var guid = '';

			// si la funcion no tiene un subscriptorID le creo uno
			if('undefined' === typeof(fnc.__sId__)){
				fnc.__sId__ = genUID();
			}

			// Preparo el guid con el id de la funcion por el momento, si no
			// hubiera contexto este sera el guid.
			guid += fnc.__sId__;
			
			fnc.observing = true;
			if(undefined === fnc.observingIn){
				fnc._observingIn = 1;
			}else{
				fnc._observingIn++;
			}
			

			// Si el contexto es un objeto, o sea un contexto valido ...
			if('object' === typeof(ctx)){
				// si no tiene subscriptorID le creo uno
				if('undefined' === typeof(ctx.__sId__)){
					ctx.__sId__ = genUID();
				}

				// ahora el guid es el guid correspondiente al tandem sid de
				// funcion y de contexto, por lo tanto este tandem sera unico.
				guid += '+' + ctx.__sId__;
			}

			// Si la lista de callback asociados a este mensaje/evento no esta 
			// inicializada, la inicializo.
			if('undefined' === typeof(this.messages[msg])){
				this.messages[msg] = {};
			}

			// Asocio la funcion o funcion-contexto solo si no se habia asociado 
			// previamente
			if('undefined' === typeof(this.messages[msg][guid])){
				this.messages[msg][guid] = [fnc,ctx];
			}
			
			if(this.messagesLive[msg]){
				this.deliver.apply(this, this.messagesLive[msg]);
			}

			return this;
		},

		/**
		 * @description Desubscribe/unbind/desasocia una funcion o 
		 * funcion-contexto a un mensaje/evento
		 * 
		 * @param {String}	  msg		Mensaje/Evento al cual se dessuscribira
		 * @param {function}  fnc		Callback que se envio al subscribe
		 * @param {Object}    [ctx]		Contexto, que se envio al subscribe
		 * @param {Boolean}		[throwError] Sharap!
		 * 
		 * @thorwable
		 * @return {Publisher}
		 */
		unsubscribe: function(msg, fnc, ctx, throwError){
			if(undefined === throwError){
				throwError = true;
			}
			var guid = '';
//try{
			// Si la funcion no tiene un subscriptorID significa que no esta
			// subscripta a ningun mensaje/evento
			if('undefined' === typeof(fnc.__sId__)){
				if(throwError){
					throw 'Publisher.unsubscribe: The function not observes ' +
						'anything';
				}
			}

			guid += fnc.__sId__;

			if('object' === typeof(ctx)){
				// Si el contexto no tiene un subscriptorID significa que no
				// esta subscripta a ningun mensaje/evento
				if('undefined' === typeof(ctx.__sId__)){
					if(throwError){
						throw 'Publisher.unsubscribe: The tandem function'+
							'/context not observes anything';
					}
				}

				guid += '+' + ctx.__sId__;
			}

			// Si la lista de callbacks de este mensaje/evento esta vacia, 
			// significa que no tiene nada subscripto por lo tanto lo que se 
			// pide desubscribir no puede ser desubscripto.
			if('undefined' === typeof(this.messages[msg])){
				if(throwError){
					throw 'Publisher.unsubscribe: the message "' + msg + 
						'" have not subscribers to unsubscribe';
				}
			}else{
				// Si lo que se esta pidiendo desubscribir no esta en la lista,
				// es un error.
				if('undefined' === typeof(this.messages[msg][guid])){
					if(throwError){
						throw 'Publisher.unsubscribe: The passed parameters' +
							' has not subscribed to the message "' + msg + '"';
					}
				}else{
					// Por fin todo esta correcto y elimino el callback de la
					// lista de callbacks para este mensaje/evento
					delete(this.messages[msg][guid]);
				}
			}
			
			fnc._observingIn--;
			if(fnc._observingIn >= 0){
				fnc.observing = false;
				fnc._observingIn = 0;
			}
			return this;
		},

		/**
		 * @description Subscribe la function al mensaje dado, solo la proxima 
		 * vez que ocurra.
		 * Tambien se puede agregar un contexto que se retornara en el this 
		 * cuando se llame a la funcion.
		 * 
		 * @param {String}	  msg		Mensaje/Evento al cual se dessuscribira
		 * @param {function}  fnc		Callback que se envio al subscribe
		 * @param {Object}    [ctx]		Contexto, que se envio al subscribe
		 * 
		 * @return {Publisher}
		 */
		subscribeOnce: function(msg, fnc, ctx){
			var F, 
				PUB = this
			;

			F = function(){
				PUB.unsubscribe(msg, F, ctx);
				try{
					fnc.apply(this, arguments);
				}catch(e){
					PUB.explainError(e);
					PUB._onError(e, fnc, ctx);
				}
			};

			this.subscribe(msg, F, ctx);
		},

		/**
		 * @description Envia un mensaje / Dispara un evento.
		 * Ejecuta la lista de callbacks para este mensaje/evento si los hubiera
		 * 
		 * @param {String}	  msg		Mensaje/Evento al cual se suscribira/
		 *								escuchara.
		 * @param {mix}		  [argN]	Se puede enviar tantos argumentos como 
		 *								se requiera.
		 *								
		 * @return {Publisher}
		 */
		deliver: function(){
			// Quito el primer parametro que es el mensaje/evento y me quedo con
			// la lista de argumentos que se pretende enviar a los subscriptores
			var msg = Array.prototype.splice.apply(arguments,[0,1]).toString(),
				guid,
				fnc,
				ctx
			;
//			this.messagesLive[msg] = false; // why?
			this.msgDelivering = msg;
			this._setDelivered();

			// Compruebo que se haya pasado el mensaje/evento
			if('undefined' === typeof(msg)) {
				throw 'Publisher.deliver: You must pass a msg parameter';
			}
			// Si tengo callbacks las ejecuto.
			if('undefined' !== typeof(this.messages[msg])){
				for(guid in this.messages[msg]){
					if(this.messages[msg].hasOwnProperty(guid)){
						fnc = this.messages[msg][guid][0];
						ctx = this.messages[msg][guid][1];
						try{
							fnc.apply(ctx, arguments);
						}catch(e){
							this.explainError(e);
							this._onError(e, fnc, ctx);
						}
					}
				}
			}
			return this;
		},
		
		/**
		 * @description Envia un mensaje / Dispara un evento.
		 * Ejecuta la lista de callbacks para este mensaje/evento si los hubiera
		 * Y guarda este mensaje con sus parametros para ser entregado en una 
		 * futura subscripcion. Por lo que si se hace un deliverLive y luego una
		 * subscripcion quien se subscriba recibira la informacion enviada 
		 * previamente.
		 * 
		 * @param {String}	  msg		Mensaje/Evento al cual se suscribira/
		 *								escuchara.
		 * @param {mix}		  [argN]	Se puede enviar tantos argumentos como 
		 *								se requiera.
		 *								
		 * @return {Publisher}
		 */
		deliverLive: function(msg){
			this.deliver.apply(this, arguments);
			this.messagesLive[msg] = arguments;
			return this;
		},
		
		/**
		 * @description Limpia la lista de subscriptores, los deliver luego de
		 * cleanSubscribers no tendran accion, hasta que se subscriba a algun 
		 * mensaje.
		 * 
		 * @param [{String}] inMsg	Si se define este parametro solo eliminara
		 *							los subscriptores a dicho mensaje
		 * 
		 * @return {Publisher}
		 */
		cleanSubscribers: function(inMsg){
			var msg;

			if(undefined === inMsg){
				for(msg in this.messages){
					if(this.messages.hasOwnProperty(msg)){
						this._cleanSubscriberToMsg(msg);
					}
				}
				
			}else{
				this._cleanSubscriberToMsg(inMsg);
			}

			return this;
		},
		
		_cleanSubscriberToMsg: function(msg){
			var sid, fnc, ctx;
			if(undefined !== this.messagesLive[msg]){
				delete(this.messagesLive[msg]);
			}

			for(sid in this.messages[msg]){
				if(this.messages[msg].hasOwnProperty(sid)){
					fnc = this.messages[msg][sid][0];
					ctx = this.messages[msg][sid][1];

					try{
						this.unsubscribe(msg, fnc, ctx);
					}catch(e){}

				}
			}
			delete(this.messages[msg]);
		},
		
		_onError: function(e, fnc, ctx){
			if(undefined !== console && undefined !== console.error){
				
				if(undefined !== console.groupCollapsed){
					console.groupCollapsed('Publisher Callback Throw: ' +
						this.owner.myName
					);
					console.debug('fnc', fnc);
					console.debug('ctx', ctx);
					console.groupEnd();
				}
				
//				console.error(e);
			}
		},
		
		/**
		 * @desc Este metodo detalla en la consola todos los datos recibidos de 
		 * un objeto de error (primer argumento de un catch)
		 * 
		 * @param {mix} e		Primer argumento de un catch
		 * @return {void}
		 */
		explainError: function(e){
			var message = e.message || e.toString(),
				type = e.type || 'UNKNOW TYPE',
				stack = e.stack || ['NO STACK']
			;
			console.group('ERROR: ' + message);
				console.debug('type: ' + type);
				console.group('STACK TRACE');
					console.dir(stack);
				console.groupEnd();
			console.groupEnd();
		}

	};
}());