/**
* Store contains the tour info
**/

Ext.define('DevCycleMobile.store.TourInfo', {
	extend: 'Ext.data.Store',
	requires: 'Ext.data.proxy.LocalStorage',

	config: {
		model: 'DevCycleMobile.model.Tour',
		autoLoad: true,
		async: false,

		proxy: {
			type: 'ajax',
			url: 'config.json',
			async: false
		},
		
		listeners: {
			load: function(s, r){
				console.log(r);
			} // debug
		}
	}
});
