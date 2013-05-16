App.Utils = {
    // If the stream ever returns a fixed string for a value,
    // such as traffic source top level (wt.tsrct), keep those here.
    streamvals: {
        TSRCT_REFERER: 'Referer',
        TSRCT_CAMPAIGN: 'Campaign',
        TSRCT_PAID_SEARCH: 'Paid Search',
        TSRCT_ORGANIC_SEARCH: 'Organic Search',
        TSRCT_SOCIAL_REFERER: 'Social Referer',
        TSRCT_SEARCH_ENGINE: 'Search Engine'
    },

    idify: function( str ) {
        return str.replace(' ', '' ).toLowerCase();
    },

    isValidUrl: function( url ) {
        var re = /(?:https?\:\/{1,3}|[a-z0-9%])(?:[a-z0-9.\-]+\.?)*(?:\.ac|ad|ae|aero|af|ag|ai|al|am|an|ao|aq|ar|arpa|as|asia|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|biz|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cat|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|com|coop|cr|cu|cv|cw|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|info|int|io|iq|ir|is|it|je|jm|jo|jobs|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mo|mobi|mp|mq|mr|ms|mt|mu|museum|mv|mw|mx|my|mz|na|name|nc|ne|net|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|post|pr|pro|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sx|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|travel|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|xxx|ye|yt|za|zm|zw)(?:$|\/[^\s()<>]*)/gi;
        return re.test(url);
    },

    templatize: function( html, dataAttr ) {
        var _t = {};
        dataAttr = dataAttr|| 'viewname';
        $(html)
            .find('[data-'+ dataAttr +']')
            .each( function() {
                _t[ $(this).data( dataAttr ) ] = _.template( this.innerHTML.replace('&lt;', '<').replace('&gt;', '>') );
            });
        return _t;
    },

    keysToLowerCase: function( data ) {
        var key, _d = {};
        for( key in data ) {
            _d[key.toLowerCase()] = data[key];
        }
        return _d;
    },

    parsePath: function( url ) {
        var parts = url.trim().split('/');
        return {
            url: url,
            protocol: parts[0] || "",
            baseUrl: parts[2] || "",
            // Reappend slashes cutoff in the split()
            path: '/' + ( parts.splice(3).join('/') || ""),
            host: parts[0] + '//' + parts[2],
            trailingSlash: url[ url.length-1 ] === '/'
        };
    },

    // k for thousands (and millions)
    k: function( num ) {
        if ( num < 1000 ) return num;
        if ( num < 1000000 )
            return (""+num/1000).slice(0,3) + 'k';
        if ( num < 1000000000 )
            return (""+num/1000000 ).slice(0,3) + 'm';
        if ( num < 1000000000000 )
            return (""+num/1000000000 ).slice(0,3) + 'b';
    },

    // Pass an array of hex color stops, and get an array of all steps in a gradient.
    // Props to http://4umi.com/web/javascript/gradient.php
    gradient: function( hexColorStops, steps ) {
        var v1, v2, r1, g1, b1, rs, gs, bs;
        var dec2hex, hex2dec, val2hex;
        var c;
        var gradient = [];

        // Utility functions to help with transforming hex to rgb.
        dec2hex = function( s ) { return ( s<15.5 ? '0' : '' ) + Math.round( s ).toString( 16 ); };
        hex2dec = function( s ) { return parseInt( s, 16 ); };
        val2hex = function( s ) { return s.toLowerCase().replace( /[^\da-f]/g, '' ).replace( /^(\w)(\w)(\w)$/, '$1$1$2$2$3$3' ); };

        c = hexColorStops.length-1;
        steps = Math.floor( (steps-c)/c );

        while ( c>0 ) {

            var _g = [];

            v2 = val2hex( hexColorStops[c] ),
            v1 = val2hex( hexColorStops[c-1] );

            if( ( v1+v2 ).length !=12 )
                throw "Gradient requires valid from and to hex values.";

            var vn = +steps || 1,
                i = vn + 1;

            r1 = hex2dec( v1.substring(0,2) );
            g1 = hex2dec( v1.substring(2,4) );
            b1 = hex2dec( v1.substring(4) );
            rs = ( hex2dec( v2.substring(0,2) ) - r1 ) / vn;
            gs = ( hex2dec( v2.substring(2,4) ) - g1 ) / vn;
            bs = ( hex2dec( v2.substring(4) ) - b1 ) / vn;

            while(i--) {
                _g[i] = '#' + dec2hex( r1 ) + dec2hex( g1 ) + dec2hex( b1 );
                r1 += rs;
                g1 += gs;
                b1 += bs;
            }

            gradient = gradient.concat(_g);
            c--;
        }

        return gradient;
    }
};

App.Utils.StreamingSocket = function (url, token, streamType, query, limit) {
	_.bindAll(this);
	this.url = url;
	this.access_token = token;
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

_.extend( App.Utils.StreamingSocket.prototype, Backbone.Events, {
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


/*
 * Reusable object to create pipes.
 */

App.Utils.Pipe = function( paper, fromPos, toPos, attr, options ) {
    if ( !paper )
        throw( "Please specify a Raphael Paper object for a pipe." );

    this.paper = paper;
    this.from = { x: 0, y: 0 };
    this.to = { x: 0, y: 0 };
    this.attr = {
        stroke: "#333333",
        "stroke-width": 13
    };
    this.ballColor = '#333333'; // ballColor;
    this.ballRadius = 7; // || 7;
    this.maxBalls = 15;
    this.ballSpeed = 500;
    this.ballHopper = [];
    this.lastBall = null;
    this.curveAmount = App.is.mobile ? 25 : 150;

    if ( options ) _.extend( this, options );
    if ( fromPos ) this.from = _.extend( this.from, fromPos || {} );
    if ( toPos ) this.to = _.extend( this.to, toPos || {} );
    if ( attr ) this.attr = _.extend( this.attr, attr || {} );

   this.layPipe = function( fromPos, toPos ){

        if ( fromPos ) this.from = _.extend( this.from, fromPos || {} );
        if ( toPos ) this.to = _.extend( this.to, toPos || {} );

        // TODO: Adjust the curve of the line on the fly
        var curveAmount = this.curveAmount;

        var curveTo = this.from.x + curveAmount + ',' + this.from.y +',';
        curveTo += this.to.x-curveAmount + ',' + this.to.y +',';
        curveTo += this.to.x + ',' + Math.floor(this.to.y - this.attr['stroke-width']/2);

        // assemble the path
        var newPath = 'M' + this.from.x + ',' + Math.floor(this.from.y - this.attr['stroke-width']/2) + 'C' + curveTo;

        // if the pipe exists, merely update its path
        if  (this.pipe) {
            return this.pipe.attr('path', newPath);
        }
        // Otherwise, create the pipe.
        this.pipe = this.paper.path( newPath ).attr( this.attr ).toBack();
    };

    this.ballThrottleCheck = function () {
        // this keeps the amount of balls sent down the pipe in check
        return (this.lastBall == null || ((Date.now() - this.lastBall) > (this.ballSpeed / this.maxBalls)));
    };

    this.sendBall = function() {

        if (!this.ballThrottleCheck()) return;
        this.lastBall = Date.now();

        // we need to specify a new custom moveBall attribute that we can use to animate the ball it's passed a percentage of the length
        var thisSource = this;

        this.paper.customAttributes.moveBall = function(value) {
            value = lineLen / 100 * value;
            var point = this.paper.getById(this.attrs.pipeId).getPointAtLength(value);
            return {cx: point.x, cy: point.y};
        };

        // here we get the starting point of the pipe
        var start = this.pipe.getPointAtLength(0);
        // and the length of teh pipe
        lineLen = this.pipe.getTotalLength();

        // Check for ball
        var ball = null;
        for( var i = 0, _len = this.ballHopper.length; i < _len; i++ ) {
            if( this.ballHopper[i].attrs.inUse == false ) {
                ball = this.ballHopper[i];
                ball = this.ballHopper[i];
                ball.attr({ x: start.x, y: start.y });
                ball.show();
                break;
            }
        }

        if( ball && this.ballHopper.length > this.maxBalls ) return;

        if( !ball ) {
            ball = this.paper.circle(start.x, start.y, 7);
            this.ballHopper.push( ball );
        }

        ball.attrs.pipeId = this.pipe.id;
        ball.attrs.inUse = true;

        ball.attr({fill: this.ballColor, 'stroke-width': 1, stroke: this.ballColor, moveBall: 0});

        // now we tell the ball to animate to the 100% of the line in .5 seconds and when we are done, remove the ball
        ball.animate(   { moveBall: 100 },
                        this.ballSpeed,
                        function() {
                            ball.attrs.inUse = false;
                            ball.hide();
                        });
    };

    this.remove = function() {
        // Remove Raphael object.
        this.pipe.remove();

        // Remove ball Raphael (and corresponding DOM) elements.
        for ( var i, _len = this.ballHopper.length; i<_len; i++ ) {
            this.ballHopper[i].remove();
        }
    };
};

// For keeping topN lists of stream objects
// Options:
//      itemKey: required
//      topCount: default = 10
//      requiredValues: default = []
//      trimWindow: default = 10 ** Set to 0 to disable trimming **
App.Utils.WtTopContent = function (obj) {

    // Storage items
    this.dataStore = {};
    this.topStore = [];

    this.trimFlag = false;

    // this is the value that you will use as a key in the Dictionary, this is required
    this.itemKey = "";
    if (typeof obj.itemKey !== 'undefined') {
        this.itemKey = obj.itemKey;
    }

    // this is the number of top items that you want to track, this is set to 10 by default
    this.topCount = 10;
    if (typeof obj.topCount !== 'undefined' && obj.topCount > 0) {
        this.topCount = obj.topCount;
    }
    // pass a new top count to change the returned top count this requires a topData update
    this.setTopCount = function (newTopCount) {
        if (newTopCount > 0) {
            this.topCount = newTopCount;
            this.trim(true); // true indicates to the trimmer that it is a one time update
        }
    };

    this.setTrimWindow = function (newTrimWindow) {
        if (typeof newTrimWindow !== 'undefined' && newTrimWindow > 0) {
            this.trimWindow = newTrimWindow * 1000;  // multiply by 1000 to facilitate passing 'seconds'
        }
    };

    this.setItemKey = function (newItemKey) {
        if (typeof newItemKey !== 'undefined' && newItemKey != '') {
            while (trimFlag) { }
            this.trimFlag = true;
            this.itemKey = newItemKey;
            this.dataStore = {};
            this.topStore = [];
            this.trimFlag = false;
        }
    };

    // this is an array of values that you require the item contains in order to add it to the set
    this.requiredValues = [];
    if (typeof obj.requiredValues !== 'undefined' && obj.requiredValues.length > 0) {
        this.requiredValues = obj.requiredValues;
    }

    // pass an empty array to remove required values passed previously
    this.setRequiredValues = function (newRequiredValues) {
        this.requiredValues = newRequiredValues;
    };

    // this is the length of time in seconds that you will give the items before you trim them.
    this.trimWindow = 10;
    if (typeof obj.trimWindow !== 'undefined' && obj.trimWindow > 0) {
        this.trimWindow = obj.trimWindow * 1000; // multiply by 1000 to facilitate passing 'seconds'
        var wttop = this;
        setTimeout(function () { wttop.trim(false); }, wttop.trimWindow);
    }

    // this is the function that can be used to increment attributes on the valid items as they are added
    this.incrementCounts = function (item) { return true; };
    this.setIncrementFunction = function (incrementFunction) {
        this.incrementCounts = incrementFunction;
    };

    // Convenience function to mimic array notation
    this.push = function (item) {
        this.addData(item);
    };

    this._addData = function( itemKeyVal, item ) {
        var existingItem = this.dataStore[ itemKeyVal ];
        if (existingItem) {
            existingItem.count = existingItem.hitList.push(Date.now());
			existingItem.allTimeTotal = existingItem.allTimeTotal + 1;
            this.incrementCounts(existingItem);
            this.sortTop(existingItem);
            return;
        }

        // otherwise we create a new item and add it to the object container
        item.count = 1;
		item.allTimeTotal = 1;
        item.hitList = [Date.now()];

        // Here we create an empty history array
		// each item is a checkpoint of size for the last second
        item.history = [];
		for(var i = 0; i < (this.trimWindow/1000); i++){
			item.history.push(0);
		}

        this.incrementCounts(item);
        this.dataStore[ itemKeyVal ] = item;

        if (this.topStore.length < this.topCount) {
            this.sortTop(item);
        }
    };

    // function for handling an a new data item
    this.addData = function (item) {
        var i, _len;

        // exit if we are doing a trim / we could miss a couple of items but
        // we wont corrupt our data by adding and removing simultaniously
        if (this.trimFlag) return;

        // return if the key did not exist in the item
        if ( !item || !item[this.itemKey]) return;

        // return if any of the required values dont exist
        for (i = 0, _len=this.requiredValues.length; i < _len; i++) {
            if (!item[ this.requiredValues[i] ]) return;
        }

        // now we check if the value exists in our object container already and do the incrementing, timestamping, and sorting
        // We make a shallow copy version of item ( the original item passed to addData )
        // because the item could be passed here more than once, if it's key value is an array
        // and we want to avoid any values changing by reference.

        var val = item[this.itemKey];
        if ( !_.isArray( val ) ) {
            this._addData( val, item );
        } else {
            for ( i = 0, _len=val.length; i<_len; i++ ) {
                var _item = _.clone( item );
                _item[ this.itemKey ] = val[i];
                this._addData( val[i], _item );
            }
        }

    };

    this.getTop = function () {
        if (this.trimFlag) return null;
        var topList = [];

        for (var i in this.topStore) {
            var item = _.clone(this.topStore[i]);
            topList.push(item);
        }

        return topList;
    };

    this.getTopCountSum = function () {
        var sumTotal = 0;
        var topList = this.topStore;
        for (var x = 0; x < topList.length; x++) {
            sumTotal += topList[i].count;
        }
        return sumTotal;
    }

    this.getLength = function () {
        var count = 0;
        for (var key in this.dataStore) {
            count += this.dataStore[key].count;
        }
        return count;
    }

    this.sortTop = function (testItem) {
        if (typeof testItem !== 'undefined' && this.topStore.indexOf(testItem) == -1) {
            this.topStore.push(testItem);
        }

        this.topStore.sort(function (item1, item2) {
            return item2.count - item1.count;
        });

        if (this.topStore.length > this.topCount) {
            this.topStore = this.topStore.slice(0, this.topCount);
        }
    };

    // you start the trimmer manually, you may pass it a time in seconds for the trim
    this.startTrimmer = function (trimWindow) {
        if (typeof trimWindow !== 'undefined') {
            this.setTrimWindow(trimWindow);
        }
        if (this.trimWindow === 0) return;
        var wttop = this;
        setTimeout(function () { wttop.trim(false); }, 1000);
    };

    this.trim = function (oneTimeTrim) {

        // prevent adds durring the trim
        this.trimFlag = true;

        // get the time to compare
        var now = Date.now();

        // create a tuple of the items for the sorting we'll do later
        var tuples = [];
        for (var key in this.dataStore) {
        	var sliceLocation = -1;
			var historyCount = 0;
            for (var i = 0; i < this.dataStore[key].count; i++) {
                if (sliceLocation == -1 && (now - this.dataStore[key].hitList[i]) <= this.trimWindow) {
                    sliceLocation = i;
                }
				if((now - this.dataStore[key].hitList[i]) <= 1000){
					historyCount = this.dataStore[key].count - i;
					break;
				}
            }

            if (sliceLocation == -1) {
                delete this.dataStore[key];
                continue;
            } else {
                this.dataStore[key].hitList = this.dataStore[key].hitList.slice(sliceLocation);
                this.dataStore[key].count = this.dataStore[key].hitList.length;

                this.dataStore[key].history.push(historyCount);
                var historySize = this.trimWindow / 1000;
                if (this.dataStore[key].history.length > historySize) {
                	this.dataStore[key].history = this.dataStore[key].history.slice(this.dataStore[key].history.length - historySize);
                }
            }

            // otherwise we add them to our array for sorting
            tuples.push([key, this.dataStore[key]]);
        }

        // now we use the array sort function for sorting
        tuples.sort(function (tup1, tup2) {
            return tup2[1].count - tup1[1].count;
        });

        // make sure we get the proper number of top items
        var topLength = this.topCount;
        if (tuples.length < topLength) topLength = tuples.length;

        // clear out our old topStore
        this.topStore = [];

        // add in the new top list
        for (var i = 0; i < topLength; i++) {
            this.topStore.push(this.dataStore[tuples[i][0]]);
        }

        // we're done so stuff can get added now
        this.trimFlag = false;

        // if this wasnt a one time event we schedule a new trim
        if (!oneTimeTrim) {
            var wttop = this;
            setTimeout(function () { wttop.trim(false); }, 1000);
        }
    };

};

App.Utils.trim = function (toTrim, now, window) {
    window = window * 1000;
    var sliceLocation = -1;
    for (var i = 0; i < toTrim.length; i++) {
        if ((now - toTrim[i]) <= window) {
            sliceLocation = i;
            break;
        }
    }

    if (sliceLocation != -1) {
        toTrim = toTrim.slice(sliceLocation);
    } else {
        toTrim = [];
    }

    return toTrim;
};

App.Utils.QueryRoute = function( route, reqSelectValues ) {
    this.routeDelimiter = '|';
    this.route = '';
	this.vizquery = '';
    this.required = reqSelectValues || [];
    this.select = [];
    this.where = [];
    this.or = [];
    this.config = {};
    if ( route )
        this.parseRoute( route );
};

App.Utils.QueryRoute.prototype = _.extend( App.Utils.QueryRoute.prototype, {
    parseRoute: function( route ) {
        if ( !route || route.length === 0 ) return;

        var r,
            cmds, c,
            cfgOpts, co, _config;

        var HTTP = '__HTTP__';

        this.route = route;

        r = route.split( this.routeDelimiter );

        for ( var i=0, _len=r.length; i<_len; i++ ) {
            // Substitute tokens for important char combos
            cmd = r[i].replace(/\s/gi,'').replace('http:', HTTP).split(':');
            c = cmd[0].toLowerCase();
            cmd[1] = cmd[1].replace( HTTP, 'http:');

            // Set the property on this and convert to proper array of strings
            if ( ['select', 'where', 'or'].indexOf(c) > -1 ) {
                this[ c ] = cmd[1].split(',');
            } 
			else if ( ['vizquery'].indexOf(c) > -1 ) {
				this.vizquery = decodeURIComponent(cmd[1]);
			}
			else {
                // Set property on our config object
                this.config[ c ] = _.map( cmd[1].split(','), function( cfg ) {
                                            return this.stringOrNum( cfg );
                                            }, this);
                // If it's not intended to be an array, just set the prop to the first element.
                if ( this.config[ c ].length === 1 )
                    this.config[ c ] = this.config[ c ].pop();
            }
        }
    },

    stringOrNum: function( val, quotes ) {
        var QUOTE = '\'';
        return ( quotes ) ? QUOTE + val + QUOTE : val;
    },

    prepareCondition: function( cond ) {
        // Replace +s with spaces
        var PLUS_LITERAL = '__PLUS__';
        cond = cond.replace( '\\+', PLUS_LITERAL )
                    .replace( '+', ' ')
                    .replace( PLUS_LITERAL, '+' );
        return this.stringOrNum( cond, true );
    },

    toRoute: function() {
        var conditions,
            route;

        conditions = _.extend({}, this.config);
        if ( this.select.length > 0 ) conditions.select = this.select;
        if ( this.where.length > 0 ) conditions.where = this.where;
        if ( this.or.length > 0 ) conditions.or = this.or;

        route = _.map( conditions, function(val,key) {
                                        return ( _.isArray( val ) ) ? key+':'+val.join(',') : key+':'+val; });
        return route.join( this.routeDelimiter );
    },

    toQuery: function() {
        var q = [],
            params, _params, _pOp, wild, cond,
            _this;

        // Select statement
        if ( this.select.length > 0 && this.select[0] != '*' )
            q.push('select ' + _.uniq(this.select.concat( this.required ) ).join(', ') );
        else
        	q.push('select *');

        // Where and Or
        _this = this;
        _.each(['where', 'or'], function( cmd ) {
            params = _this[cmd];
            if ( params && params.length > 0 ) {
                // Sample param: cs-uri-stem!=*event*
                _params = [];

                for ( var i=0, _len=params.length; i<_len; i++ ) {
                    wild = ( params[i].indexOf('*') > -1 );
                    if ( params[i].indexOf( '!=' ) == -1 ) {
                        cond = params[i].split('=');
                        _pOp = ( wild ) ? ' LIKE ' : '=';
                    } else {
                        cond = params[i].split('!=');
                        _pOp = ( wild ) ? ' NOTLIKE ' : '!=';
                    }
                    _params.push( [cond[0], _pOp, _this.prepareCondition(cond[1])].join('') );
                }

                q.push( cmd );
                q.push( _params.join(' AND ') );
            }
        });

        // add in the where's from the viz builder if we've got 'em
        if( this.vizquery ){
			var whereIndex = q.indexOf('where')
			if (whereIndex < 0) {
        		q.push('where ' + this.vizquery);
			}
			else {
        		q[whereIndex + 1] += ' AND ' + this.vizquery;
			}
		}
		
		console.log(q.join(' '));

        return q.join(' ');
    }
});
