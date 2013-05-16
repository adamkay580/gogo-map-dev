define([ 'application' ],
	function( App ) {
		return Backbone.Router.extend({
			routes: {
				'creator': 'start'
			},
			initialize: function( opts ) {
				this.module = opts.module;
			},
			activate: function() {
				App.hub.trigger('module:activate', this.module.id );
			},
			start: function() {
				this.activate();
			}
		});
	}
);