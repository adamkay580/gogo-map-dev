// # templates System Module
// The templates system module adds basic templating functionality
// to the application using UnderscoreJS's template() function.

define([ 'application' ],
    function( App ) {

        var templates;

        templates = new Primer.Module({
            id: 'templates',
            // ## templatize
            // Takes html and finds each instances of data-_dataAttrName_
            // within it, reading that block as a separate turns into a
            // compiled template using Underscore's `template()` function.
            //
            // Returns an object with all templates found and compiled,
            // keyed to _dataAttrName_ (data-template-name by default).
            templatize: function( html, dataAttrName ) {
                var t = {};
                dataAttrName = dataAttrName || 'template-name';
                $(html)
                    .find('[data-'+ dataAttrName +']')
                    .each( function() {
                        t[ $(this).data( dataAttrName ) ] = _.template( this.innerHTML.replace('&lt;', '<').replace('&gt;', '>') );
                    });
                return t;
            }
        });

        App.templatize = templates.templatize;
        App.registerModule( templates, 'system' );
        return templates;

});