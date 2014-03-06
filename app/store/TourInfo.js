/**
* Store contains the tour info
**/

Ext.define('DevCycleMobile.store.TourInfo', {
	extend: 'Ext.data.Store',
	requires: 'Ext.data.proxy.LocalStorage',

	config: {
		model: 'DevCycleMobile.model.Tour',
		autoLoad: true,

		proxy: {
			type: 'ajax',
			url: 'config.json',
		},
		
		listeners: {
			load: function(s, r){
				console.log(r);
			} // debug
		}
	}
});
