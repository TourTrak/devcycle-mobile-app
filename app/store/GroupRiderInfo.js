Ext.define('DevCycleMobile.store.GroupRiderInfo', {
	extend: 'Ext.data.Store',
	requires: 'Ext.data.proxy.LocalStorage',

	config: {
		model: 'DevCycleMobile.model.GroupRider',
		autoLoad: true,

		proxy: {
			type: 'localstorage',
			id: 'riderinfo-store'
		}
	}
});