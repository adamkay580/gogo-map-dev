define([
	'application',
	'utils/topcontent',
	'utils/flightstats'
	],
	function( App, TopContent, flightInfo ) {
		return Backbone.Model.extend({
				defaults: {
					flightNumber: '',
					flightPath: '',
					tailNumber: '',
					seats: 300,
					devices: {},
					starts: 0,
					signups: 0,
					paymentInfos: 0,
					captchas: 0,
					activations: [],
					errors: [],
					hasView: false,
					flightStats: {},
					flightStatsReady: false,
					updateFlightTimer: 5 // minutes
				},
				initialize: function(){

					var flightInfoOpts = {
						carrier: this.get('airline'),
						number: this.get('flightNumber'),
						airport: unescape(this.get('flightPath')).split(' ', 1)[0],
						year: this.get('year'),
						month: this.get('month'),
						date: this.get('date')
					};

					this.topSkus = new TopContent({ itemKey : 'name', topCount : 10, trimWindow : 0 });

					_this = this;
					this.set('flightStats', new flightInfo(flightInfoOpts, function() {
						_this.sendToMap();
					}));
				},
				addSku: function( event ){
					var sku = event('data.wt.pn_sku');
					var name = App.skuDictionary[sku];
					var newSkuItem = {
						'name' : name,
						'revenue' : 15
					};
					this.topSkus.push( newSkuItem );
				},
				getTopSkus: function( event ){
					return this.topSkus.getTop();
				},
				getTopSum: function(){
					return this.topSkus.getTopCountSum();
				},

				groupActivations: function( numMinutes ) {
					var ms = (numMinutes || 20) * 60 * 1000,
						status = this.get('flightStats').statuses[0],
						startTime = Date.parse( status.operationalTimes.actualRunwayDeparture.dateUtc ),
						chunks = Math.round( status.flightDurations.scheduledAirMinutes/numMinutes );
						// duration = status.flightDurations.scheduledAirMinutes*60*1000,
						// endTime = startTime + duration,

					// Make timestamps real datetime objects
					// Groups into x-minute increments and count them.
					var activations = _.map( this.get('activations'), Date.parse ),
						groups = [];
					for ( var i=0, _len = chunks; i<_len; i++ ) {
						groups.push( _.filter( activations, function( time ) {
							return ( time >= startTime+(ms*i) && time < startTime+(ms*(i+1)) );
							}).length );
					}

					return [0].concat( groups );
				},
				// flight stats are now ready in this.flightStats
				sendToMap: function() {
					console.log('sendToMap');
					if(this.get('flightStats').error) {
						App.log('Flight Stats failed: ' + this.get('flightStats').errorMsg, this);
						return;
					} else {
						this.set('flightStatsReady', true);
					}

					// Setup timer to get new flight position data
					this.flightTimer = setInterval(function() {
						console.log('flightTimer');
						_this.flightPosition();
					}, this.get('updateFlightTimer') * 1000 * 60);
				},

				// move the plane marker on the map
				flightPosition: function() {
					console.log('flightPosition - disabled');				
					var newPosition = this.get('flightStats').getPosition();
				}
			});
	}
);