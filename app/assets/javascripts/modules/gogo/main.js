// # _Module
// ---------
// Provide a brief but informative description and introduction to your module
//
define( [
	'application',
	'./router',
	'./view'
	],
	function( App, GogoRouter, GogoView ) {
		var module = new Primer.Module({
			id: 'gogo',
			urlRoot: 'editor',
			initialize: function() {
				this.view = new GogoView({ module: this });
				this.router = new GogoRouter({ module: this });
			}
		});

        // You must register the module with the app.
        App.registerModule( module );

		// *Always* return your module.
		return module;
	}
);