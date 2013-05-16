define([
	'application',
	'models/item'
	],
	function( App, ItemModel ) {
		return Backbone.Collection.extend({
			model: ItemModel,
			constructor: function( models, options ) {
				if ( options ) {
					if ( options.parent ) this.parent = options.parent;
				}
				Backbone.Collection.apply( this, arguments );
			},
			fetch: function( options ) {
				options = options || {};
				options.dataType = 'jsonp';
				options.parse = false;
				Backbone.Collection.prototype.fetch.call( this, options );
			}
		});
	}
);