/*
* This model reprents the map metadata information included when exporting
* tiles from TileMill. 
*/

Ext.define('DevCycleMobile.model.MapData', {
	extend: 'Ext.data.Model',
	config: {
		fields: [
			'center',
			'maxzoom',
			'attribution',
			'bounds',
			'description',
			'name',
			'template',
			'version',
			'minzoom'
		],
	}
});
