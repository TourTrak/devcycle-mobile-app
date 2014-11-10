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
var firstRun = 0;

Ext.define('DevCycleMobile.Map.LayerControl', {
	singleton: true,
	lc: null,
	groupsOverlay: [],
	layerRef: []
});

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

	requires:['DevCycleMobile.Map.LayerControl'],

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
		//var groupsOverlay = {};
		//var layerControl = null;
		//this.layerControl.addTo(Ext.getCmp('mapview').map);

	},

	/**
	* Function addGroup
	* This function will be called whenever the filter for a group is selected 
	* All users in that group will be plotted on the map through this function.
	*/
	addGroup: function (groupCode, groupName) {
		var map = Ext.getCmp('mapview').map;
		//Ensure the map has been loaded
		if (map != undefined) 
		{
			/**
			* Import the Rider Store - Holds this device's rider id
			* Fields:
			*	riderId
			*
			* Import the Group Store - Holds all groups that this device's rider is a part of
			* Fields: 
			* 	groupName
			*	groupCode
			*
			* Import the GroupRider Store - Holds all the riders, locations, groups
			*	groupCode
			*	riderId
			*	latitude
			*	longitude
			**/
			//var riderStore = Ext.getStore("RiderInfo");
			var groupRiderStore = Ext.getStore("GroupRiderInfo");
			var groupStore = Ext.getStore("GroupInfo");
			var riderPos;
			var riderMarker;
			var newGroup = L.layerGroup(); //Create a layer group

			
			console.log("Add Group" + groupCode + " " + groupName);
			console.log("Group Store Count " + groupStore.getCount());
			console.log("Group Rider Store Count " + groupRiderStore.getCount());
	
			groupStore.filter('groupCode', groupCode);
			var groupRecord = groupStore.getAt(0);


			groupRiderStore.filter('groupCode', groupCode);
			console.log("Group Store Count After " + groupStore.getCount());
			console.log("Group Rider Store Count After " + groupRiderStore.getCount());
			groupRiderStore.each(function (riderRecord) 
			{
				console.log("" + riderRecord.get('latitude') + "" +  riderRecord.get('longitude') + "" + groupRecord.get('groupColor') + "" +  groupRecord.get('groupCode'))
	 			riderPos = new L.latLng(riderRecord.get('latitude'), riderRecord.get('longitude'));
	 	    	riderMarker = L.userMarker(riderPos, {
	 	       		color: groupRecord.get('groupColor'),
	 	        	accuracy: 10,
	 	        	pulsing: true,
	 	        	smallIcon: true
	 	    	});
	 	    	riderMarker.bindPopup("<h1>Rider " + riderRecord.get('riderId') + "</h1> <h2><b>Group: </b> " + groupRecord.get('groupCode') + "</h2>", {offset: new L.Point(0,-20)});
	 	    	newGroup.addLayer(riderMarker);	 	                      		
			}); 

			newGroup.eachLayer(function (layer){
				console.log(newGroup);
			});

			DevCycleMobile.Map.LayerControl.groupsOverlay.push(newGroup); //Add to overlay   
			DevCycleMobile.Map.LayerControl.layerRef.push(groupCode);  
			groupRiderStore.clearFilter(true);
			groupStore.clearFilter(true);

			if(!DevCycleMobile.Map.LayerControl.lc)
			{
				DevCycleMobile.Map.LayerControl.lc = new L.control.layers(null, null);
				DevCycleMobile.Map.LayerControl.lc.addOverlay(newGroup, groupName);
				DevCycleMobile.Map.LayerControl.lc.addTo(map); 
			}
			else
			{
				DevCycleMobile.Map.LayerControl.lc.addOverlay(newGroup, groupName);
				DevCycleMobile.Map.LayerControl.lc._update();
			}

			map._onResize();
		}
	},

	/**
	* Function: removeGroup
	* Description: remove group takes the group code as a parameter
	* and removes the current group from the map and the layer control
	**/
	removeGroup: function (code) {
		var map = Ext.getCmp('mapview').map;
		//Ensure the map has been loaded
		if (map != undefined) {
			
			var groupArray = DevCycleMobile.Map.LayerControl.groupsOverlay;
			var refArray = DevCycleMobile.Map.LayerControl.layerRef;
			var index = 0;

			for(var i = 0; i < refArray.length; i++)
			{
				if(refArray == code)
				{
					index = i;
					break;
				}
			}

			var removeThis = groupArray[index];
			DevCycleMobile.Map.LayerControl.groupsOverlay.splice(index, 1);
			DevCycleMobile.Map.LayerControl.layerRef.splice(index, 1);

			DevCycleMobile.Map.LayerControl.lc.removeLayer(removeThis);
			DevCycleMobile.Map.LayerControl.lc._update();
			map.removeLayer(removeThis);
			map._onResize();
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
