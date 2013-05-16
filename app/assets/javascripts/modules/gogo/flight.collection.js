var flightstats_enabled = false;

define([
	'application',
	'./flight.model'
	],
	function ( App, FlightModel ) {

		return Backbone.Collection.extend({
			model: FlightModel,
			initialize: function(){
			},
			addOrUpdate: function( flightEvent ){
				var flight = flightEvent( 'data.flight_no' );
				
					if(flightstats_enabled){
					
					if( !flight || flight.toLowerCase() == 'not available' || flight.toLowerCase() == 'null' ) return;
					
					var existingFlight = this.get( flight );
					if( !existingFlight ){
	
						var device = flightEvent( 'ext.device.model' );
						var deviceModel = {};
						if( device ){
							deviceModel[device] = 1;
						}
	
						var step = flightEvent('data.wt.si_p');
	
						var error = flightEvent('data.wt.z_error');
						var errorMessages = [];
						if( error ){
							errorMessages.push( error );
						}
	
						// Extract the flight number from airline/number combo
						// DAL2372 becomes 2372
						var re = /\d+/;
						flightNumber = re.exec(flight)[0];
	
						this.add({
							id: flight,
							flightNumber : flightNumber,
							flightPath : flightEvent('data.flight_details'),
							tailNumber : flightEvent('data.tail_no'),
							airline : flightEvent('data.airline'),
							devices : deviceModel,
							starts : step && step[0] == 'STEP_1' ? 1 : 0,
							signups : step && step[0] == 'STEP_2' ? 1 : 0,
							paymentInfos : step && step[0] == 'STEP_3' ? 1 : 0,
							captchas : step && step[0] == 'STEP_4' ? 1 : 0,
							activations : step && step[0] == 'STEP_5' ? [flightEvent('datetime_UTC')] : [],
							errors: errorMessages,
							hasView: false,
							year : flightEvent('data.date').substr(0, 4),
							month : flightEvent('data.date').substr(5, 2),
							date : flightEvent('data.date').substr(8, 2),
							events: 1
						});
	
						existingFlight = this.get( flight );
	
					} else {
	
						existingFlight.set( 'events', existingFlight.get( 'events' )+1 );
	
						var device = flightEvent('ext.device.model');
						if( device ){
							if( existingFlight.get('devices')[ device ] ){
								existingFlight.get('devices')[ device ]++;
							} else {
								existingFlight.get('devices')[ device ] = 1;
							}
						}
	
						var step = flightEvent('data.wt.si_p');
						if( step ){
							switch( step[0] ){
								case 'STEP_1':
									existingFlight.set( 'starts', existingFlight.get('starts') + 1 );
									break;
								case 'STEP_2':
									existingFlight.set( 'signups', existingFlight.get('signups') + 1 );
									break;
								case 'STEP_3':
									existingFlight.set( 'paymentInfos', existingFlight.get('paymentInfos') + 1 );
									break;
								case 'STEP_4':
									existingFlight.set( 'captchas', existingFlight.get('captchas') + 1 );
									break;
								case 'STEP_5':
									existingFlight.get('activations').push(flightEvent('datetime_UTC'));
									break;
							}
						}
	
						var error = flightEvent('data.wt.z_error');
						if( error ) {
							existingFlight.get( 'errors' ).push( error );
						}		
					}
	
					if( flightEvent('data.wt.pn_sku') && flightEvent('data.wt.si_p')[0] == 'STEP_5' ){
						existingFlight.addSku( flightEvent );
					}
				}
			},
			getNewFlights: function(){
				return this.where({ hasView : false });
			}
		});
	}
);

/*
dcsggn6ew00000sh8wh7yfhxq_4c2s - airplane
dcsupimux00000ggvzajkvhxq_4z3f - airplane
dcsw5gotd10000knjqqcp6d2a_2b5h - gogair.com
dcs8jlp9iuz5bd2ssb974zc3o_1g4c - airplane - no sales - gobrowse
dcsux4zxtvz5bdi8kofsvvc3o_1h2f - splash airplane
*/