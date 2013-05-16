define([
	'application',
	'utils/constants'
	],
	function ( App, constants ) {
		return Backbone.Model.extend({
			idAttribute: 'idkey',
			itemType: -1,
			url: function() {
				return constants.api.urls.VIEW + this.get('itemKey');
			},
			constructor: function( attributes, options ) {
				if ( options && options.parent ) this.parent = options.parent;
				
				Backbone.Model.apply( this, arguments );
			},
			domainId: function(){
				return this.collection.domainId;
			},
			fetch: function( options ) {
				options = options || {};
				options.dataType = 'jsonp';
				Backbone.Model.prototype.fetch.call( this, options );
			}
		});
});