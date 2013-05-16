//

define([ 'primerjs', 'config' ],
    function( Primer ) {
        var App,
            config = window.config;

        App = new Primer.Application({
            id:     'primer',
            name:   'Webtrends Primer',

            config: _.extend({
                // Used as parameter in Backbone.history.start.
                root:   '/',

                // Runtime environment. `dev` or `prod`.
                env:    'dev',

                // String modules to load
                string: [ ],

                // System modules to load
                system: [ ],

                // App modules
                modules: [ ],

                // Custom options that other modules may be expecting.
                globalize: {
                    cultures: [ 'en-US', 'fr-FR', 'ja-JP' ],
                    defaultCulture: 'en-US'
                }
            }, config),

        });

        // We return the app as a standard requirejs module.
        return App;
    }
);
