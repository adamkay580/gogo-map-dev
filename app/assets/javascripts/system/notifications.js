// # Notifications System Module
// Notifications listens for 'notify' events on the hub and
// displays simple status messages to the user.

define([
    'application'
    ],
    function( App ) {

        var notifications;

        notifications = new Primer.Module({
            id: 'notifications',
            initialize: function() {
                App.hub.on('notify', this.notify, this );
            },
            notify: function( msg ) {
                $('body').append( JST['system/notifications-msg']({ msg: msg }));
            }
        });

        // You must register the module with the app.
        App.registerModule( notifications, 'system' );

        return notifications;
});