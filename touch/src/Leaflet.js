/**
 * Wraps a Leaflet Map in an Ext.Component.
 *
 * ## Example
 *
 *     Ext.Viewport.add({
 *         xtype: 'leaflet',
 *         useCurrentLocation: true
 *     });
 *
 */
 
Ext.define('Ext.Leaflet', {
    extend: 'Ext.Component',
    xtype : 'leaflet',
    id: 'mapview',
    requires: ['Ext.util.GeoLocation'],

    isMap: true,

    config: {
        /**
         * @event maprender
         * @param {Ext.Map} this
         * @param {L.Map} map The rendered map instance
         */

        /**
         * @event centerchange
         * @param {Ext.Map} this
         * @param {L.Map} map The rendered map instance
         * @param {L.LatLng} center The current LatLng center of the map
         */

        /**
         * @event zoomchange
         * @param {Ext.Map} this
         * @param {L.Map} map The rendered Leaflet map instance
         * @param {Number} zoomLevel The current zoom level of the map
         */

        /**
         * @cfg {String} baseCls
         * The base CSS class to apply to the Maps's element
         * @accessor
         */
        baseCls: Ext.baseCSSPrefix + 'lmap',

        /**
         * @cfg {Boolean/Ext.util.GeoLocation} useCurrentLocation
         * Pass in true to center the map based on the geolocation coordinates or pass a
         * {@link Ext.util.GeoLocation GeoLocation} config to have more control over your GeoLocation options
         * @accessor
         */
        useCurrentLocation: false,

        /**
         * @cfg {map} map
         * The wrapped map.
         * @accessor
         */
        map: null,

        /**
         * @cfg {Ext.util.GeoLocation} geo
         * @accessor
         */
        geo: null,

        /**
         * @cfg {Object} mapOptions
         * @accessor
         */
        mapOptions: {}
    },

    constructor: function() {
        this.callParent(arguments);
        this.options= {};
        this.element.setVisibilityMode(Ext.Element.OFFSETS);
    },

    initialize: function() {
        this.callParent();
        this.geo = this.geo || new Ext.util.GeoLocation({
            autoLoad : false
        });
        this.on({
            painted: 'renderMap',
            scope: this
        });
        this.element.on('touchstart', 'onTouchStart', this);
    },

    onTouchStart: function(e) {
        e.makeUnpreventable();
    },

    applyMapOptions: function(options) {
        return Ext.merge({}, this.options, options);
    },

    updateMapOptions: function(newOptions) {
        var map = this.getMap();

        if (map) {
            map.setOptions(newOptions);
        }
    },

    getMapOptions: function() {
        return Ext.merge({}, this.options);
    },

    updateUseCurrentLocation: function(useCurrentLocation) {
        this.setGeo(useCurrentLocation);
    },

    applyGeo: function(config) {
        return Ext.factory(config, Ext.util.GeoLocation, this.getGeo());
    },

    updateGeo: function(newGeo, oldGeo) {
        var events = {
            locationupdate : 'onGeoUpdate',
            locationerror : 'onGeoError',
            scope : this
        };

        if (oldGeo) {
            oldGeo.un(events);
        }

        if (newGeo) {
            newGeo.on(events);
            newGeo.updateLocation();
        }
    },

    doResize: function() {
        var map = this.getMap();
        if (map) {
            map.invalidateSize();
        }
    },

    // @private
    renderMap: function() {
        var me = this,
            element = me.element,
            mapOptions = me.getMapOptions(),
            event;

        var mapInfo = Ext.getStore("MapInfo").getAt(0).data;
      
        // Get map center info
        var centerInfo = mapInfo.center.split(",");
        var centerLat = centerInfo[1];
        var centerLong = centerInfo[0];

        // get map bounds
        var boundInfo = mapInfo.bounds.split(",");
        var southWest = L.latLng(boundInfo[1], boundInfo[0]);
        var northEast = L.latLng(boundInfo[3], boundInfo[2]);

        this.tileLayer = new L.TileLayer('resources/map_tiles/{z}/{x}/{y}.png', {
            attribution: mapInfo.attribution,
            maxZoom: mapInfo.maxzoom,
            minZoom: mapInfo.minzoom,
            errorTileUrl: 'resources/images/error_tile.png'
        });

        mapOptions = Ext.merge({
            layers : [this.tileLayer],
            zoom : this.zoomLevel || 15,
            maxZoom : 18,
            zoomControl : true,
            attributionControl : true,
            center : this.center || new L.LatLng(centerLat, centerLong),
            maxBounds : L.latLngBounds(southWest, northEast) 
        }, mapOptions);

        this.map = new L.Map(element.id, mapOptions);

        /* TEST getting geolocation data from MapBox 
        Ext.Ajax.request({
            url: 'http://api.tiles.mapbox.com/v3/tofferrosen.hbopi9m4/markers.geojson',
            method: 'POST',
            scope: this, // set scope of ajax call to this
            params: {},
            success: function(response){

                var decodedResponse = Ext.JSON.decode(response.responseText);
                rider_id = decodedResponse.rider_id;
                var newRider = new DevCycleMobile.model.Rider({
                    riderId: rider_id
                });

                // Save the rider info (id)
                self.riderInfo.add(newRider);
                self.riderInfo.sync();

                // start tracking
                self.startTracking(rider_id);
                self.registerPushNotification(rider_id);
            },
            failure: function(response){
                console.log(response);
                alert("Registration Failure");
                return;
            }
        }); */
        
      //  var mapboxGeoJson = {"features":[{"geometry":{"coordinates":[-74.01587963104248,40.70292765716555],"type":"Point"},"properties":{"description":"This is the start/finish  of the tour. Cheers!","id":"marker-hs2397ke0","marker-color":"#c5e96f","marker-size":"large","marker-symbol":"star","title":"Start/Finish"},"type":"Feature"},{"geometry":{"coordinates":[-73.98390769958496,40.75379165484874],"type":"Point"},"properties":{"description":"","id":"marker-hs23ccba1","marker-color":"#3ca0d3","marker-size":"large","marker-symbol":"music","title":""},"type":"Feature"},{"geometry":{"coordinates":[-73.98828506469727,40.748752521133795],"type":"Point"},"properties":{"description":"","id":"marker-hs23e4xw2","marker-color":"#3ca0d3","marker-size":"large","marker-symbol":"music","title":""},"type":"Feature"},{"geometry":{"coordinates":[-73.95463943481445,40.79990635821681],"type":"Point"},"properties":{"description":"","id":"marker-hs23eio53","marker-color":"#3ca0d3","marker-size":"large","marker-symbol":"music","title":""},"type":"Feature"},{"geometry":{"coordinates":[-73.94867420196533,40.80945677532709],"type":"Point"},"properties":{"description":"","id":"marker-hs23f3rf4","marker-color":"#3ca0d3","marker-size":"large","marker-symbol":"music","title":""},"type":"Feature"},{"geometry":{"coordinates":[-73.93434047698975,40.80627345566163],"type":"Point"},"properties":{"description":"","id":"marker-hs23faf85","marker-color":"#3ca0d3","marker-size":"large","marker-symbol":"music","title":""},"type":"Feature"},{"geometry":{"coordinates":[-73.92670154571533,40.80396707765352],"type":"Point"},"properties":{"description":"","id":"marker-hs23fpu06","marker-color":"#3ca0d3","marker-size":"large","marker-symbol":"music","title":""},"type":"Feature"},{"geometry":{"coordinates":[-73.93648624420166,40.79353864997009],"type":"Point"},"properties":{"description":"Rest here","id":"marker-hs23g8gt7","marker-color":"#b7ddf3","marker-size":"large","marker-symbol":"circle","title":"Rest Area"},"type":"Feature"},{"geometry":{"coordinates":[-73.92322540283203,40.77813666768432],"type":"Point"},"properties":{"description":"Rest area in astoria park","id":"marker-hs23kkcm8","marker-color":"#b7ddf3","marker-size":"large","marker-symbol":"circle","title":"Rest Area"},"type":"Feature"},{"geometry":{"coordinates":[[-74.01562213897705,40.70361087114778],[-74.01472091674805,40.70497727808752],[-74.01386260986328,40.70670151350381],[-74.00802612304688,40.71509432380265],[-73.99188995361328,40.73132392805779],[-73.98837089538574,40.74959782183326],[-73.98347854614258,40.75557964275591],[-73.97592544555664,40.766111540973775],[-73.9767837524414,40.76728164887668],[-73.97420883178711,40.770011820529064],[-73.97266387939453,40.76988181489869],[-73.96940231323242,40.772611879721836],[-73.96871566772461,40.77482185003984],[-73.96717071533203,40.77651177774135],[-73.96408081054688,40.782491176741395],[-73.96064758300781,40.78197125036929],[-73.95687103271484,40.78834006798032],[-73.95498275756836,40.79301881008675],[-73.95395278930664,40.79574792406613],[-73.95515441894531,40.79756727106044],[-73.95463943481445,40.800166251701846],[-73.94845962524413,40.80965166748853],[-73.93455505371094,40.8064033900658],[-73.93219470977783,40.807735203040586],[-73.93095016479492,40.80828741033761],[-73.92502784729004,40.80568874769462],[-73.9266586303711,40.804194470596194],[-73.93052101135254,40.80283010125349],[-73.93386840820312,40.79841195093039],[-73.93695831298828,40.79366860930495],[-73.9376449584961,40.792758888618756],[-73.93515586853027,40.79171919257143],[-73.93901824951172,40.7864554814967],[-73.94391059875488,40.78307608904521],[-73.94425392150879,40.77995649723549],[-73.9423656463623,40.77586181063573],[-73.9438247680664,40.77332687816298],[-73.94648551940917,40.77144186567577],[-73.95249366760254,40.76455136505513],[-73.95575523376465,40.761560925502806],[-73.95858764648438,40.7588954203221],[-73.94948959350586,40.75434431079081],[-73.94373893737793,40.759805604840516],[-73.93996238708496,40.76617654750888],[-73.93592834472656,40.76773668527497],[-73.93584251403809,40.76890676456327],[-73.93472671508789,40.7701418259051],[-73.93386840820312,40.771896873586314],[-73.92622947692871,40.77228687788682],[-73.92313957214354,40.77540682987812]],"type":"LineString"},"properties":{"description":"","id":"marker-hs23nkvl9","stroke":"#000000","stroke-opacity":1,"stroke-width":8,"title":""},"type":"Feature"},{"geometry":{"coordinates":[[-73.92622947692871,40.77235187838098],[-73.92794609069824,40.76968680597621],[-73.93695831298828,40.7598706175435],[-73.9441680908203,40.75226369980747],[-73.94914627075195,40.75440932883489],[-73.95206451416014,40.75135341202851],[-73.95232200622559,40.748752521133795],[-73.95249366760254,40.747582087041366],[-73.94966125488281,40.747061887498944],[-73.9515495300293,40.742444938247374],[-73.9530086517334,40.73795773681417],[-73.95137786865234,40.73015318726155],[-73.95764350891112,40.73002310367934],[-73.95798683166502,40.72377879267691],[-73.95927429199219,40.72247782080547],[-73.95249366760254,40.718444646402055],[-73.95566940307616,40.710637808196715],[-73.96124839782715,40.71037756449121],[-73.96124839782715,40.70712443235431],[-73.96270751953125,40.705953265881305],[-73.95970344543457,40.70296019132363],[-73.9628791809082,40.69632289402888],[-73.97858619689941,40.69632289402888],[-73.98056030273438,40.69625781921317],[-73.98562431335449,40.70074783237384],[-73.99128913879395,40.70172388214517],[-73.99566650390625,40.70048755001933],[-73.9990997314453,40.693719851820724],[-73.99944305419922,40.69196274083697],[-73.99884223937988,40.68981509781854],[-74.0035629272461,40.68063802521456],[-73.99609565734863,40.66722811557896],[-73.99643898010254,40.66488435937626],[-74.00725364685059,40.65472713073042],[-74.02090072631836,40.64092123848905],[-74.03291702270508,40.6414422674093],[-74.03712272644043,40.63772984761156],[-74.03961181640625,40.63251908563733],[-74.0412425994873,40.62411587537094],[-74.03986930847167,40.614538835170045],[-74.03549194335938,40.61056428615614],[-74.03549194335938,40.60913078424154],[-74.05583381652832,40.602940309246286],[-74.07737731933594,40.60600303696254],[-74.07694816589355,40.60821853973967],[-74.06630516052246,40.614213061359045],[-74.07626152038574,40.62815475956724],[-74.07540321350098,40.634668574229735],[-74.07711982727051,40.63759958351862],[-74.07626152038574,40.637925243274374],[-74.07557487487793,40.642288930730686],[-74.07317161560059,40.64378684722198]],"type":"LineString"},"properties":{"description":"","id":"marker-hs23quvua","stroke":"#000000","stroke-opacity":1,"stroke-width":8,"title":""},"type":"Feature"},{"geometry":{"coordinates":[[-74.07342910766602,40.64378684722198],[-74.01592254638672,40.70250471166452]],"type":"LineString"},"properties":{"description":"take a ferry back to manhattan","id":"marker-hs23r4clb","stroke":"#000000","stroke-opacity":1,"stroke-width":2,"title":"ferry"},"type":"Feature"}],"id":"tofferrosen.hc4kccfj","type":"FeatureCollection"};
      //  var geoJson = new L.geoJson(mapboxGeoJson);
       // this.map.addLayer(geoJson);
        //L.geoJson(mapboxGeoJson).addTo(this.map);
        // Remove the prepending leaflet link, as clicking will hijack the app!
        this.map.attributionControl.setPrefix(""); 
        this.map.addLayer(this.tileLayer);
        me.fireEvent('maprender', me, this.map);
    },

    // @private
    onGeoUpdate: function(geo) {
        if (geo) {
            this.setMapCenter(new L.LatLng(geo.getLatitude(), geo.getLongitude()));
        }
    },

    // @private
    onGeoError: Ext.emptyFn,

    /**
     * Moves the map center to the designated coordinates hash of the form:
     *
     *     { latitude: 39.290555, longitude: -76.609604 }
     *
     * or a L.LatLng object representing to the target location.
     *
     * @param {Object/L.LatLng} coordinates Object representing the desired Latitude and
     * longitude upon which to center the map.
     */
    setMapCenter: function(coordinates) {
        var me = this,
            map = me.getMap();

        if (map && coordinates) {
            if (!me.isPainted()) {
                me.un('painted', 'setMapCenter', this);
                me.on('painted', 'setMapCenter', this, { single: true, args: [coordinates] });
                return;
            }

            if (coordinates && !(coordinates instanceof L.LatLng) && 'longitude' in coordinates) {
                coordinates = new L.LatLng(coordinates.latitude, coordinates.longitude);
            }

            if (!map) {
                me.renderMap();
                map = me.getMap();
            }

            if (map && coordinates instanceof L.LatLng) {
                map.setView(ctr, this.zoomLevel);
            }
            else {
                this.options = Ext.apply(this.getMapOptions(), {
                    center: coordinates
                });
            }
        }
    },

    // @private
    onZoomChange : function() {
        var mapOptions = this.getMapOptions(),
            map = this.getMap(),
            zoom;

        zoom = (map && map.getZoom) ? map.getZoom() : mapOptions.zoom || 10;

        this.options = Ext.apply(mapOptions, {
            zoom: zoom
        });

        this.fireEvent('zoomchange', this, map, zoom);
    },

    // @private
    onCenterChange: function() {
        var mapOptions = this.getMapOptions(),
            map = this.getMap(),
            center;

        center = (map && map.getCenter) ? map.getCenter() : mapOptions.center;

        this.options = Ext.apply(mapOptions, {
            center: center
        });

        this.fireEvent('centerchange', this, map, center);

    },

    // @private
    destroy: function() {
        Ext.destroy(this.getGeo());
        this.callParent();
    }
});