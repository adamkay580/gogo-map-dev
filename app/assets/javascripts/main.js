require( [
    // Basic dependencies
    'jquery',
    'underscore',
    'backbone',

    // Primer
    'primerjs',

    // Our app
    'application',

    // Plugins
    'bootstrap.plugins',
    'jquery.sparkline',

    // Primer and/or System Modules
    'primer/system/is',
    'primer/system/templates',

    'system/globalize',
    'system/switcher',
    'system/error',

    // App Modules
    'modules/gogo/main',
    'templates'
    ],

    function( $, _, Backbone, Primer, App ) {
        $( function() {
            App.start();
        });
    }
);
