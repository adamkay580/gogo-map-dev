// # Error
// Error is a system module that listens for 'error' events and
// displays a simple message that can be clicked away.

define([
    'application'
     ],
    function( App ) {

        var error;

        error = new Primer.Module({
            id: 'error',
            initialize: function() {
                this.$app = $('#app');
                App.hub.on('error', this.showError, this );
            },
            showError: function( opts ) {
                var $parent = opts.parent || $('body'),
                    msg = opts.msg || App.l('errorGenericError'),
                    $error = $( JST['system/error']({ msg: msg }))
                                .on('click', '[name=close]', function(e) {
                                    e.preventDefault();
                                    $(this).remove();
                                });
                $parent.append( $error );
            }
        });


        // You must register the module with the app.
        App.registerModule( error, 'system' );

        return error;
});