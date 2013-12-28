cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/edu.rit.se.TourTrakAndroidPlugin/assets/www/js/CDVInterface.js",
        "id": "edu.rit.se.TourTrakAndroidPlugin.CDVInterface",
        "clobbers": [
            "window.CDVAndroidInterface"
        ]
    }
]
});