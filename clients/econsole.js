(function($){
	var socket = io.connect('http://' + window.location.host + ':4040/');
	socket.on('welcome', function(){
		socket.emit('clientInfo', {
			name: Server.persistRead('econsole_name'),
			ua: navigator.userAgent,
			screen: {
				width: window.screen.width,
				height: window.screen.height
			}
		});
	});
	socket.on('exec', function(data){
		Server.serverExec(data);
	});

	socket.on('openRecord', function(data){
		Server.openRecord(data);
	});
	
	socket.on('command', function(data){
		Server['cmd_' + data.cmd].apply(Server, data.args);
	});
	
	var Server = {
		records: [],
		
		pushRecord: function(r){
			return this.records.push(r) - 1;
		},

		serverExec: function(data){
			var ret;
			try{
				ret = [eval(data.code)];
			}catch(e){
				ret = [e.message, e.toString(), e.stack];
			}
			this.send(new Record('execReturn', ret));
		},
		
		openRecord: function(data){
			var record;
			var obtainPath = data.path.replace(/#proto\./g, '');
			if(undefined !== (record = this.records[ data.key ])){
				socket.emit(
					'openedRecord', 
					record.getMessage( record.getData(data.argNum, obtainPath), data.argNum, data.path )
				);		
			}else{
				socket.emit(
					'openedRecord', 
					{
						key: data.key,
						type: 'norecord',
						args: ['<NO RECORD>']
					}
				);
			}
		},
		
		send: function(record){
			socket.emit(record.getType(), record.getMessage());
		},
		
		cmd_setName: function(name){
			this.persistWrite('econsole_name', name);
		},

		persistWrite: function(key,value){
			if(window.localStorage){
				window.localStorage.setItem(key, value);
			}else{
				function setCookie(c_name,value,exdays){
					var exdate=new Date();
					exdate.setDate(exdate.getDate() + exdays);
					var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
					document.cookie=c_name + "=" + c_value;
				}
				setCookie(key,value,365);
			}
		},
		persistRead: function(key){
			if(window.localStorage){
				return window.localStorage.getItem(key);
			}else{
				function getCookie(c_name){
					var i,x,y,ARRcookies=document.cookie.split(";");
					for (i=0;i<ARRcookies.length;i++){
						x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
						y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
						x=x.replace(/^\s+|\s+$/g,"");
						if (x==c_name){
							return unescape(y);
						}
					}
				}
				return getCookie(c_name);
			}
		}
	};

	function Record(type, data){
		this.key = Server.pushRecord(this);
		this.type = type;
		if(undefined === data){
			this.data = undefined;
		}else{
			this.data = data;
		}
	}
	
	Record.prototype = {
		getKey: function(){
			return this.key;
		},
		getType: function(){
			return this.type;
		},
		getData: function(argNum, path){
			var data = '<null>';

			if(undefined !== this.data[argNum]){
				if(undefined === path || path === ""){
					data = this.data[argNum];
				}else{
					path = path.split('.');
					var i;
					data = this.data[argNum];
					for(i=0;i<path.length;i++){
						if(undefined === data[ path[i] ]){
							break;
						}
						data = data[ path[i] ];
					}
				}

				if(data === undefined){
					data = '<undefined>';
				}
			}

			return data;
		},
		getMessage: function(data, argNum, path){
			if(undefined === data){
				data = this.data;
			}
			data = this.parseReturn( data );
			var ret = {
				type: this.type,
				key: this.key,
				args: data
			};
			
			if(undefined !== argNum){
				ret.argNum = argNum;
				ret.path = (undefined === path) ? '' : path;
			}
			
			return ret;
		},
		parseReturn: function(ret, open){
			if(undefined === open){
				open = true;
			}
			if(undefined === ret){
				ret = 'undefined|#|undefined';
			}else if(null === ret){
				ret = 'null|#|null';
			}else{
				switch(typeof(ret)){
					case 'function':
						ret = 'function|#|' + this._getConstructorName(ret);
					break;
					case 'object':
						if(ret instanceof Array){
							ret = (open) ? this.openRet(ret) : 'array|#|' + this._getConstructorName(ret);
						}else{
							ret = (open) ? this.openRet(ret) : 'object|#|' + this._getConstructorName(ret);
						}
					break;
					default:
						ret = typeof(ret) + '|#|' + ret.toString();
				}
			}

			return ret;
		},
		
		_getConstructorName: function(ret){
			var p = '__proto__', cCode, r;

			if(ret.constructor){
				cCode = ret.constructor.toString();
				if(!cCode){
				}
			}else if(ret[p]){
				if(ret[p].constructor){
					cCode = ret[p].constructor.toString()
					if(!cCode){
						
					}
				}
			}
			
			if(!cCode){
				return '[unknow type]';
			}
			
			r = cCode.match(/function ([$\w]*)\(/);
			if(!r || !r[1]){
				r = cCode.match(/^\[object ([$\w]*)\]/);
			}
			// no else if!!!
			if(r && r[1]){
				r = r[1];
			}
console.log(cCode);
console.log(r);
			if(r === 'Object' && typeof(ret) === 'function'){
				cCode = ret.toString();
				r = cCode.match(/function ([$\w]*)\(/);
				if(r && r[1]){
					return 'class ' + r[1];
				}
				if(ret.name){
					return ret.name;
				}
				r = cCode.match(/^\[object ([$\w]*)\]/);
				if(r && r[1]){
					return r[1];
				}
			}else{
				return r;
			}

			return 'Function';
		},
		
		openRet: function(obj){
			var i, retObj={};
			
			if(obj.hasOwnProperty){
				for(i in obj){
					if(obj.hasOwnProperty(i)){
						retObj[i] = this.parseReturn(obj[i], false);
					}else{
						if(undefined === retObj['#proto']){
							retObj['#proto'] = {};
						}
						retObj['#proto'][i] = this.parseReturn(obj[i], false);
					}
				}
			}else{
				for(i in obj){
					retObj[i] = this.parseReturn(obj[i], false);
				}
			}
			
			return retObj;
		}
	};
	
	window.econsole = {
		log: function(){
			Server.send(new Record('log', Array.prototype.slice.apply(arguments) ));
		}
	};

}(jQuery));