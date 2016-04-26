Ext.define('DevCycleMobile.store.GroupInfo', {
	extend: 'Ext.data.Store',
	requires: 'Ext.data.proxy.LocalStorage',

	config: {
		model: 'DevCycleMobile.model.Group',
		autoLoad: true,

		proxy: {
			type: 'localstorage',
			id: 'riderinfo-store'
		}
	}
});