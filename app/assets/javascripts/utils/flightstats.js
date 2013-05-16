/*
Using flightstats.com get flight status and tracking
*/

define([
	'application'
	],
	function( App, wt_flight ) {

		var flightInfo = function( wt_flight, callback ) {

			// !!! REMOVE THIS AND GET YOUR API INFORMATION CORRECTLY!!!
			var appId = 'efd7929f',
				appKey = '020347b7f9809e0251d69090cc340d7b';

			var readyState = 0; // 1=status||tracks is ready, 2=status&&tracks are ready
			this.statuses = {};
			this.tracks = {};
			this.callback = callback;
			this.error = false;
			this.errorMsg = '';

			// We must have the carrier code and flight number (this should be w/out the carrier code)
			if(typeof wt_flight === 'undefined'
				|| typeof wt_flight.carrier === 'undefined'
				|| typeof wt_flight.number === 'undefined') {
				this.error = true;
				this.errorMsg = 'Flight details not supplied';
				return;
			}

			// If we weren't given a date, use today.
			var today = new Date();
			wt_flight.year = wt_flight.year || today.getFullYear();
			wt_flight.month = wt_flight.month || today.getMonth() + 1;
			wt_flight.date = wt_flight.date || today.getDate();

			// Just in case the flight number came with the carrier code, remove it.
			var re = /\d+/;
			wt_flight.number = re.exec(wt_flight.number)[0];

			var base = 'https://api.flightstats.com/flex/flightstatus/rest/v2/jsonp/flight/';
			var s = '/'; // I hate concatinating that sort of thing
			
			this.getFlightInfo = function( type ) {
					console.log('getFlightInfo');			
				var url = base + type +s+ wt_flight.carrier +s+ wt_flight.number +s+ 'dep/'
							+ wt_flight.year +s+ wt_flight.month +s+ wt_flight.date
							+ '?maxPositions=10&utc=true&airport=' + wt_flight.airport + '&appId=' + appId + '&appKey=' + appKey;

				console.log(url);
				
			if(wt_flight.carrier.toLowerCase() != 'not available' ||  !wt_flight.carrier){
				
				console.log(wt_flight.carrier.toLowerCase());
				
				$.ajax({
						type: 'GET',
						url: url,
						success: function(data, status) {
							success( data, status, type );
						},
						error: function(data, status) {
							App.log('Flight Stats error: ' + data);
						},
						dataType: 'jsonp'
					});
	
				} else { console.log('no carrier') };
			
			}

			var _this = this;
			function success(data, status, type) {
				console.log('success');
				_this.error = false;
				if(data.error) {
					_this.error = true;
					_this.errorMsg = 'API call failed. ' + data.error.errorMessage;
					_this.callback();
					return;
				}

				if(type == 'status') {
					_this.statuses = data.flightStatuses;
				} else if(type == 'tracks') {
					_this.tracks = data.flightTracks;
				}

				readyState++;

				if(readyState == 2) {
					_this.airports = data.appendix.airports;
					if(typeof _this.airports[1] == 'undefined') {
						_this.error = true;
						_this.errorMsg += 'Airport data bad';						
					}
					if(typeof _this.statuses[0] == 'undefined') {
						_this.error = true;
						_this.errorMsg += 'No status data';
					}
					if(typeof _this.tracks[0] == 'undefined') {
						_this.error = true;
						_this.errorMsg += 'No tracking data';
					} else if(typeof _this.tracks[0].positions[0] == 'undefined') {
						_this.error = true;
						_this.errorMsg += 'No positioning data';
					}
					if(_this.error) {
						_this.errorMsg += ' -- ' + wt_flight.date + wt_flight.carrier + wt_flight.number;
					}
					_this.callback();
				}
			}

			this.getPosition = function() {
				console.log('getposition');
				var url = base + 'tracks' +s+ wt_flight.carrier +s+ wt_flight.number +s+ 'dep/'
							+ wt_flight.year +s+ wt_flight.month +s+ wt_flight.date
							+ '?maxPositions=1&utc=true&airport=' + wt_flight.airport + '&appId=' + appId + '&appKey=' + appKey;

				$.ajax({
					type: 'GET',
					url: url,
					success: function(data, status) {
						var newPosition = data.flightTracks[0].positions[0];
						_this.tracks[0].positions.unshift(newPosition);
						return newPosition;
					},
					error: function(data, status) {
						App.log('Flight reposition error: ' + data);
					},
					dataType: 'jsonp'
				});


			};

			this.getFlightInfo('status');
			this.getFlightInfo('tracks');

		};

		return flightInfo;
	}
);

/*
var flight = {
	carrier: 'DAL',
	number: '1223',
	airport: 'kpdx'
	year: 2012,
	date: 28,
	month: 12,
	callback: flightSuccess
}
var plane = new flightInfo(flight);
*/