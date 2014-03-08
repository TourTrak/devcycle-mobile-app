/*
    This file is generated and updated by Sencha Cmd. You can edit this file as
    needed for your application, but these edits will have to be merged by
    Sencha Cmd when it performs code generation tasks such as generating new
    models, controllers or views and when running "sencha app upgrade".

    Ideally changes to this file would be limited and most work would be done
    in other places (such as Controllers). If Sencha Cmd cannot merge your
    changes and its generated code, it will produce a "merge conflict" that you
    will need to resolve manually.
*/
Ext.Loader.setPath({
    'Ext': 'touch/src',
    'Ext.ux': 'touch/src/ux',
    'DevCycleMobile': 'app'
});

Ext.application({
    name: 'DevCycleMobile',

    requires: [
        'Ext.MessageBox',
        'DevCycleMobile.store.BeforeTheTour',
        'DevCycleMobile.store.GettingReady'
    ],

    views: [
        'Home',
        'Main',
        'map.Container',
        'guide.Container',
        'guide.ListItem'
    ],

    controllers: [
        'Map',
        'Home',
        'Answer'
    ],

    models: [
        'Rider',
        'MapData',
        'Tour',
        'Answer'
    ],

    stores: [
        'RiderInfo',
        'MapInfo',
        'TourInfo'
    ],

    icon: {
        '57': 'resources/icons/Icon.png',
        '72': 'resources/icons/Icon~ipad.png',
        '114': 'resources/icons/Icon@2x.png',
        '144': 'resources/icons/Icon~ipad@2x.png'
    },

    isIconPrecomposed: true,

    startupImage: {
        '320x460': 'resources/startup/320x460.jpg',
        '640x920': 'resources/startup/640x920.png',
        '768x1004': 'resources/startup/768x1004.png',
        '748x1024': 'resources/startup/748x1024.png',
        '1536x2008': 'resources/startup/1536x2008.png',
        '1496x2048': 'resources/startup/1496x2048.png'
    },

    /**
    * areStoresLoaded()
    * Returns true if all stores in given array are loaded,
    * otherwise immediately returns false.
    *
    * @param stores - an array of Sencha stores (see store.js in SDK or documentation
    **/
    areStoresLoaded: function(stores) {
        var loaded = false;

        for (var i=0; i < stores.length; i++) {
            var store = stores[i];
            if (store.isLoaded() == false){
                return false;
            }
        }

        // All stores have been successfully loaded
        return true;
    },

    launch: function() {

        // Destroy the #appLoadingIndicator element
        Ext.fly('appLoadingIndicator').destroy();

        var mapInfo = Ext.getStore("MapInfo"); // map metadata info
        var tourInfo = Ext.getStore("TourInfo"); //tour info
        var riderInfo = Ext.getStore("RiderInfo"); // rider info

        var self = this; // reference to self

        // load all the stores before proceeding
        var handler = setInterval(function(){
           loaded = self.areStoresLoaded([tourInfo, mapInfo, riderInfo]);

           if (loaded){
                // cancel interval
                clearInterval(handler);
                handler = 0;

                // init the main view and add it to view
                var homeView = Ext.create('DevCycleMobile.view.Home');
                Ext.Viewport.add(homeView);
           }
        }, 100);

        // Adjust toolbar height when running in iOS to fit with new iOS 7 style
        // Initialize the main view
        var homeView = Ext.create('DevCycleMobile.view.Home');
        Ext.Viewport.add(homeView);
        
         // Adjust toolbar height when running in iOS to fit with new iOS 7 style
        if (Ext.os.is.iOS && Ext.os.version.major >= 7) {
            Ext.select(".x-toolbar").applyStyles("height: 62px; padding-top: 15px;");
        }

         // Hardware Back Button Listener
        if (Ext.os.is('Android')) {
            document.addEventListener("backbutton", Ext.bind(this.onBackKeyDown, this), false);
        }

        // Janky - must do this or the exit notification title may not fit properly. Possible issue in sdk.
        Ext.Msg.add({ maxHeight: 100 });
        Ext.Msg.doLayout();
    },

    /**
    * Captures the back key press on Android.
    * Doing this from home screen of app will kill the activity.
    **/
    onBackKeyDown: function (e) {

        Ext.Msg.confirm(
            "Confirmation",
            "Are you sure you want to exit? This will stop all tracking. Consider pressing the home button instead.",
            function(buttonId) {
                if (buttonId === 'yes') {
                    navigator.app.exitApp();
                }
            }
        );
        e.preventDefault();
    },

    onUpdated: function() {
        Ext.Msg.confirm(
            "Application Update",
            "This application has just successfully been updated to the latest version. Reload now?",
            function(buttonId) {
                if (buttonId === 'yes') {
                    pushNotification.unregister(successHandler, errorHandler);
                    window.location.reload();
                }
            }
        );
    },

    // Android Push Notification Handler
    onNotificationGCM: function(e){

        switch ( e.event ) {
            case 'registered':
                if (e.regid.length > 0) {

                    // make sure rider is registered
                    var riderInfo = Ext.getStore("RiderInfo");
                    riderInfo.load();

                    if(riderInfo.getCount() > 0){

                        try {
                            // register push notification to GCM server
                            Ext.Ajax.request({
                                url: 'http://devcycle.se.rit.edu/register_push/',
                                method: 'POST',
                                scope: this, // set scope of ajax call to this
                                params: {
                                    rider_id: riderInfo.getAt(0).data.riderId,
                                    push_id: e.regid
                                },
                                success: function(response){
                                    // TODO
                                },
                                failure: function(response){
                                    // TODO
                                }
                            });
                        } catch (error){
                            // TODO
                        }
                    }
                }
            break;

            case 'message':
                // notification happened while in foreground
                if ( e.foreground ) {
                    // play noise? TODO

                } else {
                    // launched from touching notification in tray
                    if ( e.coldstart ){
                        // TODO
                    }
                }

                // Janky - must do this or first notification the title doesn't fit.
                // Sencha bug?
                Ext.Msg.add({ maxHeight: 100 });
                Ext.Msg.alert('Message', e.payload.message, Ext.emptyFn).doLayout();
            break;

            case 'error':
                // log or something!
            break;

            default:
                alert("Unknown event");
            break;
        }
    },
});
