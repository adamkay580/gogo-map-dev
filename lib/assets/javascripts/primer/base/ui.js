// # Base Components
// A set of pretty standard web app components.

define( [
	'app',
	'base/utils',
	'vendor/text!primer/templates/ui.html',
	'vendor/bootstrap.plugins'
	],
	function( App, utils, templates ) {

		var ui = {};

		templates = App.templatize( templates );

		ui.templates = templates;

		// ## Accordion
		ui.Accordion = Primer.View.extend({
			className: 'accordion',
			initialize: function( options ) {

			},
			addGroup: function( group ) {

			},
			removeGroup: function( group ) {

			},
			render: function() {
				this.$el.collapse();
				return this;
			}
		});

		// ## AccordionGroup
		ui.AccordionGroup = Primer.View.extend({
			className: 'accordion-group'
		});

		// ## Modal
		ui.Modal = Primer.View.extend({
			className: 'modal',
			events: {
				'click .curtain':'onCurtainClick',
				'click [name=close]':'close'
			},
			initialize: function( opts ) {
				opts = opts || {};
				this.parent = opts.parent || $('body');
				this.content = opts.content || '';
				// Resize the curtain if the window size changes.
				App.hub.on('app:resize', this.onResize, this );
				// Draw our modal.
				this.render();
			},
			onCurtainClick: function(e) {
				App.log('Curtain clicked');
				e.stopPropagation();
				e.preventDefault();
				return false;
			},
			onResize: function( sizes ) {
				App.log('Resize');
				this.show();
			},
			close: function( e ) {
				e.preventDefault();
				App.hub.off('app:resize', this.onResize, this );
				this.remove();
				return false;
			},
			show: function() {
				this.$el
					.find('.curtain')
						.css({
							height: $(window).height(),
							width: this.parent.css('width')
						})
						.end()
					.show();
				return this;
			},
			render: function() {
				this.$el
					.empty()
					.hide()
					.append( templates.modal() )
					.find('.content')
						.append( this.content )
						.end()
					.appendTo( this.parent );
				return this;
			}
		});

		return ui;

});