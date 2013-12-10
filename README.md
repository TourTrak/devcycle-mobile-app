devcycle-mobile-app
===================

The totally rad HTML5 'native' application built using Sencha Touch and Cordova for the TourTrak system.

###Dependencies
* Ruby 1.9.3
* Java Runtime Environment > 1.7
* Cordova > 3.0.0
* Sencha Command Line Tools > 4.0.1.45
* SASS (Ruby Gem)
* Compass (Ruby Gem)
* Android SDK (if building native Android)
* iOS SDK (if building native iOS)
* The TourTrak iOS cordova plugin
* The TourTrak Android cordova plugin

###Cordova Plugins
Application sends the following JSON parameter to the native plugins to start tracking:
{"dcsUrl": dcsUrl, "tourConfigId": tourConfigId, "riderId": riderId, "pushId": pushId}

###Application Status
Still very much in progress.
