Ext.define('DevCycleMobile.model.GroupRider', {
	extend: 'Ext.data.Model',
	config: {
		fields: [
			'groupName',
			'riderId'
		],
	},
	belongsTo: [{
		name: 'group',
		model: 'DevCycleMobile.model.Group',
	}]
});