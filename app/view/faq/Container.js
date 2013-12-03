Ext.define('DevCycleMobile.view.faq.Container', {
	extend: 'Ext.Container',
	xtype: 'faqContainer',

	config: {
		tab: {
			title: 'Faq',
			iconCls: 'info',
			action: 'faqTab'
		},

		items: [
			{
				xtype: 'toolbar',
				docked: 'top',
				id: 'faqTitleBar',
				title: 'FAQ',
				cls: 'my-toolbar'
			},
		],

		html: "FAQ TBD" 
	}
});
