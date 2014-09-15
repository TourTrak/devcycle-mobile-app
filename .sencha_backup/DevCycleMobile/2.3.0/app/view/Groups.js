Ext.define('DevCycleMobile.view.Groups', {
    extend: 'Ext.tab.Panel',
    xtype: 'groups',
    requires: [
        'Ext.TitleBar',
        'Ext.SegmentedButton',
        'Ext.ux.AccordionList',
        'Ext.plugin.ListPaging',
        'Ext.plugin.PullRefresh'
    ],
    config: {
        tabBarPosition: 'top',
        tabBar: {
            scrollable : 'horizontal'
        },
        items:[{
                xtype: 'titlebar',
                title: 'Affinity Groups',
                docked: 'top',
                style: {
                    backgroundImage: 'url(resources/images/carbon_fibre.png)'
                }
            },
			{
                xtype: 'fieldset',
                items: [{
                    xtype: 'textfield',
                    name: 'fname',
                    label: 'First name:'
                }
			}
		}
});


