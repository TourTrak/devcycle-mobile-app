Ext.require(['Ext.Leaflet']);

/*
* Controller for the Leaflet Custom Component.
* Every time the map is rendered, we check if the user is within the tour area.
* If the user is, his or her location is pulsed on the map.
*
* If geolocation fails, it retries until successful.
*
* @tofferrosen, @wlodarczyk, @eklundjoshua
*/

var filter = [];

Ext.define('DevCycleMobile.controller.Map', {
	extend: 'Ext.app.Controller',

	config: {
		control: {
			// Reference to the Leaflet Custom Component
			'#mapview': {
				maprender: 'onMapRender',
			},
			// Action listener for handling filters
			'button[action=toggleMapFilter]': {
				tap: 'toggleFilter',
			},
		}
	},

	/**
	Controls the toggling of filter icon markers on leaflet map, uses a setimte to mimic
	an asynchronous call so that the UI doesnt freeze when loading markers
	**/ 

	toggleFilter: function(filterType) {	
		setTimeout(function() 
		{
			if (filter.indexOf(filterType.id) == -1) {
				filter.push(filterType.id);
				filterType.setText('<img src="resources/icons/filters/enabled/'+filterType.id+'.png"/>');
				DevCycleMobile.app.getController('FilterMarkers').filterMap(filter);
			}
			else {
				filter.splice(filter.indexOf(filterType.id), 1);
				filterType.setText('<img src="resources/icons/filters/disabled/'+filterType.id+'.png"/>');
				DevCycleMobile.app.getController('FilterMarkers').filterMap(filter);
			}	
		},50);			
	},

	/**
	Called when controller is initalize - setup all variables
	**/
	init: function() {
		this.riderPosMarker = null; // user's position marker
	},

	/**
	* This function will be called whenever the filter for a group is selected 
	* All users in that group will be plotted on the map through this function.
	*/
	mapGroups: function () {
		var map = Ext.getCmp('mapview').map;
		//Ensure the map has been loaded
		if (map != undefined) {

			this.groupStore = Ext.getStore("GroupInfo");
			this.groupRiderStore = Ext.getStore("GroupRiderInfo");
			var riderPos = new L.latLng(40.7127837, -74.00594130000002);
			var riderMarker;

			var riderRecords = this.groupRiderStore;
			var groupRecords = this.groupStore;

			var groupRiderArray = new Array(5);

			//groupCode
		    //riderId

			//var firstRun = false; //used for testing
			//var newGroup = L.layerGroup(); //First group
			//var newGroup2 = L.layerGroup(); //Second group
			var count = 0; //Counter for number of groups
		    //Create an overlay
			var groupsOverlay ={};
			//Iterate over every group in the store
			groupRecords.each(function (groupRecord) {
				console.log("Parsing map group " + groupRecord.get('groupName'));

			    //Filter the riderRecords by the current group code
			    //var thisGroup = new Array(5);
				var newGroup = L.layerGroup(); //Create a layer group
				var groupName = groupRecord.get('groupName'); //Get the group code
				riderRecords.filter('groupCode', groupRecord.get('groupCode'));
				riderRecords.each(function (riderRecord) {
					/*'groupCode',
					  'riderId',
					  'latitude',
		 	          'longitude'
		 	        */
		 	        console.log("Rider " + riderRecord.get('riderId'));
		 	        riderPos = new L.latLng(riderRecord.get('latitude'), riderRecord.get('longitude'));
                    //Create a marker- hardcoded currently
		 	        /*if (firstRun) {
		 	            riderMarker = L.userMarker(riderPos, {
		 	                accuracy: 10,
		 	                pulsing: true,
		 	                smallIcon: true
		 	            });
		 	        }
		 	        else {
		 	            riderMarker = L.userMarker(riderPos, {
		 	                accuracy: 10,
		 	                pulsing: false,
		 	                smallIcon: true
		 	            });
		 	            
                        
		 	        }*/
                    //Create the marker
		 	        riderMarker = L.userMarker(riderPos, {
		 	            accuracy: 10,
		 	            pulsing: true,
		 	            smallIcon: true
		 	        });
		 	        newGroup.addLayer(riderMarker);//Add markers to a group		 	        
                    /*
		 	        if (firstRun) {
		 	            newGroup2.addLayer(riderMarker);
		 	        }
		 	        else {
		 	            newGroup.addLayer(riderMarker);

		 	        };
                    */
				    //riderMarker.addTo(map);
					

				});
                
                
				riderRecords.clearFilter(true);
			    //firstRun = true;
				groupsOverlay[groupName] = newGroup; //Add to overlay
				count++;
			});
		    //Create an overlay
            /*
			var groupsOverlay =
            {
                "Tour": newGroup,
                "RMD": newGroup2
            };*/
			L.control.layers(groupsOverlay).addTo(map); //Add overlay to map
			map._onResize();
			// Create rider marker
			/*this.riderPosMarker = L.userMarker(riderPos, {
				accuracy: 10,
				pulsing: true
			});*/
			//this.riderPosMarker.addTo(map);

		}
	},


	/**
	* Called when a user's location/position is successfully found.
	* Adds or updates the user's location on the map.
	**/
	locationSuccess: function(position) {

		var map = Ext.getCmp('mapview').map;
		var riderPos = new L.latLng(position.coords.latitude, position.coords.longitude);

		// First, make sure that rider is within bounds of the tour
		if (map.options.maxBounds.contains(riderPos)) {

			// Make sure that rider icon is not already set
			if(this.riderPosMarker === null || this.riderPosMarker === undefined){

				// Create rider marker
				this.riderPosMarker = L.userMarker(riderPos, {
					accuracy: position.coords.accuracy,
					pulsing: true
				});

				this.riderPosMarker.addTo(map); // add to map

				// center map on rider's location
				map.panTo([position.coords.latitude, position.coords.longitude], {duration: 3});

			} else {
				var currPos = new L.LatLng(position.coords.latitude, position.coords.longitude);
				this.riderPosMarker.setLatLng(currPos);
				this.riderPosMarker.setAccuracy(position.coords.accuracy);
				this.riderPosMarker.panTo(currPos);
			}

			// refresh the map
			if (map != undefined){
				map._onResize();
			}

		} // End of if - rider not in tour area so do not add to map
	},

	/**
	* Called when a user's location was not found.
	* Retries to get the user's location after 10 seconds.
	**/
	locationFailure: function(e) {

		var controller = DevCycleMobile.app.getController('DevCycleMobile.controller.Map');

		console.warn('Error(' + e.code + '): ' + e.message);
		console.warn("Trying to find user's position again.");

		// try to get the user's location again in 10 seconds
		setTimeout(function() {
			navigator.geolocation.getCurrentPosition(controller.locationSuccess,
			controller.locationFailure, {timeout: 120});
		}, 10000);
	},

	/**
	* When map is initalize, search for users location and put it on the map
	**/
	onMapRender: function() {
		console.log("On map rendered!");
	
		var map = Ext.getCmp('mapview').map;

			// refresh the map
			if (map != undefined){
				map._onResize();
			}

		// try to get the user's location
		navigator.geolocation.getCurrentPosition(this.locationSuccess,
			this.locationFailure, {timeout: 120});
	}

});
