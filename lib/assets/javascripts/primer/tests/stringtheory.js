define(['require'],
	function() {

		module( 'Primer.Events', {
			setup: function() {
				var Primer = require('stringtheory');
				this.hub = new Primer.Events();
			}
		});

		test( 'Events instance created.', function() {
			expect(3);
			ok( this.hub && _.isFunction(this.hub.on), 'Has `on` Function.');
			ok( this.hub && _.isFunction(this.hub.off), 'Has `off` Function.');
			ok( this.hub && _.isFunction(this.hub.trigger), 'Has `trigger` Function.');
		});

		test( 'Events can be registered and triggered', function() {
			expect(1);
			var handler = function( event ) {
				ok(true, 'handler func called for ' + event + '.');
			};

			this.hub.on( 'click', handler );
			this.hub.trigger('click', '`click` event');
		});

		test( 'Events can be namespaced', function() {
			expect(9);

			console.log('-------------');

			var counter = 0;

			var testHandler = function( event ) {
				ok(true, 'testHandler called from '+ event + '.' );
				counter++;
			};

			var test2Handler = function( event ) {
				ok(true, 'test2Handler called from '+ event + '.' );
				counter++;
			};

			var test3Handler = function( event ) {
				ok(true, 'test3Handler called from '+ event + '.' );
				counter++;
			};

			this.hub.on( 'click.test', testHandler );
			this.hub.on( 'click.test2', test2Handler );
			this.hub.on( 'click.test3', test3Handler );
			this.hub.on( 'focus.test2', test2Handler );
			this.hub.trigger( 'click.test', 'click.test' );
			this.hub.trigger( 'click.test2', 'click.test2' );
			this.hub.trigger( 'click.test3', 'click.test3' );
			// counter == 3
			this.hub.trigger( 'focus', 'focus' );
			// counter == 4
			this.hub.trigger( 'click', 'click' );
			// counter == 7
			this.hub.off( 'click.test' );
			this.hub.trigger('click.test');
			// counter == 7

			this.hub.off( '.test2' );
			// Only click.test3 should remain
			this.hub.trigger('click', 'click' );
			// counter == 8
			this.hub.trigger('focus', 'focus' );
			// counter == 8

			equal( counter, 8, 'Handlers called 8 times.');


		});

		module( 'Primer.Application', {
			setup: function() {
				var Primer = require('stringtheory');
				this.app = new Primer.Application({ id: 'testapp' });
			}
		});


		test('Primer returns a RequireJS module', function() {
			expect(1);
			ok( Primer && Primer.Application, 'Primer and Primer.Application exist' );
		});


		test('Acts like a new application', function() {
			expect(5);
			equal( this.app.id, 'testapp', 'The value expected is `testapp`.');
			equal( this.app.config.modules.length, 0, 'Has 0 modules');
			equal( this.app.config.system.length, 0, 'Has 0 system modules');
			ok( this.app.hub, 'Has a hub');
			ok( this.app.hub.trigger('ok'), 'Hub can trigger events');
		});


		module( 'Primer.Module', {
			setup: function() {
				var Primer = require('stringtheory');
				this.module = new Primer.Module({
									id: 'testmodule',
									initialized: false,
									counter: 0,
									initialize: function() {
										this.initialized = true;
									}
								});
			}
		});

		test('Instantiates a module', function() {
			expect(1);
			equal( this.module.id, 'testmodule', 'Id expected is `testmodule`.');
		});

		test('Custom initialize function called', function() {
			expect(1);
			equal( true, this.module.initialized, "Module.initialized is true.");
		});



		module( 'Primer.View', {
			setup: function() {
				var Primer = require('stringtheory');
				var TestView = Primer.View.extend({
									id: 'test',
									initialize: function() {
										this.setOptions( { fruit: 'apple', test: function(a) { return 1+a; } } );
										this.initialized = true;
									}
								});

				this.view = new TestView();
			}
		});

		test('Instantiates a Primer View', function() {
			expect(3);
			ok( this.view, 'View object created.');
			equal( this.view.id, 'test', 'View Id expected to be `test`.');
			equal( this.view.initialized, true, 'initialize() called. View.initialized is true.' );
		});

		test('View can set custom options on itself.', function() {
			expect(3);
			ok( this.view.fruit, 'View has a `fruit` property.');
			notEqual( this.view.fruit, 'kiwi', 'View.fruit is not equal to `kiwi`.' );
			equal( this.view.fruit, 'apple', 'View.fruit is equal to apple.' );
		});

		test('View can set custom function on itself', function() {
			expect(2);
			ok( this.view.test, 'View has a `fruit` property.');
			equal( this.view.test(2), 3, 'View.test() returns 3.' );
		});

	}
);
