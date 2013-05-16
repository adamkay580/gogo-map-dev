
define([
	'application',
	'./flight.collection',
	'./flight.view',
	'./option.view',
	'utils/socket',
	'utils/topcontent',
	'./gogo.model',
	'utils/map'
	],
	function( App, FlightCollection, FlightView, OptionView, Socket, TopContent, GogoModel, gmap ) {

		return Primer.View.extend({
			id: 'gogo',
			events: {
				'click #start' : 'startSocket',
				'click #stop' : 'stopSocket',
				'click .flight' : 'showFlightInfo',
				'click #tail, #close' : 'closeFlightInfo'
			},
			initialize: function( opts ) {

				_.bindAll( this, 'refresh', 'onData', 'startSocket', 'stopSocket', 'showFlightInfo', 'updateTopBar', 'getMap' );
				this.setOptions( opts );
				this.framerate = opts.framerate || 500;

				this.$el.attr('role', 'main');

				this.collection = new FlightCollection();
				this.model = new GogoModel();
				this.flightView = null;

				this.socket = new Socket( 'ws://sapi.webtrends.com/streaming' );
				this.socket.on( 'data', this.onData, this );


				App.hub.on('module:activated', this.getMap);

				this.render();
			},
			onClose: function() {
				this.stopListening();
			},
			onData: function( data ) {
				this.model.set( 'events', this.model.get('events') + 1 );

				if( data('data.wt.si_p')[0] == 'STEP_5'){
					this.model.addSku( data );
				}
				
				if(data('data.wt.si_p')[0]){
					if((data('data.wt.si_p')[0].indexOf('ACTIVATED') > -1 && data('data.wt.si_p')[0].indexOf('LOGINACTIVATED') == -1)){
						this.model.addSku( data );
					}									
				}

				if( data('data.airline') ){
					this.model.addAirline( data );
				}

				if( data('data.flight_details') ){
					this.model.addCityPair( data );
				}

				if( data('data.wt.si_p') && data('data.flight_no') ){
					this.model.addStep( data('data.wt.si_p'), data('data.flight_no'), data);
				}

				if( data('data.wt.z_error') ){
					this.model.addError( data('data.wt.z_error'), data('data.flight_no') );
				}

				this.collection.addOrUpdate( data );

			},
			render: function() {
				this.$el.empty()
					.append( JST['modules/gogo/gogo']() );

				return this;
			},

			// Redraw the page
			refresh: function(){

				// this function updates the top bar except for the
				this.updateTopBar();

				// We need to see if there are any models we dont have views for and create them.
				var newFlights = this.collection.getNewFlights();
				for( var i = 0; i < newFlights.length; i++ ){
										
					if(newFlights[i].get('activations').length) {
						if(newFlights[i].get('flightStatsReady') && !newFlights[i].get('flightStats').error) {
							this.map.addPlane(newFlights[i]);
							newFlights[i].set( 'hasView', true, { silent: true } );
						}
					}
				}

				// Handle updating the airlines list
				var newAirlines = this.model.getNewAirlines();
				for( var i = 0; i < newAirlines.length; i++ ){
					newAirlines[i].set( 'addedToSelector', true, { silent: true } );
					var newAirlineView = new OptionView( { model : newAirlines[i] } );
					this.$el.find('#airline').append( newAirlineView.$el );
				}

				// Handle updating the city pair list
				var newCityPairs = this.model.getNewCityPairs();
				for( var i = 0; i < newCityPairs.length; i++ ){
					newCityPairs[i].set( 'addedToSelector', true, { silent: true } );
					var newCityPairView = new OptionView( { model : newCityPairs[i] } );
					this.$el.find('#city-pair').append( newCityPairView.$el );
				}

				// Handle updating the funnel
				if( !$('#plane-detail').length ) {
					this.$el.find('#funnel .value.start').html( this.model.get('starts').length );
					this.$el.find('#funnel .value.signup').html( this.model.get('signups').length );
					this.$el.find('#funnel .value.paymentinfo').html( this.model.get('paymentInfos').length );
					this.$el.find('#funnel .value.activated').html( this.model.get('activations').length );
					this.$el.find('#funnel .value.converted').html( ((this.model.get('activations').length / this.model.get('starts').length) * 100).toFixed(1) + '%' );

					var topSkus = this.model.getTopSkus();
					var topSum = this.model.getTopSum();
					if( topSkus.length > 0 ){
						this.$el.find('#purchases').empty()
							.append( JST['modules/gogo/purchases']( { purchases : topSkus, sum : topSum } ) );
						this.$el.find('#purchases').fadeIn();
					}
				}
			},
			getMap: function() {
				this.map = new gmap();
				this.listenTo( this.map, 'markerClickOn', this.showFlightInfo, this );
				this.listenTo( this.map, 'markerClickOff', this.closeFlightInfo, this );
			},
			showFlightInfo: function( plane ){
				if( this.flightView ){
					this.flightView.remove();
				}
				var flight = this.collection.get( plane.id );
				this.flightView = new FlightView({ model : flight });
				this.$el.find('#map').after( this.flightView.$el );
				this.flightView.$el.show(); //.fadeIn('slow');
			},
			closeFlightInfo: function(){
				var _this = this;
				this.flightView.$el.fadeOut( 'slow', function(){
					_this.flightView.remove();
				});
			},
			updateTopBar: function(){
				this.$el.find('#topbar .value.flights').html( this.collection.length );
				this.$el.find('#topbar .value.users').html( this.model.get('starts').length );
				this.$el.find('#topbar .value.events').html( this.model.get('events') );
				this.$el.find('#topbar .value.activations').html( this.model.get('activations').length );
				this.$el.find('#topbar .value.errors').html( this.model.get('errors').length );
			},
			startSocket: function(){
				this.socket.open();

				// Set our refresh timer framerate
				var _this = this;
				this.timer =  setInterval( function() {
					_this.refresh();
				}, _this.framerate );

			},
			stopSocket: function(){
				this.socket.close();
				this.timer =  window.clearInterval( this.timer );
			}
		});
	}
);