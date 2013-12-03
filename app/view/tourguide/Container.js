Ext.define('DevCycleMobile.view.tourguide.Container', {
	extend: 'Ext.Container',
	xtype: 'tourContainer',

	config: {
		tab: {
				title: 'Tour Guide',
				iconCls: 'user',
		},

		items: [
			{
				xtype: 'toolbar',
				docked: 'top',
				id: 'toolTitleBar',
				title: 'Tour Guide',
				cls: 'my-toolbar'
			},
		],

		html: "Tour Guide TBD"
	}
});
