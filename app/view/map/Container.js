/**
* Defines the custom map container component for holding
* everything necessary in the map tab view. 
**/
Ext.define('DevCycleMobile.view.map.Container', {
	extend: 'Ext.Container',
	xtype: 'mapContainer',


	config: {
		title: 'Map',
		iconCls: 'maps',
		layout: 'fit',

		items: [
			{
				xtype: 'toolbar',
				docked: 'top',
				id: 'mapTitleBar',
				title: 'Mile 12 of 40',
				cls: 'my-toolbar'
			},
			{
                xtype: 'leafletMap'
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
                    Ext.get('btnPause').setVisible(true);
                    Ext.get('btnResume').setVisible(false);
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
                    Ext.get('btnResume').setVisible(true);
                    Ext.get('btnPause').setVisible(false);
                }
            }
            
		], // End items
	}, // End config
});
