
Ext.define('DevCycleMobile.view.map.LeafletMap', {

	extend: 'Ext.Container',
	xtype: 'leafletMap',
 	requires: ['Ext.util.Geolocation'],
	constructor: function() {
		this.callParent(arguments);
		this.element.setVisibilityMode(Ext.Element.OFFSETS);
		window.currPosMarker = null;
		this.on('painted', this.renderMap, this);
	
	},
	
	renderMap: function() {
		if(window.map){
			return true;
		}
		
		window.map = new L.Map(this.element.dom, {
			zoomControl: true,
			trackResize: false
		});
		
		var cloudmade = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
            maxZoom: 18
        });
	
		window.map.addLayer(cloudmade); //.setView(new L.LatLng(37.381592, -122.135672), 10);
		window.map.locate({setView: true, maxZoom: 16});
		
		window.map.on('locationfound', this.onLocationFound);

		if(!Ext.browser.is.PhoneGap){
			window.map.on('locationfound',this.onLocationFound);
		} else{ 
			this.fireEvent('update',this);
		}

		
	/*	if(Ext.browser.is.PhoneGap) {
			navigator.geolocation.getCurrentPosition(this.onSuccess, this.onError);
		} else { */
			//html5
		//	window.map.on('locationfound', this.onLocationFound);
	//	}
	},

	onUpdate: function (map, e, options) {
	        this.setHtml((options || {}).data);
 	},


    onDestroy: function () {
        this.callParent();
    }
	

});
	
