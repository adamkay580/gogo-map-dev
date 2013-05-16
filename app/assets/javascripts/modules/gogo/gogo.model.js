var tests = [];

define([
	'application', 	
	'utils/topcontent',
	'./option.collection'
	],
	function( App, TopContent, OptionCollection ) {
		return Backbone.Model.extend({
				defaults: {
					events: 0,
					starts: [],
					signups: [],
					paymentInfos: [],
					captchas: [],
					activations: [],
					errors: []
				},
				initialize: function(){
					this.airlineCollection = new OptionCollection();
					this.cityPairCollection = new OptionCollection();

					this.topSkus = new TopContent({ itemKey : 'name', topCount : 5, trimWindow : 0 });

					$.ajax({
						dataType: "json",
						url: '/assets/utils/gogosku.json',
						context: this,
						success: function( json ){
							App.skuDictionary = json;
						},
						error: function() {
							App.log('Could not get the sku dictionary!');
						}
					});
				},
				addSku: function( event ){
					var sku = event('data.wt.pn_sku');
					revenue = event('data.wt.tx_s') || 0;
					var name = App.skuDictionary[sku];
					var newSkuItem = {
						'name' : name,
						'revenue' : parseFloat( revenue )
					}
					this.topSkus.push( newSkuItem );
				},
				getTopSkus: function( event ){
					return this.topSkus.getTop();
				},
				getTopSum: function(){
					return this.topSkus.getTopCountSum();
				},
				addAirline: function( event ){
					var airlineEntry = { id : event( 'data.airline' ), flightNumber : event( 'data.flight_no' ) };
					this.airlineCollection.addOrUpdate( airlineEntry ); 
				},
				addCityPair: function( event ){
					var cityPairEntry = { id : event( 'data.flight_details' ), flightNumber : event( 'data.flight_no' ) };
					this.cityPairCollection.addOrUpdate( cityPairEntry ); 
				},
				addStep: function( step, flightNumber, ref ){
					
					var stepString = step[0];
					
					//console.log(stepString,stepString.indexOf('ACTIVATED'));
															
					//console.log(stepString.indexOf('SPLASH'));

					//only allow in abp_purchase-related items
		//			if(stepString.indexOf("ABP_PURCHASE") > -1 ) {
							
						if(stepString.indexOf('ACTIVATED') > -1 && stepString.indexOf('LOGINACTIVATED') == -1){
							
							this.get('activations').push( flightNumber );
	
						} else if (stepString.indexOf('PURCHASE') > -1){
							
							this.get('paymentInfos').push( flightNumber );
	
						} else if (stepString.indexOf('SIGNUP') > -1){
							
							this.get('signups').push( flightNumber );
	
						} else if (stepString.indexOf('SPLASH') > -1){
							
							this.get('starts').push( flightNumber );
	
					} 
					
			//		}
					
					
					
					/*
switch( step[0] ){
						case 'STEP_1':
							this.get('starts').push( flightNumber );
							break;
						case 'STEP_2':
							this.get('signups').push( flightNumber );
							break;
						case 'STEP_3':
							this.get('paymentInfos').push( flightNumber );
							break;
						case 'STEP_5':
							this.get('activations').push( flightNumber );
							break;
					}
*/
				},
				addError: function( error, flightNumber ){
					this.get('errors').push( { 'error': error, 'flightNumber': flightNumber } );
				},
				getNewAirlines: function() {
					return this.airlineCollection.getNewOptions();
				},
				getNewCityPairs: function() {
					return this.cityPairCollection.getNewOptions();
				}
			});
	}
);