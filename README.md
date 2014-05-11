devcycle-mobile-app
===================

devcycle-mobile-app is a hybrid iOS/Android applicatiion built using Sencha Touch and Cordova for the TD Five Boro Bike Tour. To setup the dashboard/server that is used alongside this application, please refer first to our [TourTrak server repository].

![screenshot](https://raw.githubusercontent.com/tofferrosen/devcycle-mobile-app/master/preview.png)

[TourTrak server repository]: https://github.com/tofferrosen/devcycle-server.git

###Dependencies Required for Building Project
* Ruby 1.9.3
* Java Runtime Environment > 1.7
* Cordova > 3.2.0
* Sencha Command Line Tools > 4.0.1.45
* SASS (Ruby Gem)
* Compass (Ruby Gem)
* Android SDK (if building native Android)
* iOS SDK (if building native iOS)

###Required Cordova Plugins
Below is a list of the required plugins. We have included a script that will fetch these automatically by simply running `python fetchPlugins.py`. This assumes that the locations of these repos are still as written below.

* [Cordova Device Plugin]
* [The TourTrak iOS Plugin]
* [The TourTrak Android Plugin]
* [Cordova Geolocation Plugin]

[Cordova Device Plugin]: https://github.com/apache/cordova-plugin-device.git
[The TourTrak iOS Plugin]: https://github.com/cck9672/geolocation-ios-noapp.git
[The TourTrak Android Plugin]: https://github.com/tofferrosen/tourtrak-android-plugin.git
[Cordova Geolocation Plugin]: https://github.com/apache/cordova-plugin-geolocation.git

###Set up
1. Ensure you meet all the dependencies above in the Dependencies Required for Contributing.
2. Clone this repository and move into this folder.
3. Run the command `sencha cordova init edu.rit.se.tourtrak TourTrak`
4. Open the cordova.local.properties file with your favorite text editor and type the platform you intend to build i.e. android or ios or both.
4. Go into your cordova folder
5. If you did not run our script, add all the required plugins in the order specified above by running `cordova plugin add {git-url}`. For example, one valid command would be `cordova plugin add https://github.com/apache/cordova-plugin-device.git`. We have also included a handy script to automate this for you if you have Python installed. Just run `python fetchPlugins.py`!
6. Go back to the application root folder and run `sencha app build native` to build the native applications.
7. The native apps will be in the cordova/platform/{ios or android} folder. You can open the Android project in Eclipse as an existing android project, and the iOS project in XCode.

###Adding custom splashscreen for Android to app
1. Ensure your splashscreen .png file is being passed along by the TourTrak Android cordova plugin. Please see Android plugin repository.
2. In the TourTrak.java file, insert the following line of code between super.OnCreate() and super.init():
  super.setIntegerProperty("splashscreen", R.drawable.splash);

###Config File
In the config.json, you can specify the following parameters shown below. Please note that all timestamps are in unix time (seconds since epoch) for the GMT timezone, as we are timezone agnostic. Make sure you convert your tour time to GMT time, before converting that to the unix timestamp.

* app name : name of the app
* dcs_url : the url to the data collection server
* tour_id : the tour id
* tour_start_time : the unix timestamp of the tour start time ( when automatic tracking starts: secs since epoch GMT time)
* tour_end_time : the unix timestamp of the tour end time ( when tracking should end: secs since epoch GMT time)
* reg_retry_init : if registration fails, how often it should retry for the next 10 tries (in seconds)
* reg_retry_after : if registration is still failing after 10 tries, how often it should retry (in seconds)

###Adding new slippery map tiles
To generate a new set of tiles, please refer to our [BikeNY-red] repository which includes instructions for setup.

[BikeNY-red]: https://github.com/tofferrosen/bikeNY-red.git

###Modifying the Points of Interests
All points of interested are parsed from a KML file located under resources/data.kml. To modify this file in a GUI-like way, you can open it directly in Google Earth where you are free to add new markers or modify any existing markers. Re-extract the KML file, saving it as data.kml, and replace the previous one. 

To get the appropriate marker icons, please refer to our [Map Marker Icon Area Tags] document under the reference directory, In the description for each marker, one signifies the icon of marker by including an `[AREA][/AREA]` tag. Instructions are included in the aformentioned document.

[Map Marker Icon Area Tags]: https://github.com/tofferrosen/devcycle-mobile-app/raw/master/reference/Map%20Marker%20Icon%20Area%20Tags.docx

### More
We have inlucded some system diagrams and the offline map architecture under the references folder.

