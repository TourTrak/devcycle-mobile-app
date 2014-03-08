Ext.require(['Ext.Leaflet']);

/*
* Controller for the Leaflet Custom Component
*/

Ext.define('DevCycleMobile.controller.Map', {
	extend: 'Ext.app.Controller',

	config: {
		control: {
			// Reference to the Leaflet Custom Component
			'#mapview': {
				maprender: 'onMapRender',
			},
		}
	},

	/**
	Called when controller is initalize - setup all
	'private' variables
	**/
	init: function() {
		this.riderPosMarker = null; // user's position marker
	},

	/**
	* When map is initalize, search for users location and put it on the map
	**/
	onMapRender: function() {
		console.log("On map rendered!");

		var locSuccess = function(position) {
			console.log("success");

			var map = Ext.getCmp('mapview').map;
			var riderPos = new L.latLng(position.coords.latitude, position.coords.longitude);

			// First, make sure that rider is within bounds of the tour
			if (map.options.maxBounds.contains(riderPos)) {

				// Make sure that rider icon is not already set
				if(this.riderPosMarker === null || this.riderPosMarker === undefined){

					// Create rider icon
				 	var personIcon = L.AwesomeMarkers.icon({
						icon: 'user',
						color: 'dark red'
					});

					this.riderPosMarker = L.marker(riderPos, {icon: personIcon});
					this.riderPosMarker.addTo(map); // add rider marker to map

					// center map on rider's location
					map.panTo([position.coords.latitude, position.coords.longitude], {duration: 3});

				} else {
					var currPos = new L.LatLng(position.coords.latitude, position.coords.longitude);
					this.riderPosMarker.setLatLng(currPos);
					this.riderPosMarker.panTo(currPos);
				}

			} // End of if - rider not in tour area so do not add to map

			// refresh the map
			if (map != undefined){
				map._onResize();
			}
		}

		// can't get the lock on map
		var failBoat = function(e){
			console.warn('Error(' + e.code + '): ' + e.message);
		}

		navigator.geolocation.getCurrentPosition(locSuccess,
			failBoat, {timeout: 5000});
	}

});
