/**
* Store contains map metadata information pulled from the metadata file
* included in the MapBox TileMill export of MBTiles (extracted).
**/

Ext.define('DevCycleMobile.store.MapInfo', {
	extend: 'Ext.data.Store',
	requires: 'Ext.data.proxy.LocalStorage',

	config: {
		model: 'DevCycleMobile.model.MapData',
		autoLoad: true,

		proxy: {
			type: 'ajax',
			url: 'resources/map_tiles/metadata.json'
		},
		listeners: {
			load: function(s, r){console.log(r)} // debug
		}
	}
});