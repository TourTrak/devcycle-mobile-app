TourTrak (devcycle-mobile-app)
===================

devcycle-mobile-app is a hybrid iOS/Android application built using Sencha Touch
and Cordova for the TD Five Boro Bike Tour. To setup the dashboard/server that
is used alongside this application, please refer first to our [TourTrak server
repository].

![screenshot](https://raw.githubusercontent.com/TourTrak/devcycle-mobile-app/master/preview.png)

[TourTrak server repository]: https://github.com/TourTrak/devcycle-server.git

## Development Instructions
This section discusses the normal development process.  It assumes that you are
a developer new to the application and steps through the build dependencies as
well as the actual build process.

### Dependencies
The following lists of dependencies *must* be installed prior to building the
application.  Executables for each dependency must be accessible through your
`PATH`.

* [Git](https://git-scm.com)
* NodeJS (Current Version)
	* [http://nodejs.org/](http://nodejs.org/ "NodeJS Site")
* [Ruby 1.9.3](https://www.ruby-lang.org/en)
  * (Windows) During installation, Ensure to select "Add Ruby Executables to
    your PATH"
* [Java Runtime Environment >=
  1.7](http://www.oracle.com/technetwork/java/javase/downloads/jre7-downloads-1880261.html)
* [Java Development Kit
  7](http://www.oracle.com/technetwork/java/javase/downloads/jdk7-downloads-1880260.html)
* [Python (Latest version)](https://www.python.org/)
* Ant
	* (Windows) [https://code.google.com/p/winant/](https://code.google.com/p/winant/)
	* (Mac/Linux/Unix) See [http://ant.apache.org/manual/install.html](http://ant.apache.org/manual/install.html)
* [Cordova 5.4+](https://cordova.apache.org/)
	* Install this version by typing in the terminal
		* `[sudo] npm install -g cordova@5.4`
* Sencha Command Line Tools 6.0.2.14 available [here](https://www.sencha.com/products/extjs/cmd-download/)
* [Android SDK (if building native
  Android)](http://developer.android.com/sdk/installing/index.html)
  * *Note:* Ensure that you add the Android SDK to the PATH with access to the
    following directories:
    * platform-tools
    * tools
* iOS SDK (if building native iOS)

#### Required Cordova Plugins
 from the root directory will install all dependencies.  The
full list of requirements can be found by opening that script.

### Building the Project
1. Clone this repository and `cd` into the directory: `git clone
   https://github.com/TourTrak/devcycle-mobile-app.git && cd
   devcycle-mobile-app`
2. Run the command `sencha cordova init edu.rit.se.tourtrak TourTrak`.  This
   will initialize the cordova project within the `cordova` directory.
3. Install the required plugins by running `python fetchPlugins.py` from the
   terminal
4. Execute `git submodule update --init --recursive` in order to pull down
   [leaflet-usermarker] into the third party libraries and
   [resources](https://github.com/tourtrak/resources) into the resources
   directory.
5. If you are not planning on building both Android and iOS apps, you should
   update [this line][native-build-line] to include only the platform you wish
   to build for.
6. Run `sencha app build native` build the apps into `cordova/platforms/`.

#### Debugging Development Environment Issues (Tips)
* Sencha commands can be run with the flag `-d`, you will see the full debug
  output.  For example, running `sencha -d app build native` will provide
  significantly more information about what is going on.

------

## Miscellaneous Development Tips
The above will provide you with a working build of the application that you can
run.  Below you will find tasks which are someone outside of the normal
development process, but are documented for future reference.

### Configuring the Splash Screen and App Icon

Add the following to the top level of the XML in cordova/config.xml:

```
    <icon src="../resources/branding/drawable-ldpi/icon.png" density="ldpi" width="36" height="36" />
    <icon src="../resources/branding/drawable-mdpi/icon.png" density="mdpi" width="48" height="48" />
    <icon src="../resources/branding/drawable-hdpi/icon.png" density="hdpi" width="72" height="72" />
    <icon src="../resources/branding/drawable-xhdpi/icon.png" density="xhdpi" width="96" height="96" />
    <icon src="../resources/branding/drawable/icon.png" />

    <preference name="AutoHideSplashScreen" value="false" />

    <splash src="../resources/branding/drawable-ldpi/splash.png" density="port-ldpi" width="480" height="800" />
    <splash src="../resources/branding/drawable-mdpi/splash.png" density="port-mdpi" width="640" height="960" />
    <splash src="../resources/branding/drawable-hdpi/splash.png" density="port-hdpi" width="320" height="480" />
    <splash src="../resources/branding/drawable-xhdpi/splash.png" density="port-xhdpi" width="640" height="1136" />
    <splash src="../resources/branding/drawable/splash.png" />
    <icon src="../resources/icons/Icon.png" width="57" height="57" />
    <icon src="../resources/icons/Icon@2x.png" width="114" height="114" />
```

Adjust the image paths as necessary. The paths are relative to the
location of the config.xml file.

These set the splash screen and icon for all variants of the app. If you need
to configure more specialized splashes or icons that are platform-specific,
add these to the platform defined in the xml that they pertain to and edit
accordingly.

More information can be found at the
[the Sencha forums](https://www.sencha.com/forum/showthread.php?279722-Sencha-PhoneGap-and-app-s-icon)
and at
[the Cordova documentation](https://cordova.apache.org/docs/en/6.x/config_ref/images.html).

### Adding/Modifying FAQ Questions
There are three steps in this process:

1. Create the FAQ data.  This is stored in `resources/data/<faq_name>.js` and
   looks like:

 ```
 {
     "items" : [{
                 "text" : "<question a>?",
                 "items" : [{
                             "text" : "<answer a>",
                             "leaf" : true
                         }]
             },
             {
                 "text" : "<question b>?",
                 "items" : [{
                             "text" : "<answer b>",
                             "leaf" : true
                         }]
             }]
 }
 ```

2. Create the store file at `app/store/<tag_name>.js` and give it the content:

```
Ext.define('DevCycleMobile.store.<tag_name>', {
    extend: 'Ext.data.TreeStore',
    requires: [
        'DevCycleMobile.model.Answer'
    ],

    config: {
        defaultRootProperty: 'items',
        model: 'DevCycleMobile.model.Answer',

        // XXX: AccordionList Now show data from JSON
        proxy: {
            type: 'ajax',
            url: 'resources/data/<tag_name>.json'
        }
    }

});
```
3. Add the item to [app/view/Main.js](app/view/Main.js).  Add the following
   entry to the `items` array.

```
            {
                title: '<tag title>',
                layout: 'vbox',
                items: [
                    {
                        xtype: 'accordionlist',
                        store: Ext.create('DevCycleMobile.store.<tag_name>'),
                        flex: 1,
                        itemId: 'paging',
                        listeners: {
                            initialize: function() {
                                this.load();
                            }
                        }
                    }
                ],
                control: {
                    'button[action=expand]': {
                        tap: function() {
                            this.down('accordionlist').doAllExpand();
                        }
                    },
                     'button[action=collapse]': {
                        tap: function() {
                            this.down('accordionlist').doAllCollapse();
                        }
                    }
                }
            }
```

### Config File
The file [config.json](config.json) stores configuration settings for the app.
The options are described below:

* `app name`: name of the app
* `dcs_url`: the url to the data collection server
* `tour_id`: the tour id
* `tour_start_time`: the unix timestamp of the tour start time ( when automatic
  tracking starts: secs since epoch GMT time)
* `tour_end_time`: the unix timestamp of the tour end time ( when tracking should
  end: secs since epoch GMT time)
* `reg_retry_init`: if registration fails, how often it should retry for the next
  10 tries (in seconds)
* `reg_retry_after` : if registration is still failing after 10 tries, how often
  it should retry (in seconds)

### Adding new slippery map tiles
To generate a new set of tiles, please refer to our [BikeNY-red] repository
which includes instructions for setup.

[BikeNY-red]: https://github.com/TourTrak/bikeNY-red.git

### Modifying the Points of Interests
All points of interested are parsed from a KML file located under
[resources/data.kml](resources/data.kml). To modify this file in a GUI-like way,
you can open it directly in [Google Earth] where you are free to add new markers
or modify any existing markers. Re-extract the KML file, saving it as data.kml,
and replace the previous one.

To get the appropriate marker icons, please refer to our [Map Marker Icon Area
Tags] document under the reference directory, In the description for each
marker, one signifies the icon of marker by including an `[AREA][/AREA]` tag.
Instructions are included in the aformentioned document.

The locations themselves are parsed in file inside
[third_party_libraries/kml.js](third_party_libraries/kml.js)  folder, which
needs to be modified if new types of icons are desired.

[Map Marker Icon Area Tags]: https://github.com/TourTrak/devcycle-mobile-app/raw/master/reference/Map%20Marker%20Icon%20Area%20Tags.docx

[Google Earth]: http://www.google.com/earth/

### Adding new Map Marker Icons using IcoMoon
All icons are scalable vector icons that can easily be customized through CSS.

#### Create new icon font
[IcoMoon] is used to create the icons used in the app.  To use it, go to the
site and click on the IcoMoon App button.  Import your custom vectors by
clicking the "Import Icons" button.  Select the icons you added and click the
button labeled "Generate Font".  Pay attention to the name of each icon, as it
will used to style and display the icon.  When you are satisfied, click
"Download".  Note that you may have a conflict in the Unicode character code for
your icons.  If you do, you can click on the Unicode character code and use the
UI to change the character code.

#### Using the new icon font
After downloading the font, you will have a zip file that contains `style.css`
as well as `fonts/`.  You should rename both of these to a less-generic name,
such as `my-style.css`, and `my-fonts/`.  Copy the newly renamed `fonts/` to
[resources/fonts/](resources/fonts) and the newly renamed `style.css` to
[resources/css/](resources/css).  Next, you need to update the stylesheet to
include the proper path of the font directory.  In this example, each `src:url`
should look like:

```
	src:url('../fonts/my-fonts/bikeNYIcons.eot?-5d5x6j');
```

Please ignore that there are some slight more differences in the endings as it's
a simply copy and paste of two differnt things.

[IcoMoon]: http://icomoon.io/

#### Updating the KML parser to include your new icons as new area tags.
Now, you are ready to use your new icon font. In the KML parser under
[third_party_libraries/kml.js](third_party_libraries/kml.js) find the function
createCustomMarker. Create a new if block with the name of the area tag you want
to associate this icon with when parsing the kml file. The format is the
following:

```
	else if (area == 'helmet') {
			return L.AwesomeMarkers.icon({
				icon: 'helmet',
				markerColor: 'orange',
				prefix: 'bikeny'
			});
		}
```

Icon is the name you gave your custom icon. MarkerColor is which color you want
this marker to be - you may be limited in choices as we use [leaflet
awesome-markers] to create the markers - so refer to their documentation. The
prefix will be the name of the set - you can find this if you open the
MyRadNewIcons.css file and see something similar to:

```
.bikeny-info-tent:before {
	content: "\e600";
}
```

Here, the prefix we use is bikeny.  Please keep the documentation up to date
with the new icons in this document: [Map Marker Icon Area Tags] if you
contribute more marker icons.

[leaflet awesome-markers]: https://github.com/lvoogdt/Leaflet.awesome-markers

### Additional Reference Docs
We have included some system diagrams and the offline map architecture under the
references folder.  If you are trying to find content specific to Apple
development, there is an Apple Development Guide, located
[here](reference/AppleDevelopmentGuide.docx)

### Code Libraries
Some libraries were used to develop this application:
* Sencha Touch: 2.3.1
* ExtJs: 4.1.0

[plugins]: #required-cordova-plugins
[leaflet-usermarker]: https://github.com/heyman/leaflet-usermarker
[native-build-line]: https://github.com/TourTrak/devcycle-mobile-app/blob/master/app.json#L8
[splash]: https://github.com/TourTrak/tourtrak-android-plugin/blob/master/src/edu/rit/se/TourTrakAndroidPlugin.java#L32
