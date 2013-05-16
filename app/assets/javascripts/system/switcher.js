// # Switcher
// Switcher is a system module that listens for 'activate' and 'deactivate'
// events and "loads" the appropriate module's main view into the app.

define([ 'application' ],
    function( App ) {

        var switcher;

        switcher = new Primer.Module({
            id: 'switcher',
            initialize: function() {
                this.$app = $('#app');
                this.activeModule = null;
                App.hub.on('module:activate', this.activateModule, this );
            },

            activateModule: function( id ) {
                if ( id === this.activeModule ) return;
                this.deactivateModule();
                this.activeModule = id;
                this.$app.append( App.modules[ this.activeModule ].view.$el );
                App.hub.trigger('module:activated', this.activeModule );
            },

            deactivateModule: function() {
                if ( !this.activeModule ) return;
                App.hub.trigger('module:deactivating', this.activeModule );
                App.modules[ this.activeModule ].view.$el.detach();
                App.hub.trigger('module:deactivated', this.activeModule );
            }

        });


        // You must register the module with the app.
        App.registerModule( switcher, 'system' );

        return switcher;
});