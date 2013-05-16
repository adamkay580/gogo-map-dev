define(
	// We pass in Require so we can use relative paths with require() in the module.
	[ 'require', 'application', 'globalize' ],
	function( require, App ) {
		var globalize,
			// Store values we don't want changed here in a closure. Accessible from our module
			// internally, but not from other modules or the console. Set it and forget it.
			initialized = false,
			defaultConfig = {
				cultures: ['en-US'],
				defaultCulture: 'en-US',
				messagesPath: 'messages'
			},
			config = _.extend( defaultConfig, App.config.globalize );

		// Set a convenience function on App for easy localization.
		App.l = function() {
			return Globalize.localize.apply( Globalize, arguments );
		};

		// Define our module
		globalize = new Primer.Module({
			id: 'globalize',
			culture: config.defaultCulture,
			culturesLoaded: [],
			initialize: function() {
				if ( initialized ) return;
				this._setCulture = this._setCulture.bind( this );
				App.hub.on('setCulture', this.setCulture, this );
				this.setCulture( this.culture );
				initialized = true;
			},
			_setCulture: function( culture ) {
				this.culture = culture;
				App.hub.trigger('globalize:cultureChanged', this.culture );
			},
			setCulture: function( culture ) {
				var _this = this;

				// Check to see if culture requested is supported by the app.
				if ( !culture || !_(config.cultures).contains( culture ) ) return;

				// If we've loaded the culture before, just call Globalize.culture()
				if ( _( this.culturesLoaded ).contains( culture ) ) {
					Globalize.culture( culture );
					this._setCulture( culture );
				}
				// Otherwise, load the appropriate culture file and messages
				else {
					require( [ 'cultures/globalize.culture.'+ culture,
							   config.messagesPath+'/'+ culture  ],
						function( cultureInfo, msgs ){
							Globalize.addCultureInfo( culture, {
								messages: msgs
							});
							_this.culturesLoaded.push( culture );
							_this.setCulture( culture );
					} );

				}

			}
		});

		App.registerModule( globalize, 'system' );
		return globalize;
});