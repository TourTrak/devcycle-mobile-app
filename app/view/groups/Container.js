Ext.define('DevCycleMobile.view.groups.Container', {
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
			title: 'Groups',
			iconCls: 'team',
			action: 'faqTab',
			handler: function(){
			Ext.Viewport.hideMenu('left');
			}
		},

		items: [
            {
                xtype: 'groups',
            }
        ]
	}
});
