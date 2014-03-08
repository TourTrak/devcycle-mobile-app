/**
* Custom tab bar component for displaying the
* the tabs dynamically through the Home contoller
**/

Ext.define('DevCycleMobile.view.Home', {
	extend: 'Ext.tab.Panel',
	xtype: 'home',
	id: 'home',

	config: {
		id: 'home',
		tabBarPosition: 'bottom',
	},

	// Fires when the Panel is initialized
	initialize: function () {

			// Add a Listener. Listen for [Viewport ~ Orientation] Change.
			Ext.Viewport.on('orientationchange', 'handleOrientationChange', this, {buffer: 50 });
			this.callParent(arguments);
	},

	// forceably refresh the leaflet map when orientation is changed
	handleOrientationChange: function() {
		var map = Ext.getCmp('mapview').map;
		if (map != undefined){
			map._onResize();
		}
	}

});
