define(['require'],
	function( require ) {

		console.log("Testing globalize");

		module( 'Globalize', {
			setup: function() {
				this.app = require('app');
			},
			teardown: function() {
				// this.app.hub.off();
			}
		});

		asyncTest('Returns a module', function() {
			expect(5);

			var _this = this;

			// Start an app with one system module: globalize.
			this.app.hub.on('app:ready', function() {
				ok( _this.app.hasStringModule('globalize'), 'Globalize module returned to app.' );
				equal( Globalize.culture().name, 'en', 'Current culture is en, the default.' );
				ok( _this.app.l, 'Globalize.localize convenience function placed on app.' );

				var onCultureChanged = function( culture ) {
					equal( _this.app.string.globalize.culturesLoaded.length, 1, 'Globalize only loaded one culture.');
					notEqual( _this.app.string.globalize.culturesLoaded.length, 2, 'Globalize didnt load 2 cultures. ');
					_this.app.hub.off("globalize:cultureChanged", onCultureChanged );
				};

				_this.app.hub.on("globalize:cultureChanged", onCultureChanged );

				start();
			});

			this.app.start({
				string: ['globalize'],
				modules: [],
				globalize: {
					cultures: [ 'en-US', 'fr-FR' ],
					defaultCulture: 'en-US'
				}
			});
		});

		test('Cannot load an unsupported culture', function() {
			var _this = this,
				onCultureChanged;

			expect(0);

			onCultureChanged = function( culture ) {
				ok( true, 'Culture changed successfully');
			};

			_this.app.hub.on("globalize:cultureChanged", onCultureChanged );
			_this.app.hub.trigger('setCulture', 'af-ZA');
			_this.app.hub.off("globalize:cultureChanged", onCultureChanged );
		});


		asyncTest('Changes cultures from en-US to fr-FR to en-US', function() {
			expect(8);

			var _this = this,
				onCultureChangeToFr,
				onCultureChangeToEn,
				testDateString = "1/2/2003",
				// month is zero-indexed in Date
				frDate = new Date( 2003, 1, 1 ),
				enDate = new Date( 2003, 0, 2 );

			equal( Globalize.culture().name, 'en-US', 'Starting culture is en-US');

			onCultureChangeToEn = function( culture ) {
				equal( Globalize.culture().name, culture, 'Current culture is '+ culture +'.' );
				equal( _this.app.l('red'), 'red', 'App.l() returns localized message (`red` for `red`).');
				equal( Globalize.parseDate( testDateString ).getTime(), enDate.getTime(), testDateString + ' interpreted as Jan 2, 2003.'  );
			};

			onCultureChangeToFr = function( culture ) {
				notEqual( _this.app.string.globalize.culturesLoaded.length, 1, 'Globalize has loaded more than 1 culture. ');
				equal( Globalize.culture().name, culture, 'Current culture is '+ culture +'.' );
				equal( _this.app.l('red'), 'rouge', 'App.l() returns localized message (`rouge` for `red`).');
				equal( Globalize.parseDate( testDateString ).getTime(), frDate.getTime(), testDateString + ' interpreted as Feb 1, 2003.'  );

				_this.app.hub.off("globalize:cultureChanged", onCultureChangeToFr );
				_this.app.hub.on("globalize:cultureChanged", onCultureChangeToEn );
				_this.app.hub.trigger('setCulture', 'en-US');
			};


			// Start an app with one system module: globalize.
			_this.app.hub.on("globalize:cultureChanged", onCultureChangeToFr );
			_this.app.hub.trigger('setCulture', 'fr-FR');
			start();
		});




	}
);