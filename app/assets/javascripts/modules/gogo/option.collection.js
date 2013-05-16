define([
	'application',
	],
	function ( App ) {

		return Backbone.Collection.extend({
			initialize: function(){

			},
			addOrUpdate: function( event ){
				var id = event.id;
				var existingOption= this.get( id );
				var flight = event.flightNumber;

				if( !existingOption ){
					var newOption = {
						'id' : id,
						'addedToSelector' : false,
						flights : {}
					}
					newOption.flights[flight] = true;
					this.add( newOption );
				} else {
					existingOption.get('flights')[flight] = true;
					existingOption.trigger( 'change', existingOption );
				}

			},
			getNewOptions: function(){
				return this.where({ addedToSelector : false });
			}
		});
	}
);