Ext.define('DevCycleMobile.model.Group', {
	extend: 'Ext.data.Model',
	config: {
		idProperty: 'groupCode',
		fields: [
			'groupCode',
			'groupName',
			'groupColor'
		],
	},
});