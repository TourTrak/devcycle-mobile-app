'''
This script fetches all the required plugins automatically.
Assumes cordova has been added successfully to the project.

Usage: python fetchPlugins.py
'''

import subprocess
import os

# Change to the cordova directory
os.chdir("cordova")

# Add the cordova device plugin
subprocess.call("cordova -d plugin add https://github.com/apache/cordova-plugin-device.git", shell=True)

# Add the cordova splash screen plugin
subprocess.call("cordova -d plugin add https://github.com/apache/cordova-plugin-splashscreen.git", shell=True)


# Add the tourtrak iOS plugin
subprocess.call("cordova -d plugin add https://github.com/TourTrak/tourtrak-ios-plugin.git", shell=True)

# Add the tourtrak android plugin
subprocess.call("cordova -d plugin add https://github.com/TourTrak/tourtrak-android-plugin.git", shell=True)

# Add the cordova geolocation plugin
subprocess.call("cordova -d plugin add https://github.com/apache/cordova-plugin-geolocation.git", shell=True)

# Print out all the plugins installed for the user
subprocess.call("cordova -d plugin ls", shell=True)

