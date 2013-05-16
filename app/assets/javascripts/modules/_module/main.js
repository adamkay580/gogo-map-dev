// # _Module
// ---------
// Provide a brief but informative description and introduction to your module
//
define( [
	'application',
	'./router',
	'./view'
	],
	function( App, Router, View ) {
		var module;

		module = new Primer.Module({
			id: '_module',
			initialize: function() {
				this.view = new View({ module: this });
				this.router = new Router({ module: this });
			}
		});

        // You must register the module with the app.
        App.registerModule( module );

		// *Always* return your module.
		return module;
	}
);