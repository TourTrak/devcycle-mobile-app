Ext.Loader.setConfig({
    enabled:true,
    paths:{'Ext.ux.touch':'touch/src'}}
);

Ext.require(['Ext.Leaflet']);

/**
* Defines the custom map container component for holding
* everything necessary in the map tab view.
**/
Ext.define('DevCycleMobile.view.map.Container', {
	extend: 'Ext.Container',
	xtype: 'mapContainer',
    id: 'mapContainer',


	config: {
		title: 'Map',
		iconCls: 'maps',
		layout: 'fit',

		items: [
			{
				xtype: 'toolbar',
				docked: 'top',
				id: 'mapTitleBar',
				title: 'Tour Trak',
				cls: 'my-toolbar'
			},
			{
                xtype: 'leaflet',
                useCurrentLocation: true,
			},
            {
                xtype: 'button',
                docked: 'bottom',
                hidden: 'true',
                ui: 'confirm',
                height: '60',
                text: 'Resume Tracking',
                id: 'btnResume',
                handler: function() {
                    // call resumeTracking on the cordova abstraction layer
                    cordova.exec(
                        function() {
                            // do nothing on success
                        },
                        function(message) {
                            alert( "Error: " + message );
                        },
                        'CDVInterface',
                        'resumeTracking',
                        []
                    );
                    // show pause button
                    Ext.get('btnPause').show();
                    // hide this button
                    Ext.get('btnResume').hide();
                }
            },
            {
                xtype: 'button',
                docked: 'bottom',
                ui: 'decline',
                height: '60',
                text: 'Pause Tracking',
                id: 'btnPause',
                handler: function() {
                    // call pauseTracking on the cordova abstraction layer
                    cordova.exec(
                        function() {
                            // do nothing on success
                        },
                        function(message) {
                            alert( "Error: " + message );
                        },
                        'CDVInterface',
                        'pauseTracking',
                        []
                    );
                    // show resume button
                    Ext.get('btnResume').show();
                    //hide this button
                    Ext.get('btnPause').hide();
                }
            }

		], // End items
	}, // End config
});
