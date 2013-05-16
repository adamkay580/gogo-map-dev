define([
	'backbone'
	],
	function ( Backbone, App, url, streamType, query, limit) {
		
		var Socket;

		Socket = function( url, streamType, query, limit ) {

			_.bindAll(this);
			this.url = url;
			this.access_token = '';
			this.getToken();
		    this.stream_type = streamType || 'return_all';
			this.query = query || "";
			this.socket = null;
			this.socketOpenedAt = null;
			this.socketClosedAt = null;
			this.streamsReceived = 0;
		    this.api_version = '2.0';
		    this.schema_version = '2.0';
		    this.errors = [];

			// eventQueue is a queue that handles events that overflow the event-per-second limit
		    this.eventQueue = [];
		    this.lastEvent = null;
			this.maxQueueLength = 500;

			// Limit is the minimum amount of milliseconds that the socket will wait
		    // before it handles another event.  It will queue events that happen more often.
			// Queued events get inserted as soon as possible.
			// Set to a sane default of 1000 events per second.
			this.limit = limit || 1;

		    this.SocketData = function( obj ) {
		        function selector(sel) {
		            sel = sel.split('.');
		            for ( var src=obj, k=0, _len=sel.length; k<_len;k++ ) {
		                if( typeof src[ sel[k] ] === 'undefined' ) {
		                    return false;
		                }
		                src = src[ sel[k] ];
		            }
		            return src;
		        }

		        for ( var k in obj )
		            selector[k] = obj[k];

		        return selector;
		    };
		};

		

		_.extend( Socket.prototype, Backbone.Events, {
		    _initSocket: function(endpoint) {
		        var socket = new WebSocket(endpoint);
		        socket.onopen = this._open;
		        socket.onmessage = this._message;
		        socket.onerror = this._error;
		        socket.onclose = this._closed;
		        return socket;
		    },
		    _command: function(command, options) {
		        var cmd = {
		            access_token: this.access_token,
		            stream_type: this.stream_type,
		            api_version: this.api_version,
		            schema_version: this.schema_version,
		            query: this.query,
		            command:command
		        };

		        try {
		            this.socket.send( JSON.stringify( _.extend(cmd, options) ) );
		        } catch ( e ) {
		            this._log( "Error sending `" + command + "`: " + e );
		        }

		        this.trigger("command:" + command, this.query, this.stream_type );
		    },
		    _open: function(event) {
		        this._log("Opening stream");
		        this._command("stream");
		        this.streamsReceived = 0;
		        this.socketOpenedAt = Date.now();
		        this.trigger("open");
		    },
		    _closed: function() {
		        this.socket = null;
		        this.socketClosedAt = Date.now();
		        this.trigger("close", this.stats() );
		    },
			_queueCheck: function() {
				var now = Date.now();
				if(this.eventQueue.length && ( now - this.lastEvent ) > this.limit ){
					this._message( this.eventQueue.shift() );
				}
				if (this.eventQueue.length) {
					var _this = this;
					setTimeout(function () { _this._queueCheck(); }, _this.limit);
				}
			},
			_message: function(msg){
				var now = Date.now();
				if( this.lastEvent == null || ( now - this.lastEvent ) > this.limit ) {
					this.lastEvent = now;
					this._messageThrottled(msg);
				}
				else {
					if (this.eventQueue.length <= this.maxQueueLength) {
						this.eventQueue.push(msg);
						var _this = this;
					}
					if(this.eventQueue.length == 1){
						setTimeout(function () { _this._queueCheck(); }, _this.limit);
					}
				}
			},
		    _messageThrottled: function (msg) {
		        var data;
		        try {
		            msg = JSON.parse( msg.data );
		        }
		        catch (e) {
		            this._log('Parse error', e, msg.data );
		        }

		        if ( msg.type === 'error' )
		            return this.errors.push( msg );

		        if ( msg.meta.message_type === 'event' ) {
		            this.streamsReceived++;
		            return this.trigger('data', this.SocketData(msg) );
		        }
		    },
		    _log: function () {
		        console.log.apply( console, [ 'Websocket' ].concat( Array.prototype.slice.call(arguments) ) );
		    },
		    _error: function() {
		        this._log('Error', arguments );
		    },
		    filter: function( query ) {
		        this._command( 'filter', query );
		    },
		    getToken: function(){
		    	var _this = this;
		    	$.getJSON(
		    		"/token", 
		    		function (data) {
						if ("token" in data) {
							_this.access_token = data["token"];
						} else {
							if ("error" in data) {
								alert("error: " + data["error"]);
							}
						}
					});
		    },

		    send: function(message) {
		        if (this.socket && this.socket.readyState == WebSocket.OPEN )
		            return socket.send(message);
		    },

		    isOpen: function() {
		        return ( !this.socket ) ? false : this.socket.readyState == WebSocket.OPEN;
		    },

		    open: function( options ) {
		        if ( options )
		            _.extend( this, options );
		        if ( this.socket )
		            return this.filter( this.query );
		        this.socket = this._initSocket( this.url );
		    },

		    close: function() {
		        if ( this.isOpen() ) {
		            this.socket.close();
		            this.socket = null;
		            this.socketClosedAt = Date.now();
		            this.trigger("close", this.stats() );
		        }
		    },

		    stats: function() {
		        return {
		            openedAt: this.socketOpenedAt,
		            closedAt: this.socketClosedAt,
		            streamsReceived: this.streamsReceived,
		            streamsPerMinute: this.streamsReceived/((( this.socketClosedAt-this.socketOpenedAt )/1000 )/60 ),
		            errors: this.errors.length
		        };
		    }
		});

		return Socket;
	}
);