/*
Google Maps configuration and functions.
*/

define([
	'application',
	'async!https://maps.googleapis.com/maps/api/js?key=AIzaSyDQlYZIaNHyNW9hDFONyVVQ7bD4Mqs_uec&sensor=false'
	],
	function( App ) {

		return Primer.View.extend ({
			id: 'google-map',

			initialize: function() {

				// Setup the Google Maps options
				this.opts = {
					center: new google.maps.LatLng(38.134557, -96.722656),
					zoom: 5,
					mapTypeId: google.maps.MapTypeId.ROADMAP,
					panControl: false,
					streetViewControl: false,
					mapTypeControlOptions: {
						position: google.maps.ControlPosition.TOP_RIGHT
					},
					zoomControlOptions: {
						style: google.maps.ZoomControlStyle.SMALL,
						position: google.maps.ControlPosition.TOP_RIGHT
					},
					styles: 
					[
	                    {
	    					featureType: "water",
	    					elementType: "geometry.fill",
	    					stylers: [
	        					{ visibility: "on" },
	        					{ color: "#a5bfdd" }
	    					]
						},
						{
						    featureType: "road",
						    stylers: [
						      { "visibility": "off" }
						    ]
						  },{
						    featureType: "administrative.land_parcel",
						    stylers: [
						      { "visibility": "off" }
						    ]
						  },{
						    featureType: "poi",
						    stylers: [
						      { "visibility": "off" }
						    ]
						  },{
						    featureType: "landscape.natural",
						    stylers: [
						      { "visibility": "off" }
						    ]
						  },{
						    featureType: "administrative.province",
						    stylers: [
						      { "visibility": "on" },
						      { "weight": 1 },
						      { "color": "#808080" }
						    ]
						  },{
						    featureType: "landscape.man_made",
						    stylers: [
						      { "visibility": "off" }
						    ]
						  },{
						    featureType: "landscape.natural.terrain",
						    stylers: [
						      { "visibility": "off" }
						    ]
						  },
						  {
						    featureType: "landscape.natural",
						    stylers: [
						      { "visibility": "on" },
						      { "color": "#ececda" }
						    ]
					  },
					  {
					    featureType: "administrative.province",
					    elementType: "labels.text",
					    stylers: [
					      { "visibility": "simplified" }
					    ]
					  },
					  {
					    featureType: "administrative.country",
					    elementType: "labels.text",
					    stylers: [
					      { "visibility": "off" }
					    ]
					  }
						
					],

					// Custom options not part of Google:
					wt: {
						activationOpts: {
							center: new google.maps.LatLng(0,0),
							fillColor: '#068FCF',
							fillOpacity: 0.9,
							radius: 100,
							visible: false
						}
					}
				};
				//this.opts.wt.defaultIcon.path = this.opts.wt.markerDefault;

				var _this = this;
				this.planes = {};
				this.activePlane = null;

				// Generate the map
				this.map = new google.maps.Map(
					document.getElementById("map"),
					this.opts
				);

				// Create the info window for popups
				this.infowindow = new google.maps.InfoWindow({
					content: '', // Will be set by each plane
				});

				// map clicks close any open flights
				google.maps.event.addListener(this.map, 'click', function() {
					if(_this.activePlane) {
						_this.toggleDetailsView(_this.activePlane, true);
					}
				});
			},

			plane: function(flight, parent) {
				var self = this;

				this.defaultIcon = {
					path: 'M16.093,5.45v6.28l11.632,7.89l0.092,0.064C27.921,19.79,28,19.947,28,20.104v1.674c0,0.156-0.079,0.313-0.184,0.419c-0.156,0.157-0.405,0.222-0.614,0.144l-11.108-3.938v6.41c0.471,0.263,3.991,2.211,4.188,2.408c0.105,0.104,0.183,0.262,0.183,0.418v1.676c0,0.156-0.079,0.313-0.183,0.418c-0.145,0.144-0.366,0.209-0.575,0.156l-5.692-1.635L8.322,29.89c-0.222,0.065-0.444,0-0.588-0.144c-0.118-0.118-0.184-0.263-0.184-0.418L7.537,27.64c0-0.156,0.079-0.313,0.183-0.418c0.196-0.195,3.716-2.146,4.187-2.408v-6.41L0.798,22.341c-0.209,0.078-0.458,0.014-0.615-0.144C0.079,22.093,0,21.937,0,21.778v-1.676c0-0.156,0.079-0.313,0.184-0.418c0.026-0.025,0.052-0.052,0.091-0.064l11.632-7.89V5.45c0-1.361,0.118-4.017,1.138-5.038c0.55-0.549,1.361-0.549,1.91,0C15.977,1.433,16.094,4.089,16.093,5.45z',
					scale: 1,
					strokeWeight: 0,
					rotation: flight.get('flightStats').tracks[0].bearing,
					fillOpacity: 1,
					fillColor: 'rgba(0,0,0,.6)'
				};

				this.marker = parent.createMarker(flight, this.defaultIcon);
				this.path = parent.createPath(flight);
				
				var pct = flight.get('starts') < flight.get('activations').length ? flight.get('activations').length : flight.get('starts');
				this.from = flight.get('flightPath').split(' to ')[0].substr(1,3);
				this.to = flight.get('flightPath').split(' to ')[1].substr(1,3);

				this.content = '<div id="infowindow">' +
									'<span>' + flight.get('id') + '</span><span>' + this.from + '&rarr;' + this.to + '</span>' +
									'<div>' + flight.get('activations').length + ' activations</div>' + // This will change to flight.activations.length
									'<div>' + (flight.get('activations').length / pct) * 100 + '% conversion</div>' +
								'</div>';

				this.markerClicked = false;
				this.activations = [];

				// Event handlers for the marker
				google.maps.event.addListener(this.marker, 'mouseover', function() {
					// If the plane isn't in details mode, inspect it
					if(!self.markerClicked) {
						parent.inspectView(self, flight);
					}
				});
				google.maps.event.addListener(this.marker, 'mouseout', function() {
					// If this plane isn't in details mode, revert it to default
					if(!self.markerClicked) {
						parent.defaultView(self);
					}
				});
				google.maps.event.addListener(this.marker, 'click', function() {
					// If there is no active plane, activate this one. 
					if(!parent.activePlane) {
						parent.toggleDetailsView(self, flight)
					} else {
						if(!self.markerClicked) { // If there is an active plane, and it's NOT this one
							parent.toggleDetailsView(parent.activePlane); // Deactivate the old one
						}
						// activate the new one
						parent.toggleDetailsView(self, flight);
					}
				});
			},

			// Add a plane to the planes object.
			addPlane: function(flight) {
				if(typeof flight.get('flightStats').tracks[0] == 'undefined') {
					App.log(flight);
					return;
				}
				this.planes[flight.get('id')] = new this.plane(flight, this);
			},

			// Place a plane marker on the map
			createMarker: function(flight, icon) {
				var flightStats = flight.get('flightStats');
				if(typeof flightStats.tracks[0] == 'undefined') {
					App.log(flight);
					return;
				}
				var latlng = new google.maps.LatLng(
					flightStats.tracks[0].positions[0].lat,
					flightStats.tracks[0].positions[0].lon
				);


				var marker = new google.maps.Marker({
					position: latlng,
					icon: icon
				});
				marker.setMap(this.map);

				return marker;
			},
			createPath: function(flight) {
				var flightStats = flight.get('flightStats');
				var airportsLatLng = [];
				if(typeof flightStats.airports[0] == 'undefined') {
					App.log(flight);
					return;
				}
				if(typeof flightStats.airports[1] == 'undefined') {
					App.log(flight);
					return;
				}
				airportsLatLng.push(
					new google.maps.LatLng(
						flightStats.airports[0].latitude,
						flightStats.airports[0].longitude
					)
				);
				airportsLatLng.push(
					new google.maps.LatLng(
						flightStats.airports[1].latitude,
						flightStats.airports[1].longitude
					)
				);

				var path = new google.maps.Polyline({
					path: airportsLatLng,
					geodesic: true,
					strokeColor: '#666666',
					strokeWeight: 2,
					strokeOpacity: 0.5,
					visible: false
				});
				path.setMap(this.map);
				
				return path;
			},

			// Planes in normal mode, no actions
			defaultView: function(plane) {
				// Hide info window
				this.infowindow.content = '';
				this.infowindow.close(this.map, plane.marker);
				// Hide the flight path
				plane.path.setVisible(false);
				// Default icon
				plane.defaultIcon.fillColor = 'rgba(0,0,0,.6)';
				plane.marker.setIcon(plane.defaultIcon);
			},
			// When a plane is hovered
			inspectView: function(plane, flight) {
				// Setup and display info window
				var pct = flight.get('starts') < flight.get('activations').length ? flight.get('activations').length : flight.get('starts');
				this.infowindow.content = '<div id="infowindow">' +
											'<span>' + flight.get('id') + '</span><span>' + plane.from + '&rarr;' + plane.to + '</span>' +
											'<div>' + flight.get('activations').length + ' activations</div>' + // This will change to flight.activations.length
											'<div>' + ((flight.get('activations').length / pct) * 100).toFixed(1) + '% conversion</div>' +
										'</div>';
				this.infowindow.open(this.map, plane.marker);
				// Show the flight path
				plane.path.setVisible(true);
				// Change the icon to hover
				plane.defaultIcon.fillColor = 'rgba(0,0,0,1)';
				plane.marker.setIcon(plane.defaultIcon);
			},
			// When a plane is active
			toggleDetailsView: function(plane, flight) {
				if(!plane.markerClicked) {
					// Hide info window
					this.infowindow.content = '';
					this.infowindow.close(this.map, plane.marker);
					// Show the flight path
					plane.path.setVisible(true);
					// Change the icon to hover
					plane.defaultIcon.fillColor = 'rgba(6, 143, 207,.8)';
					plane.marker.setIcon(plane.defaultIcon);

					// Trigger for detail pane, set active.
					this.trigger('markerClickOn', flight);
					this.activePlane = plane;
					plane.markerClicked = true;
				} else {
					// Reset the view
					this.defaultView(plane, flight);
					// Deactivate the pane, unless we're swapping flights
					if(flight) {
						this.trigger('markerClickOff');
					}
					// and reset active to false
					this.activePlane = null;
					plane.markerClicked = false;
				}
			},


			// When a user activates on GoGo (STEP_5) we place a dot on the map
			addActivations: function(flight) {
				var flightStats = flight.get('flightStats');
				var latlng = new google.maps.LatLng(
					flightStats.tracks[0].positions[0].lat,
					flightStats.tracks[0].positions[0].lon
				);

				var circle = new google.maps.Circle( this.opts.wt.activationOpts );
				circle.setCenter = latlng;
				circle.setMap(this.map);

				this.planes[flight.id].activations.push(circle);
			},

			// Flight landed, remove the plane
			removePlane: function() {

			},

			// Flight landed, remove activation points
			removeActivation: function() {

			},
		});
	}
);
