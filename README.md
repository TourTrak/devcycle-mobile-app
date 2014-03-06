devcycle-mobile-app
===================

The totally rad HTML5 'native' application built using Sencha Touch and Cordova for the TourTrak system.

###Dependencies Required for Contributing 
* Ruby 1.9.3
* Java Runtime Environment > 1.7
* Cordova > 3.2.0
* Sencha Command Line Tools > 4.0.1.45
* SASS (Ruby Gem)
* Compass (Ruby Gem)
* Android SDK (if building native Android)
* iOS SDK (if building native iOS)

###Required Cordova Plugins
* Cordova Device Plugin (https://github.com/apache/cordova-plugin-device.git)
* Cordova Push Notification Plugin for Android and iOS (https://github.com/phonegap-build/PushPlugin)
* The TourTrak iOS cordova plugin (https://github.com/cck9672/geolocation-ios-noapp.git)
* The TourTrak Android cordova plugin (https://github.com/tofferrosen/tourtrak-android-plugin.git)
* Cordova Geolocation Plugin (https://github.com/apache/cordova-plugin-geolocation.git)

###Set up
1. Ensure you meet all the dependencies above in the Dependencies Required for Contributing.
2. Clone this repository and move into this folder.
3. Run the command `sencha cordova init edu.rit.se.tourtrak TourTrak`
4. Open the cordova.local.properties file with your favorite text editor and type the platform you intend to build i.e. android or ios or both.
4. Go into your cordova folder
5. Add all the required plugins in the order specified above by running `cordova plugin add {git-url}`. For example, one valid command would be `cordova plugin add https://github.com/apache/cordova-plugin-device.git`.
6. Go back to the application folder and run `sencha app build native` to build the native applications.
7. The native apps will be in the cordova/platform/{ios or android} folder. Run and enjoy!

###Application Status
Still in development; no stable versions yet.
