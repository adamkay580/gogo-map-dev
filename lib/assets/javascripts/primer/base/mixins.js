// Mixins for Javascript objects are made available to the application
// through core/mixins.js. To apply a mixin to an object or function,
// call the mixin, passing the source object or prototype as the `this`
// context:
//
//     var Person = function() {};
//     mixins.extensible.call( Person.prototype );
//     var Child = Person.extend( { innocent: true } );
//
// To add a mixin, just add a property to the `mixins` object that is
// a function that sets methods and properties on `this`.

define( function() {
	var mixins = {};

	mixins.extensible = function() {
		this._super = function( method ) {
			var args = Array.prototype.slice.call( arguments, 1 ),
				_method = this.prototype[ method ];
			if ( !_method  )
				throw Error( "Method `"+ method +"` does not exist on prototype." );

			_method.apply(this, args );
		};
		this.extend = function( props ) {
			for ( var p in props ) {
				this[p] = props[p];
			}
			return this;
		};
	};

	return mixins;
});