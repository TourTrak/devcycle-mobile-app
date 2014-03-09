'''
This script fetches all the required plugins automatically.
Assumes cordova has been added successfully to the project.
Requires sudo access. Mac/Linux support only

Usage: sudo python fetchPlugins.py
Author: Christoffer Rosen <cbr4830@rit.edu>
'''

import os

# Change to the cordova directory
os.chdir("cordova")

# Add the cordova device plugin
os.system("sudo cordova -d plugin add https://github.com/apache/cordova-plugin-device.git")

# Add the cordova push notification plugin
os.system("sudo cordova -d plugin add https://github.com/phonegap-build/PushPlugin")

# Add the tourtrak iOS plugin
os.system("sudo cordova -d plugin add https://github.com/cck9672/geolocation-ios-noapp.git")

# Add the tourtrak android plugin
os.system("sudo cordova -d plugin add https://github.com/tofferrosen/tourtrak-android-plugin.git")

# Add the cordova geolocation plugin
os.system("sudo cordova -d plugin add https://github.com/apache/cordova-plugin-geolocation.git")

# Print out all the plugins installed for the user
os.system("sudo cordova -d plugin ls")