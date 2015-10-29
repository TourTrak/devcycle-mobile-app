'''
This script fetches all the required plugins automatically.
Assumes cordova has been added successfully to the project.
Requires sudo access. Mac/Linux support only

Usage: sudo python fetchPlugins.py
Author: Christoffer Rosen <cbr4830@rit.edu>
Editted By: Conor Wright <cgw5994@rit.edu>
'''

import os

# Change to the cordova directory
os.chdir("cordova")

# Add the cordova device plugin
os.system("cordova plugin add https://github.com/apache/cordova-plugin-device.git")

# Add the tourtrak iOS plugin
os.system("cordova plugin add https://github.com/TourTrak/tourtrak-ios-plugin.git")

# Add the tourtrak android plugin
os.system("cordova plugin add https://github.com/TourTrak/tourtrak-android-plugin.git")

# Add the cordova geolocation plugin
os.system("cordova plugin add https://github.com/apache/cordova-plugin-geolocation.git")

# Print out all the plugins installed for the user
os.system("cordova plugin ls")
