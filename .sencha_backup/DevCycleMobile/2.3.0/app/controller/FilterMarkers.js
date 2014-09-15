Ext.require(['Ext.Leaflet']);
/*
* Controller for filtering map points
*
* @Joshua Eklund
*/
var firstRun = true;

Ext.define('DevCycleMobile.controller.FilterMarkers', {
	extend: 'Ext.app.Controller',

	/*config: {
		control: {
			// Reference to the Leaflet Custom Component
			'#mapview': {
				maprender: 'filterMap',
			},
		}
	},*/

	/**
	Called when the controller is initalized
	**/
	init: function() {
		console.log("The FilterMarker controller was initiated");
		originalCluster = new L.MarkerClusterGroup({maxClusterRadius:40});

	},
	
	filterMap: function(filter) {
		var map = Ext.getCmp('mapview').map;
		//var filter = ['subway', 'music', 'mechanic2'];

		if(firstRun) {
			//Save the original marker cluster
			console.log("Copying the markerCluster to originalCluster variable");
			markerCluster.eachLayer(function (layer){
				originalCluster.addLayer(layer);
			});
    		firstRun = false;
		}
		
		//Re-add all the original markers back to the markerCluster
		console.log("Resetting marker cluster to contain all original markers");
    	originalCluster.eachLayer(function (layer){
    		if(!markerCluster.hasLayer(layer)) {
    		markerCluster.addLayer(layer);
    		}
    	});

		//Remove all markers that do not match the filter criteria
		console.log("Filtering the markers based on toggled criteria");
		markerCluster.eachLayer(function (layer) {
	       	for(var i = 0; i<filter.length; i++) {
	           	if((filter.indexOf(layer.options.markerType)) == -1) {
	           		//console.log("Removing layer: " + layer.options.markerType);
	           		markerCluster.removeLayer(layer); 
	           	}
	       	}
	    }); 
			
    	// Re-render the map after filtering
		if (map != undefined){
			map._onResize();
		}
	} //End of filter function


}); //End of FilterMarker.js Controller
	
	