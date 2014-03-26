Ext.define('DevCycleMobile.view.about.Container', {
	extend: 'Ext.Container',
	xtype: 'aboutContainer',
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
			title: 'About',
			iconCls: 'settings',
			action: 'faqTab',
		},

		items: [
            {
                xtype: 'aboutMain',
            }
        ]
	}
});
