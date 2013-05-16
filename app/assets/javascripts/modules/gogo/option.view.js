define([
	'application'
	],
	function( App ) {

		return Primer.View.extend({
			tagName: 'option',
			events:{
			},
			initialize: function(){
				_.bindAll( this, 'render', 'refresh' );

				this.listenTo( this.model, 'change', this.refresh, this );

				this.render();
			},
			onClose: function() {
				this.stopListening();
			},
			render: function(){
				var newItem = { name : this.model.get('id'), count : 1 };
				this.$el.empty()
					.append( JST['modules/gogo/option']( { item : newItem } ) );
				return this;
			},
			refresh: function( model ){
				var oldCount = parseInt( this.$el.find('.count').html() );
				
				var count = 0;
				var flights = this.model.get('flights');
				for( var flight in flights ){
					count++;
				}
				if( oldCount != count )
				this.$el.find('.count').html( count );
			}
		});
	}
);