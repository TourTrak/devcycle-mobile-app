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
	style: {
					backgroundImage: 'url(resources/images/carbon_fibre.png)'
				},
        
        layout: 'fit',
		tab: {
			title: 'Guide',
			iconCls: 'info',
			action: 'faqTab',
			handler: function(){
			Ext.Viewport.hideMenu('left');
			}
		},

		items: [
            {
                xtype: 'main',
				style: {
					backgroundImage: 'url(resources/images/carbon_fibre.png)'
				}
            }
        ]
	}
});
