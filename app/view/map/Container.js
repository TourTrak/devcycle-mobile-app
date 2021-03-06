Ext.Loader.setConfig({
    enabled:true,
    paths:{'Ext.ux.touch':'touch/src'}}
);

Ext.require(['Ext.Leaflet', 'Ext.Menu', 'Ext.dataview.List']);

/*
* Defines the custom map container component for holding
* everything necessary in the map tab view.
* @wlodarczyk
*/
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
                            width: 55,
                            height: 55,
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

				html: '<div id="mapLabel">Rider markers will refresh every 10 minutes</div>',
                xtype: 'leaflet',
                useCurrentLocation: true,
				handler: function(){
					//Empty Handler
				}
            }

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
			         id: 'food',
               xtype: 'button',
               text: '<img src="resources/icons/filters/disabled/food.png"/>',
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
		           id: 'mechanics',
               xtype: 'button',
               text: '<img src="resources/icons/filters/disabled/mechanics.png"/>',
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
		           id: 'truck',
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
		       id: 'car',
               xtype: 'button',
               text: '<img src="resources/icons/filters/disabled/car.png"/>',
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
           },
           {
           id: 'timed_ride',
               xtype: 'button',
               text: '<img src="resources/icons/filters/disabled/timed_ride.png"/>',
               cls: 'img_left',
               action: 'toggleMapFilter',
               width: 55,
               height: 55,
           }
        ];

        return Ext.create('Ext.Menu', {
            cls: 'filterMenu',
            layout: {
              type: 'vbox',
              align: 'center',
            },
            style: 'padding: 0',
            xtype: 'menu',
            itemTpl: '{title}',
            width: '80px',
            height: '100%',
            scrollable: 'vertical',
            items: items,
            });
    }
});
