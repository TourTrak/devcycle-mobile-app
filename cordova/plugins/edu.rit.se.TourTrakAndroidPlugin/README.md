tourtrak-android-plugin
=======================

Fabulous android location transmitter plugin for TourTrak

###Description
This plugin is for use with the TourTrak mobile application and is used to transmit a rider's location
in the background during the tour. It can be installed as a regular plugin or run as a standalone
application to aid contributing/making future changes.

###Automatic Installation for TourTrak Mobile Application

Navigate to the cordova folder in the TourTrak mobile application project and run the following command:
`cordova plugin add https://github.com/tofferrosen/tourtrak-android-plugin.git`. For additional information, please refer to Cordova or Phonegap documentation.

###Contributing/Developing as a Standalone Application
Simply download the whole repository and import it to Eclipse as an Android project. 
Under `assets/www` exists index.html, which you can use to test calling methods implemented in in the `CDVInterface.java` file under `src/edu/rit/se` directory. 
