/**
* Controller for the Home View (tab panel).
* Initalizes with the correct tabs, with all views properly initalized
*
* Contains the start tracking function which interfaces with the native
* cordova plugins and the register rider function that attempts to register
* a rider to a tour.
*
* Once successfully registered, a rider id is saved to local storage with HTML5 proxy.
* This id will persist with the rider throughout the tour.
**/

Ext.define('DevCycleMobile.controller.Home', {
  extend: 'Ext.app.Controller',

  config: {
    control: {
      '#home': {
        initialize: 'onTabpanelInitialize'
      }
    }
  },

  /**
  * Calls start on the phonegap/cordova abstraction layer
  * Expects the CDVInterface plugin with method start implemented,
  * which will start initalize everything to properly track the rider
  **/
  startTracking: function (rider_id) {
    // Call the native plugins to begin tracking
    cordova.exec(
      function () {
        // do nothing: successful.
        console.log('call to native plugin successful.');
      },
      function (message) {
        console.error('start tracking error ' + message);
        // this should never ever happen :S
      },
      'CDVInterface',
      'start',
      [{
        'dcsUrl': this.tourInfo.data.dcs_url,
        'startBetaTime': this.tourInfo.data.tour_start_beta_time,
        'startTime': this.tourInfo.data.tour_start_time,
        'endBetaTime': this.tourInfo.data.tour_end_beta_time,
        'endTime': this.tourInfo.data.tour_end_time,
        'tourId': this.tourInfo.data.tour_id,
        'riderId': rider_id
      }]
   );

    // Initialize the Rider's Groups
    this.initGroup(rider_id);
  },

  /**
  * If rider is not already registered, register him or her.
  * If registration doesn't work, it retries in intervals defined in the
  * json.config file. The first 10 tries are using the reg_retry_init value
  * in seconds, and after this it uses the value of the reg_retry_after value
  * to determine how long to wait until attempting to register again.
  *
  * If rider IS registered, check if prod flag has been set. This would not be set for the BETA riders.
  * They need to reregister and get a new rider id, we then update the rider info.
  *
  * Note: registeration only works on mobile browsers due to AJAX calls;
  * not a priority fix.
  **/
  registerRider: function () {
    var self = this;
    var rider_id = Ext.device.Device.uuid;

    // If we haven't registered yet, get rider id from server
    if (this.riderStore.getCount() === 0) { // & Ext.browser.is.PhoneGap) {

      // Register rider
      Ext.Ajax.request({
        url: this.tourInfo.data.dcs_url + '/register/',
        method: 'POST',
        scope: this, // set scope of ajax call to this
        params: {
          os: Ext.os.name + ' ' + Ext.os.version,
          device: Ext.os.name,
          tourId: this.tourInfo.data.tour_id,
          id: rider_id
        },
        success: function (response) {
          var newRider = new DevCycleMobile.model.Rider({
            riderId: rider_id,
            prod: 'true'
          });

          // Save the rider info (id)
          self.riderStore.add(newRider);
          self.riderStore.sync();

          // start tracking
          self.startTracking(rider_id);
        },
        failure: function (response, options) {
          console.error('Registration Failure');
          console.error(response);
          console.error('retry attempts: ' + self.regAttempts);

          // if less than 10 attempts at made, use the reg retry init limit
          if (self.regAttempts < 10) {
            setTimeout(function () {
              self.registerRider();
            }, self.tourInfo.data.reg_retry_init * 1000);
          } else {
            // otherwise, use the reg retry after limit
            setTimeout(function () {
              self.registerRider();
            }, self.tourInfo.data.reg_retry_after * 1000);
          }

          self.regAttempts++;
        }
      });
    } else {
      var riderInfo = this.riderStore.first();

      // check if this was a beta registration - need to register again to the production
      if (riderInfo.get('prod') === null) {
        // Get a new rider ID/ new registration!
        Ext.Ajax.request({
          url: this.tourInfo.data.dcs_url + '/register/',
          method: 'POST',
          scope: this, // set scope of ajax call to this
          params: {
            os: Ext.os.name + ' ' + Ext.os.version,
            device: Ext.os.name,
            tourId: this.tourInfo.data.tour_id,
            id: rider_id
          },
          success: function (response) {
            var riderInfo = self.riderStore.first();

            // Update the rider info (id) from the production server
            riderInfo.set('riderId', rider_id);
            riderInfo.set('prod', true); // update to signify this is a prod rider id
            riderInfo.dirty = true; // signify to sencha that this object has been modified and need to be updated
            self.riderStore.sync(); // sync the store

            // start tracking w/ new rider id!
            self.startTracking(rider_id);
          },
          failure: function (response, options) {
            console.error('Registration Failure');
            console.error(response);
            console.error('retry attempts: ' + self.regAttempts);

            // if less than 10 attempts at made, use the reg retry init limit
            if (self.regAttempts < 10) {
              setTimeout(function () {
                self.registerRider();
              }, self.tourInfo.data.reg_retry_init * 1000);
            } else {
              // otherwise, use the reg retry after limit
              setTimeout(function () {
                self.registerRider();
              }, self.tourInfo.data.reg_retry_after * 1000);
            }

            self.regAttempts++;
          }
        });
      } else {
        // already registered so no need to re-register
        this.startTracking(riderInfo.data.riderId);
      }
    }
  },

  /**
  * Initiates the group store and group rider store upon loading the app
  */
  initGroup: function (rider_id) {
    var groupRiderStore = Ext.getStore('GroupRiderInfo');
    var groupStore = Ext.getStore('GroupInfo');
    var riderStore = Ext.getStore('GroupInfo');

    // var riderRecord = riderStore.first();
    // var thisRiderId = riderRecord.get('riderId');
    // var thisRiderId = 1;

    var thisRiderId = rider_id;

    Ext.data.JsonP.request({
      url: this.tourInfo.data.dcs_url + '/list_group/' + thisRiderId,
      type: 'GET',
      callbackKey: 'callback',
      callback: function (data, result) {
        if (data) {
          if (result[0].success === 'true') {
            for (var i = 1; i < result.length; i++) {
              console.log('CACHING ' + i);
              DevCycleMobile.app.getController('Groups').cacheGroup(result[i].code, result[i].name, 'join');
            }
          } else {
            alert(result[0].message);
          }
        } else {
          alert('Could not reach the server. Please check your connection');
        }
      }
    });
  },

  timerTask: function () {
    if (this.timerStart === false) {
      this.timerStart = true;
      var runner = new Ext.util.TaskRunner();
      var task = runner.start(this.updateGroupLocationTask);
    }
  },

  updateGroupLocations: function () {
    if (this.firstUpdateLocations) {
      console.log('Will update groups in 1 minute');
      this.firstUpdateLocations = false;
    } else {
      DevCycleMobile.app.getController('Groups').updateGroups();
    }
  },

  /**
  * Called when the tab is initalized, sets up all the tabs
  * in the home view.
  * @private
  **/
  onTabpanelInitialize: function (component, options) {
    this.tourInfo = Ext.getStore('TourInfo').first();  // tour info
    this.riderStore = Ext.getStore('RiderInfo'); // reference to the rider store
    this.groupRiderStore = Ext.getStore('GroupRiderInfo');
    this.groupStore = Ext.getStore('GroupInfo');

    // Task to check the server for updates to rider positions (if in group)
    // 600,000 ms = 10 mins
    this.updateGroupLocationTask = {
      run: this.updateGroupLocations,
      // interval: 600000,
      interval: 60000,
      scope: this
    };

    // Clear the group stores upon starting the app so we can get
    // fresh data
    this.groupStore.removeAll(true);
    this.groupStore.sync();
    this.groupRiderStore.removeAll(true);
    this.groupRiderStore.sync();

    this.regAttempts = 1; // # of registration attempts.

    // Initalize all necessary views for tabs
    var mapContainerView = Ext.create('DevCycleMobile.view.map.Container');
    var faqContainerView = Ext.create('DevCycleMobile.view.guide.Container');
    var groupsContainerView = Ext.create('DevCycleMobile.view.groups.Container');
    var aboutContainerView = Ext.create('DevCycleMobile.view.about.Container');

    // define the dynamic tab panel and then add it to the component
    var tabPanel = [
      mapContainerView,
      faqContainerView,
      groupsContainerView,
      aboutContainerView
    ]; // End tab panel items

    // Add tab panel to component
    component.add(tabPanel);

    // Set active item to the map view
    component.setActiveItem(0);
    // this.timerTask();
    // var runner = new Ext.util.TaskRunner();
    // var task = runner.start(this.updateGroupLocationTask);

    try {
      this.registerRider();
    } catch (error) {
      console.error('registration failed!');
    }
  },

  // Base Class functions
  launch: function () {
    this.callParent(arguments);
  },

  // init and set variables.
  init: function () {
    this.timerStart = false;
    this.firstUpdateLocations = true;
    this.callParent(arguments);
  }
});
