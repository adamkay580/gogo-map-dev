define([ 'primer' ],
    function( Primer ) {

        var App;

        // Create an application object and configure it.
        // Most importantly, specify which system and app modules to load.
        App = new Primer.Application({
            id: 'testapp',
            name: 'Test Application',
            config: {
                // Runtime environment. `dev` or `prod`
                env: 'dev',

                // System modules to load
                system: [],

                // App modules
                modules: []
            }
        });

        // Stub out a router so Backbone.history.start() doesn't throw an error.
        App.router = new Backbone.Router();

        // We return the app as a standard requirejs module.
        return App;
});
