Ext.define('DevCycleMobile.view.guide.Container', {
	extend: 'Ext.Container',
	xtype: 'faqContainer',
    requires: [
        'Ext.TitleBar',
        'Ext.SegmentedButton',
        'Ext.ux.AccordionList',
        'Ext.plugin.ListPaging',
        'Ext.plugin.PullRefresh'
    ],
	config: {
        
        layout: 'fit',
		tab: {
			title: 'Guide',
			iconCls: 'info',
			action: 'faqTab',
		},

		items: [
            {
                xtype: 'main',
            }
        ]
	}
});
