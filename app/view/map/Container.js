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
			}
		], // End items
	}, // End config
});
