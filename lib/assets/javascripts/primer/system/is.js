// # is System Module
// The is system module keeps track of the basic (relatively) low-level
// state of the application. It answers the questions:
// * Is the app mobile?
// * Is the app orientation landscape? Portrait?
// * Is the browser an iOS browser?
// etc.

define([ 'application' ],
    function( App ) {
        var is;

        is = new Primer.Module({
            id: 'is'
        });

        App.is = {};

        // Simple userAgent check to make a best guess whether we're on a mobile device or not.
        App.is.mobile = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) );

        App.registerModule( is, 'system' );
        return is;
});