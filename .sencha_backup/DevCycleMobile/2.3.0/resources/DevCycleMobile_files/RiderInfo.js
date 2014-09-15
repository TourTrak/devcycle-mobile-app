Ext.define('DevCycleMobile.store.RiderInfo', {
	extend: 'Ext.data.Store',
	requires: 'Ext.data.proxy.LocalStorage',

	config: {
		model: 'DevCycleMobile.model.Rider',
		autoLoad: true,

		proxy: {
			type: 'localstorage',
			id: 'riderinfo-store'
		}
	}
});