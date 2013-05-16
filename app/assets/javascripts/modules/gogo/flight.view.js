define([
	'application'
	],
	function( App ) {

		return Primer.View.extend({
			id: 'plane-detail',
			events: {
			},
			target: 20, // num users targeted per flight,
			flightActivationIncrement: 20, // num minutes to group activations by
			initialLineChartMax: 10,
			initialize: function( opts ) {
				_.bindAll( this, 'render', 'refresh' );

				this.framerate = opts.framerate || 500;

				this.listenTo( this.model, 'change', this.refresh, this );

				var _this = this;
				// This is a timer for asyncronous refreshing should we need it.
				this.refreshTimer = setInterval( function() {
					_this.refreshSparkline();
				}, this.framerate );

				this.render();

			},
			onClose: function() {
				this.stopListening();
			},

			render: function(){
				this.$el.removeClass().addClass(this.model.get('airline'));
				this.$el.empty()
					.append( JST['modules/gogo/flight']( { flight : this.model } ) );
				$('#funnel .value.start').html( 0 );
				$('#funnel .value.signup').html( 0 );
				$('#funnel .value.paymentinfo').html( 0 );
				$('#funnel .value.captcha').html( 0 );
				$('#funnel .value.activated').html( 0 );

				$('#purchases').empty()
					.append( JST['modules/gogo/purchases']( { purchases : [] } ) );
				$('#purchases').hide();

				// All flights

				this.refresh();
				this.refreshSparkline();

				return this;
			},

			refresh: function( model ){
				this.$el.find('.value.users').html( this.model.get('starts') );

				var activated = this.model.get('activations').length;
        		var starts = this.model.get('starts');
        		var divisor = starts < activated ? activated : starts;
        		divisor = this.target;
        		var activatedpercent = '0';

        			activatedpercent = (( activated / divisor ) * 100 ).toFixed(1);

				this.$el.find('.value.activation').html( this.model.get('activations').length );
				//this.$el.find('.value.starts').html( starts );
				this.$el.find('.value.activatedpercent').html( activatedpercent + '%' );
				this.$el.find('.colorbar.activation').css({
					width: (( activated / divisor ) * 300) + 'px'
				});

				var events = this.model.get('events');
				var percentage = '0';
				if( starts ){
					percentage = (( starts / this.target ) * 100 ).toFixed(1);
				}

				this.$el.find('.value.errors').html( starts );
				//this.$el.find('.value.events').html( events );
				this.$el.find('.value.errorpercent').html( percentage + '%' );
				this.$el.find('.colorbar.errors').css({
					width: (( starts / this.target ) * 300) + 'px'
				});

				$('#funnel .value.start').html( this.model.get('starts') );
				$('#funnel .value.signup').html( this.model.get('signups') );
				$('#funnel .value.paymentinfo').html( this.model.get('paymentInfos') );
				$('#funnel .value.captcha').html( this.model.get('captchas') );
				$('#funnel .value.activated').html( this.model.get('activations').length );
				if( starts ) {
					var convertedrate = ((this.model.get('activations').length / starts) * 100).toFixed(1);
				} else {
					var convertedrate = 100;
				}
				$('#funnel .value.converted').html( convertedrate + '%' );


				var topSkus = this.model.getTopSkus();
				var topSum = this.model.getTopSum();
				if( topSkus.length > 0 ){
					$('#purchases').empty()
						.append( JST['modules/gogo/purchases']( { purchases : topSkus, sum : topSum } ) );
					$('#purchases').fadeIn();
				}
			},

			refreshSparkline: function () {
				// Sparklines
				var groupedActivations = this.model.groupActivations( this.flightActivationIncrement );
				var sparkOpts = {
					fillColor: false,
					lineColor: '#068fcf',
					lineWidth: 2,
					width: 300,
					height: 90,
					spotColor: false,
					maxSpotColor: false,
					minSpotcolor: false,
					highlightSpotColor: null,
					highlightLineColor: '#95D1EC'
				};
				if ( _.max( groupedActivations ) < this.initialLineChartMax ) {
					sparkOpts.chartRangeMax = this.initialLineChartMax;
				}

				var increment = this.flightActivationIncrement,
					pad = function( num ) {
						return ( num.length < 2 ) ? '0'+num : num;
					};
				this.$('#graph-activations')
						.empty()
						.append( JST['modules/gogo/flight-activations']( {
									xaxis: _.map( groupedActivations, function(a, index) {
										var minutes = index*increment;
										return ( minutes < 60) ? ':'+ pad(minutes) : Math.round(minutes/60) +':'+ pad(minutes%60);
									})
								}) )
						.find('#graph')
							.sparkline( groupedActivations, sparkOpts );

			}
		});
	}
);