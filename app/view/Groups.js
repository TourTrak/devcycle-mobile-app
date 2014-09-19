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
        items: [
            {
                xtype: 'titlebar',
                title: 'TourTrak TD Five Boro Bike Tour',
                docked: 'top',
                style: {
                    backgroundImage: 'url(resources/images/carbon_fibre.png)'
                }
            },
            {
                title: 'Join Group',
                layout: 'vbox',
                items: [
					{height: '25px'},
                    {html: 'Enter your group code (i.e. BIKE1234)'},
					{xtype: 'textfield', name: 'group_code', label: 'Code'},
					{xtype: 'button', itemId: 'join', text: 'Join'}
                ]
            },
			{
                title: 'Create Group',
                layout: 'vbox',
                items: [
					{height: '25px'},
                    {html: 'Enter the name of your riding group'},
					{xtype: 'textfield', name: 'group_name', label: 'Name'},
					{xtype: 'button', itemId: 'create', text: 'Create'}
                ]
            },
			{
                title: 'My Groups',
                layout: 'vbox',
                items: [
					{height: '25px'},
                    {html: 'Enter the name of your riding group'},
					{xtype: 'textfield', name: 'group_name', label: 'Name'},
					{xtype: 'button', itemId: 'create', text: 'Create'}
                ]
            }
        ]
    }
});

