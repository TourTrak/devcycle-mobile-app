
Ext.define('DevCycleMobile.view.map.LeafletMap', {

	extend: 'Ext.Container',
	xtype: 'leafletMap',
 	requires: ['Ext.util.Geolocation'],

	constructor: function() {
		this.callParent(arguments);
		this.element.setVisibilityMode(Ext.Element.OFFSETS);
		window.currPosMarker = null;
		this.on('painted', this.setup, this);
	},

	setup: function(){
	
		alert("Launch");

		locationSuccess = function(position){
			alert("Success");

			if (window.map){
				return true;
			}

			window.map = new L.Map(this.element.dom, {
				zoomControl: true,
			});

			var customTiles = new L.TileLayer('resources/map_tiles/{z}/{x}/{y}.png', {
	        	attribution: 'Map data: OpenStreetMap',
	        	maxZoom: 17,
	        	errorTileUrl: 'resources/images/error_tile.png'
        	});

			window.map.addLayer(customTiles);
			window.map.setView(new L.LatLng(position.coords.latitude, position.coords.longitude),17);

			window.map.locate({setView: true, maxZoom: 16});

			window.map.on('locationfound', this.onLocationFound);
			this.fireEvent('update', this);
		};

		locationFail = function(error){
			alert(error.message);
		};

		navigator.geolocation.getCurrentPosition(locationSuccess, locationFail);

	},

	onUpdate: function (map, e, options) {
	        this.setHtml((options || {}).data);
 	},


    onDestroy: function () {
        this.callParent();
    }
	

});
	
