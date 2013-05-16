// # _Module: Boilerplate System Module
// Provide a description of your module here.

define([ 'application' ],
    function( App ) {

        var module;

        module = new Primer.Module({
            id: '_module',
            initialize: function() {
            }
        });

        // You must register the module with the app.
        App.registerModule( module, 'system' );

        return module;
});