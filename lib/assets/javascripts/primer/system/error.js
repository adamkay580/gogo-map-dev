define( [ 'app' ],
	function( App ) {

		var error;

		error = new Primer.Module({
			id: 'error',
			initialize: function() {
				App.hub.on('error', this.onError, this );
			},
			onError: function( errObj ) {
				// Display an error
			}
		});

		App.registerModule( error, 'system' );
		return error;
});