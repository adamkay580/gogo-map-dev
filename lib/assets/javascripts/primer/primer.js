//
// # Primer.js
// -----------------
// The Primer project, in addition to providing out-of-the-box
// scaffolding for different projects, is also a small javascript
// library of objects to use for building front-end applications.
//
(function( window, undefined ) {

        var Primer = {};

        Primer.VERSION = '0.1';

        /*
         * Primer.Application
         */

        Primer.Application = function( options ) {

            // Check for existing instance first
            if ( typeof Primer.Application.instance === 'object' )
                return Primer.Application.instance;

            this.id = options.id || 'app';
            this.config = {
                root: '/',
                env: 'dev',
                modules: [],
                system: [],
                pushState: true,
                passThruLinks: true
            };
            this.modules = {};
            this.system = {};
            this.string = {};
            this.hub = _.clone( Backbone.Events );
            this.running = false;
            this.pending = { string: [], system: [], modules: [] };

            // Give an app the chance to override any defaults.
            _.extend( this, options, { config: _.extend( this.config, options.config ) } );

            // Cache our instance
            Primer.Application.instance = this;

            // By default, listen for the appModulesLoaded event and start.
            this.hub.on('app:appModulesLoaded', this._checkReadyStatus, this );
            $(window).on('resize', _.bind( this.onResize, this ) );

            this.initialize();
            this.log("Primer.Application initialized.");
        };
        _.extend( Primer.Application.prototype, Backbone.Events, {
            initialize: function() {},
            _checkReadyStatus: function() {
                if ( (this.pending.system.length + this.pending.modules.length) === 0 )
                    this._ready();
            },
            _ready: function() {
                this.hub.trigger('app:ready');
                if ( this.config.passThruLinks ) this.passThruLinks();
                Backbone.history.start( this.config.pushState, this.root );
            },
            // Taken shamelessly from http://addyosmani.github.com/backbone-fundamentals/#setup
            passThruLinks: function() {
                $(document).on('click', 'a:not([data-bypass])', function( e ) {
                    // Get the absolute anchor href.
                    var href = $(this).attr('href');

                    // If the href exists and is a hash route, run it through Backbone.
                    if (href && href.indexOf('#') === 0) {
                      // Stop the default event to ensure the link will not cause a page
                      // refresh.
                      e.preventDefault();

                      // `Backbone.history.navigate` is sufficient for all Routers and will
                      // trigger the correct events. The Router's internal `navigate` method
                      // calls this anyways.  The fragment is sliced from the root.
                      Backbone.history.navigate(href, true);
                    }
                });
            },
            hasModule: function( id, modulestore ) {
                var modules = this[ (modulestore || 'modules') ];
                return _.any( modules, function(m) { return m.id === id; } );
            },
            hasStringModule: function( id ) {
                return this.hasModule( id, 'string' );
            },
            hasSystemModule: function( id ) {
                return this.hasModule( id, 'system' );
            },
            registerModule: function( module, store ) {
                var modulestore = this[ store || 'modules' ];

                if ( module instanceof Primer.Module ) {
                    modulestore[ module.id ] = module;
                    module.trigger('registered');

                    if ( !module.ready ) {
                        this.pending[ store || 'modules' ].push( module.id );
                        module.on('ready', this.markModuleReady, this );
                    }
                }

                this.hub.trigger( 'app:'+ ( store || 'app' ) +'ModuleRegistered', module );
            },

            loadModule: function(  module, store ) {
                _.isFunction( module.initialize ) && module.initialize();
                this.hub.trigger( 'app:'+ ( store === 'modules' ? 'app': store ) +'ModuleLoaded', module );
            },

            markModuleReady: function( module, store ) {
                var list = this.pending[ store || 'modules' ],
                    idIndex = list.indexOf( module.id );
                list.splice( 0, idIndex ).concat( list.splice( idIndex ) );
                module.off('ready', this.markModuleReady, this );
                this._checkReadyStatus();
            },
            onResize: function() {
                var $body = $('body');
                this.hub.trigger('app:resize', { width: $body.width(), height: $body.height() } );
            },

            start: function( config ) {

                // Quick check to prevent any weirdness.
                if ( this.running ) return;

                var _this = this,
                    stringModules,
                    systemModules,
                    appModules;

                // Set current state of the app.
                this.running = true;

                // Override any preset configuration in case start() is being called
                // after some bootstrapping has been done.
                _.extend( this.config, config );

                // Modules have already been loaded as dependencies of the main AMD
                // The app must go through and call initialize() on each one. We do
                // this here because the DOM should be ready at this point, whereas
                // when the modules were loading, there was no guarantee the DOM was
                // ready.

                // Map any modules to appropriate paths first.
                stringModules = _.map( this.config.string, function(m) { return 'primer/system/' + m; } );
                systemModules = _.map( this.config.system, function(m) { return 'system/' + m; } );
                appModules = _.map( this.config.modules, function(m) { return 'modules/' + m + '/main'; } );

                if ( stringModules.length + systemModules.length + appModules.length === 0 ) {

                    _.each( ['string', 'system', 'modules' ], function( store ) {
                        _.each( _this[store], function( mod ) {
                            _this.loadModule( mod, store );
                        });
                        _this.hub.trigger('app:'+ (store === 'modules' ? 'app' : store ) +'ModulesLoaded' );
                    });

                } else {

                    // Load string modules first.
                    require( stringModules, function() {
                        _.each( arguments, function( arg ) {
                            _this.loadModule( arg, 'string' );
                        });

                        // Let anything listening know we're finished.
                        _this.hub.trigger('app:stringModulesLoaded');

                        // Then app system modules.
                        require( systemModules, function() {
                            _.each( arguments, function( arg ) {
                                _this.loadModule( arg, 'system' );
                            });

                            // Let anything listening know we're finished.
                            _this.hub.trigger('app:systemModulesLoaded');

                            // System modules are ready. Load app modules next.
                            require( appModules, function() {
                                _.each( arguments, function( arg ) {
                                    _this.loadModule( arg );
                                });

                                // Let anything listening know we're finished.
                                _this.hub.trigger('app:appModulesLoaded');
                            });
                        });
                    });
                }

            },
            log: function() {
                // this.log.history = this.log.history || [];
                return ( this.config.env.toLowerCase() === 'dev' )
                        ? console.log.apply( console, arguments )
                        : void(0);
            }
        });


        /*
         * Primer.Module
         */
        Primer.Module = function( config ) {

            // The application needs a module id, so we do a quick check first.
            if ( !config.id )
                throw new Error('Primer.Module: Specify a module id.');

            // By default, all modules are ready when initialized.
            this.ready = true;

            // We want modules to be able to turn off `ready` status, if they
            // need to wait for anything to load, or need to get data from a
            // service, so we override the config here.
            _.extend( this, config );

            // Automatically add an eventbinder, if support exists.
            if ( Backbone.EventBinder )
                this.binder = new Backbone.EventBinder();

        };
        _.extend( Primer.Module.prototype, Backbone.Events, {
            initialize: function() {}
        });


        /*
         * Primer.View
         */
        Primer.View = Backbone.View.extend({
            _delegateEvents: Backbone.View.prototype.delegateEvents,

            constructor: function() {
                this.views = {};
                if ( Backbone.EventBinder )
                    this.binder = new Backbone.EventBinder();
                Backbone.View.prototype.constructor.apply( this, arguments );
            },

            setOptions: function( opts ) {
                // TODO: Strip out Backbone special props (id, collection, etc.)
                if ( opts && _.isObject( opts ) )
                    _.extend( this, opts );
            },

            delegateEvents: function() {
                // If we have any child views, redelegate them as well
                for ( var vid in this.views )
                    if ( this.views[ vid ].delegateEvents )
                        this.views[ vid ].delegateEvents();

                this._delegateEvents();
            },

            // See: http://lostechies.com/derickbailey/2011/09/15/zombies-run-managing-page-transitions-in-backbone-apps/
            close: function() {
                for ( var vid in this.views ) {
                    if ( this.views[ vid ].close  && _.isFunction( this.views[ vid ].close ) )
                        this.views[ vid ].close();
                }

                if ( this.onClose && _.isFunction( this.onClose ) )
                    this.onClose();

                this.remove();
                this.unbind();
            }
        });

    // Expose String as a global object.
    window.Primer = Primer;

    // If a project is using RequireJS, define String as a AMD module.
    // Dependencies should be defined in the app's config.js file, so even though
    // String relies on jQuery, Underscore, and Backbone, we're assuming those
    // will either be loaded, or the dependency defined in the app's config.
    if ( typeof define === "function" && define.amd ) {
        define( 'primerjs', [], function() { return Primer; } );
    }

})( window );