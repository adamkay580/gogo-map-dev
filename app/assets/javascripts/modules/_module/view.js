define([
	'application'
	],
	function( App ) {

		return Primer.View.extend({
			id: '_module',
			initialize: function( opts ) {
				this.module = opts.module;
				this.render();
			},
			render: function() {
				return this;
			}
		});
	}
);