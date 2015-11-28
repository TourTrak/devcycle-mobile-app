Ext.define('DevCycleMobile.store.MyGroups', {
	extend: 'Ext.data.Store',
	requires: 'Ext.data.proxy.LocalStorage',

	config: {
		model: 'DevCycleMobile.model.MyGroup',
		autoLoad: true,

		proxy: {
			type: 'localstorage',
			id: 'riderinfo-store'
		}
	}
});