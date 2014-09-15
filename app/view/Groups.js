Ext.define('DevCycleMobile.view.Groups', {
    extend: 'Ext.form.Panel',
    xtype: 'groups',
    requires: [
        'Ext.TitleBar',
        'Ext.plugin.ListPaging',
        'Ext.plugin.PullRefresh'
    ],
    config: {
        items:[{
                xtype: 'titlebar',
                title: 'TourTrak TD Five Boro Bike Tour',
                docked: 'top',
                style: {
                    backgroundImage: 'url(resources/images/carbon_fibre.png)'
                }
            },
			{
				title: 'Create Affinity Group',
                xtype: 'fieldset',
                items:[{
                    xtype: 'textfield',
                    name: 'groupname',
                    label: 'Group name:'
                },
				{
					xtype: 'textfield',
					readOnly: true,
                    name: 'groupcode',
                    label: 'Group code:'
				}]
			},
			{
                xtype: 'button',
                itemId: 'generate',
                width: '100%',
                text: 'Generate Code'
            },
			{
				title: 'Join Affinity Group',
                xtype: 'fieldset',
                items:{
                    xtype: 'textfield',
                    name: 'joingroup',
                    label: 'Join group:'
                }
			},
			{
                xtype: 'button',
                itemId: 'generate',
                width: '100%',
                text: 'Join Group'
            }]
		},
	}
);


