define(['require'],
	function( require ) {

		module( '_Module', {
			setup: function() {
				this.app = require('app');
			},
			teardown: function() {

			}
		});

		asyncTest('Returns a module', function() {
			expect(1);

			var _this = this;

			// Start an app with one system module: _module.
			this.app.hub.on('app:ready', function() {

				ok( _this.app.hasModule('_module'), '_Module returned to app.' );

				start();
			});

			this.app.start({
				system: ['_module'],
				modules: []
			});
		});


	}
);
