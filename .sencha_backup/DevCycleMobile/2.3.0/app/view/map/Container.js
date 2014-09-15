Ext.Loader.setConfig({
    enabled:true,
    paths:{'Ext.ux.touch':'touch/src'}}
);

Ext.require(['Ext.Leaflet', 'Ext.Menu', 'Ext.dataview.List']);

/**
* Defines the custom map container component for holding
* everything necessary in the map tab view.
**/
Ext.define('DevCycleMobile.view.map.Container', {
    extend: 'Ext.Container',
    xtype: 'mapContainer',
    id: 'mapContainer',
    config: {
        title: 'Map',
        iconCls: 'maps',
        layout: 'fit',
        items: [
            {
                xtype: 'titlebar',
                docked: 'top',
                id: 'mapTitleBar',
                title: 'TourTrak TD Five Boro Bike Tour',
                cls: 'my-toolbar',
                style: {
                    backgroundImage: 'url(resources/images/carbon_fibre.png)'
                },
                //Add button for slide out panel
                //Sliding Menu tutorial: http://www.joshmorony.com/how-to-add-a-facebook-style-sliding-menu-in-sencha-touch
                items:
                    [
                        {
                            xtype: 'button',
                            iconCls: 'list',
                            handler: function () {
                                if (Ext.Viewport.getMenus().left.isHidden())
                                {
                                    Ext.Viewport.showMenu('left');
                                }
                                else
                                {
                                    Ext.Viewport.hideMenu('left');
                                }
                            }
                            
                        }
                    ],
            },
            {
                xtype: 'leaflet',
                useCurrentLocation: true,
				handler: function(){
					//Empty Handler
				}	
            },

        ], // End items
        listeners:
        {          
            initialize: function () {
                Ext.Viewport.setMenu(this.createMenu('left'),
                    {
                        side: 'left',
                        reveal: true,
                    });
            }
        }
    }, // End config
    //Create slide-out menu
    createMenu: function (side) {
        var items = [               
           {
			   id: 'bathrooms',
               xtype: 'button',
               text: '<img src="resources/icons/filters/disabled/bathrooms.png"/>',
               cls: 'img_left',
			   action: 'toggleMapFilter',
               width: 55,
               height: 55,		   
           },
           {
			   id: 'food2',
               xtype: 'button',
               text: '<img src="resources/icons/filters/disabled/food2.png"/>',
			   cls: 'img_left',
               action: 'toggleMapFilter',
               width: 55,
               height: 55,
           },

           {
		       id: 'lost_child',
               xtype: 'button',
               text: '<img src="resources/icons/filters/disabled/lost_child.png"/>',
               cls: 'img_left',
               action: 'toggleMapFilter',
               width: 55,
               height: 55,
           },

           {
		       id: 'mechanic2',
               xtype: 'button',
               text: '<img src="resources/icons/filters/disabled/mechanic2.png"/>',
			   cls: 'img_left',
               action: 'toggleMapFilter',
               width: 55,
               height: 55,
           },

          {
		       id: 'info-tent',
               xtype: 'button',
               text: '<img src="resources/icons/filters/disabled/info-tent.png"/>',
			   cls: 'img_left',
               action: 'toggleMapFilter',
               width: 55,
               height: 55,
           },
		   
			{
		       id: 'picture',
               xtype: 'button',
               text: '<img src="resources/icons/filters/disabled/picture.png"/>',
			   cls: 'img_left',
               action: 'toggleMapFilter',
               width: 55,
               height: 55,
           },
		   
		   {
		       id: 'ferry',
               xtype: 'button',
               text: '<img src="resources/icons/filters/disabled/ferry.png"/>',
			   cls: 'img_left',
               action: 'toggleMapFilter',
               width: 55,
               height: 55,
           },

           {
		       id: 'medical',
               xtype: 'button',
               text: '<img src="resources/icons/filters/disabled/medical.png"/>',
			   cls: 'img_left',
               action: 'toggleMapFilter',
               width: 55,
               height: 55,
           },

          {
		       id: 'sagtruck',
               xtype: 'button',
               text: '<img src="resources/icons/filters/disabled/sagtruck.png"/>',
			   cls: 'img_left',
               action: 'toggleMapFilter',
               width: 55,
               height: 55,
           },

            {
			   id: 'music',
               xtype: 'button',
               text: '<img src="resources/icons/filters/disabled/music.png"/>',
			   cls: 'img_left',
               action: 'toggleMapFilter',
               width: 55,
               height: 55,
           },

           {
		       id: 'rest_area',
               xtype: 'button',
               text: '<img src="resources/icons/filters/disabled/rest_area.png"/>',
			   cls: 'img_left',
               action: 'toggleMapFilter',
               width: 55,
               height: 55,
           },

            {
			   id: 'water',
               xtype: 'button',
               text: '<img src="resources/icons/filters/disabled/water.png"/>',
			   cls: 'img_left',
               action: 'toggleMapFilter',
               width: 55,
               height: 55,
           },

           {
		       id: 'subway',
               xtype: 'button',
               text: '<img src="resources/icons/filters/disabled/subway.png"/>',
			   cls: 'img_left',
               action: 'toggleMapFilter',
               width: 55,
               height: 55,
           }  
        ];

        return Ext.create('Ext.Menu', {
            style: 'padding: 0',
            xtype: 'menu',
            itemTpl: '{title}',
            width: '71px',
            height: '100%',
            scrollable: true,
            items: items,
            });
    }
});