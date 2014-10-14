Ext.define('DevCycleMobile.model.Group', {
	extend: 'Ext.data.Model',
	config: {
		fields: [
			'groupName',
			'groupCode'
		],
	},
	requires: ['DevCycleMobile.model.GroupRider'],
	hasMany: {name:'getRiders', model: 'DevCycleMobile.model.GroupRider'}
});