/*global L: true */

/***
* Plugin by shramov
* http://psha.org.ru/b/leaflet-plugins.html
*
* Modifications to work w/ Sencha and custom parsing
* of KML files by @tofferrosen
*
* 2014 Modification to add markerType to layers since each marker
* is it's own unique layer that is added to a markerCluster
* usage: layer.options.markerType (which will be a String) by @eklundjoshua
***/

L.KML = L.FeatureGroup.extend({

	options: {
		async: true
	},

	initialize: function(kml, options) {
		L.Util.setOptions(this, options);
		this._kml = kml;
		this._layers = {};
		this._markers = [];
		this.loaded= false;

		if (kml) {
			this.addKML(kml, options, this.options.async);
		}
	},

	isLoaded: function() {
		return this.loaded;
	},

	loadXML: function(url, cb, options, async) {
		if (async == undefined) async = this.options.async;
		if (options == undefined) options = this.options;

		// Load in the KML file
		Ext.Ajax.request({
	        url : url ,
	        method: 'GET',
	        success: function ( result, request )
	        {

							var responseXML = result.responseXML;

							// Android doesn't support this, so use the DOMParser
							if(result.responseXML == null) {
								 responseXML = (new DOMParser()).parseFromString(result.responseText, "text/xml");
							}

							cb(responseXML, options)
	        }
	    });
	},

	addKML: function(url, options, async) {
		var _this = this;
		var cb = function(gpx, options) { _this._addKML(gpx, options) };
		this.loadXML(url, cb, options, async);
	},

	_addKML: function(xml, options) {
		var layers = L.KML.parseKML(xml);

		if (!layers || !layers.length) return;
		for (var i = 0; i < layers.length; i++)
		{
			this.fire('addlayer', {
				layer: layers[i]
			});
			this.addLayer(layers[i]);
		}
		this.latLngs = L.KML.getLatLngs(xml);
		this.fire("loaded");
		this.loaded = true;
	},

	latLngs: []
});

L.Util.extend(L.KML, {

	parseKML: function (xml) {
		var style = this.parseStyle(xml);
		this.parseStyleMap(xml, style);
		var el = xml.getElementsByTagName("Folder");
		var layers = [], l;

		for (var i = 0; i < el.length; i++) {
			if (!this._check_folder(el[i])) { continue; }
			l = this.parseFolder(el[i], style);
			if (l) { layers.push(l); }
		}
		el = xml.getElementsByTagName('Placemark');
		console.log("Number of Placemarks: " + el.length);
		var counter = 0;
		for (var j = 0; j < el.length; j++) {
			if (!this._check_folder(el[j])) { continue; }
			var parsedLayers = this.parsePlacemark(el[j], xml, style)
			for (layer in parsedLayers) {
				layers.push(parsedLayers[layer]);
			}
		}
		return layers;
	},

	// Return false if e's first parent Folder is not [folder]
	// - returns true if no parent Folders
	_check_folder: function (e, folder) {
		e = e.parentElement;
		while (e && e.tagName !== "Folder")
		{
			e = e.parentElement;
		}
		return !e || e === folder;
	},

	parseStyle: function (xml) {
		var style = {};
		var sl = xml.getElementsByTagName("Style");

		//for (var i = 0; i < sl.length; i++) {
		var attributes = {color: true, width: true, Icon: true, href: true,
						  hotSpot: true};

		function _parse(xml) {
			var options = {};
			for (var i = 0; i < xml.childNodes.length; i++) {
				var e = xml.childNodes[i];
				var key = e.tagName;
				if (!attributes[key]) { continue; }
				if (key === 'hotSpot')
				{
					for (var j = 0; j < e.attributes.length; j++) {
						options[e.attributes[j].name] = e.attributes[j].nodeValue;
					}
				} else {
					var value = e.childNodes[0].nodeValue;
					if (key === 'color') {
						options.opacity = parseInt(value.substring(0, 2), 16) / 255.0;
						options.color = "#" + value.substring(6, 8) + value.substring(4, 6) + value.substring(2, 4);
					} else if (key === 'width') {
						options.weight = value;
					} else if (key === 'Icon') {
						ioptions = _parse(e);
						if (ioptions.href) { options.href = ioptions.href; }
					} else if (key === 'href') {
						options.href = value;
					}
				}
			}
			return options;
		}

		for (var i = 0; i < sl.length; i++) {
			var e = sl[i], el;
			var options = {}, poptions = {}, ioptions = {};
			el = e.getElementsByTagName("LineStyle");
			if (el && el[0]) { options = _parse(el[0]); }
			el = e.getElementsByTagName("PolyStyle");
			if (el && el[0]) { poptions = _parse(el[0]); }
			if (poptions.color) { options.fillColor = poptions.color; }
			if (poptions.opacity) { options.fillOpacity = poptions.opacity; }
			el = e.getElementsByTagName("IconStyle");
			if (el && el[0]) { ioptions = _parse(el[0]); }
			if (ioptions.href) {
				// save anchor info until the image is loaded
				options.icon = new L.KMLIcon({
					iconUrl: ioptions.href,
					shadowUrl: null,
					iconAnchorRef: {x: ioptions.x, y: ioptions.y},
					iconAnchorType:	{x: ioptions.xunits, y: ioptions.yunits}
				});
			}
			style['#' + e.getAttribute('id')] = options;
		}
		return style;
	},

	parseStyleMap: function (xml, existingStyles) {
		var sl = xml.getElementsByTagName("StyleMap");

		for (var i = 0; i < sl.length; i++) {
			var e = sl[i], el;
			var smKey, smStyleUrl;

			el = e.getElementsByTagName("key");
			if (el && el[0]) { smKey = el[0].textContent; }
			el = e.getElementsByTagName("styleUrl");
			if (el && el[0]) { smStyleUrl = el[0].textContent; }

			if (smKey=='normal')
			{
				existingStyles['#' + e.getAttribute('id')] = existingStyles[smStyleUrl];
			}
		}

		return;
	},

	parseFolder: function (xml, style) {
		var el, layers = [], l;
		el = xml.getElementsByTagName('Folder');
		for (var i = 0; i < el.length; i++) {
			if (!this._check_folder(el[i], xml)) { continue; }
			l = this.parseFolder(el[i], style);
			if (l) { layers.push(l); }
		}
		el = xml.getElementsByTagName('Placemark');
		for (var j = 0; j < el.length; j++) {
			if (!this._check_folder(el[j], xml)) { continue; }
			var parsedLayers = this.parsePlacemark(el[j], xml, style);
			for (layer in parsedLayers) {
				layers.push(parsedLayers[layer]);
			}
		}
		if (!layers.length) { return; }
		if (layers.length === 1) { return layers[0]; }
		return new L.FeatureGroup(layers);
		//return layers;
	},


	/*
	given an area tag, returns the custom marker using awesome markers and the appropriate icon.
	look at the map marker icon area tags documentation.

	for areas not found, simply places a plain blue marker.
	*/
	createCustomMarker: function(area) {

		area = area.toLowerCase(); // change so that the casing doesn't matter


		if (area == "medical") {
			return L.AwesomeMarkers.icon({
					icon: 'medkit',
					markerColor: 'red',
					prefix: 'fa'
			});
		}

		else if (area == "food") {
			return L.AwesomeMarkers.icon({
					icon: 'cutlery',
					markerColor: 'blue',
					prefix: 'fa'
			});
		}

		else if (area == "music") {
			return L.AwesomeMarkers.icon({
					icon: 'music',
					markerColor: 'cadetblue',
					prefix: 'fa'
			});
		}

		else if (area == "sagtruck") {
			return L.AwesomeMarkers.icon({
				icon: 'truck',
				markerColor: 'red',
				prefix: 'fa'
			});
		}

		else if (area == "warning") {
			return L.AwesomeMarkers.icon({
				icon: 'warning',
				markerColor: 'red',
				prefix: 'fa'
			});
		}

		else if (area == "mechanics") {
			return L.AwesomeMarkers.icon({
				icon: 'wrench',
				markerColor: 'orange',
				prefix: 'fa'
			});
		}

		else if (area == 'bathrooms') {
			return L.AwesomeMarkers.icon({
				icon: 'service',
				prefix: 'flaticon',
				markerColor: 'blue'
			});
		}

		else if (area == 'rest_area') {
			return L.AwesomeMarkers.icon({
				icon: 'rest',
				prefix: 'flaticon',
				markerColor: 'green'
			});
		}

		else if (area == 'rendesvous_spot') {
			return L.AwesomeMarkers.icon({
				icon: 'man41',
				prefix: 'flaticon',
				markerColor: 'orange'
			});
		}

		else if (area == 'Rendezvous_spot'){
			return L.AwesomeMarkers.icon({
				icon: 'man41',
				prefix: 'flaticon',
				markerColor: 'orange'
			});
		}

		else if (area == 'lost_child') {
			return L.AwesomeMarkers.icon({
				icon: 'standing25',
				prefix: 'flaticon',
				markerColor: 'red'
			});
		}

		else if (area == 'subway') {
			return L.AwesomeMarkers.icon({
				icon: 'train5',
				prefix: 'flaticon',
				markerColor: 'cardetblue'
			});
		}

		else if (area == 'timed_ride') {
			return L.AwesomeMarkers.icon({
				icon: 'finish1',
				prefix: 'flaticon',
				markerColor: 'green'
			});
		}

		else if (area == 'vest') {
			return L.AwesomeMarkers.icon({
				icon: 'vest',
				prefix: 'bikeny',
				markerColor: 'orange'
			});
		}

		else if (area == 'trash') {
			return L.AwesomeMarkers.icon({
				icon: 'trash',
				prefix: 'bikeny',
				markerColor: 'green'
			});
		}

		else if (area == 'picture') {
			return L.AwesomeMarkers.icon({
				icon: 'picture',
				prefix: 'bikeny',
				markerColor: 'purple'
			});
		}

		else if (area == 'award') {
			return L.AwesomeMarkers.icon({
				icon: 'victory',
				markerColor: 'blue',
				prefix: 'bikeny'
			});
		}

		else if (area == 'ferry') {
			return L.AwesomeMarkers.icon({
				icon: 'ferry',
				markerColor: 'cadetblue',
				prefix: 'bikeny'
			});
		}

		else if (area == 'car') {
			return L.AwesomeMarkers.icon({
				icon: 'car',
				markerColor: 'blue',
				prefix: 'bikeny'
			});
		}

		else if (area == 'food2') {
			return L.AwesomeMarkers.icon({
				icon: 'food',
				markerColor: 'blue',
				prefix: 'bikeny'
			});
		}

		else if (area == 'tshirt') {
			return L.AwesomeMarkers.icon({
				icon: 'tshirt',
				markerColor: 'orange',
				prefix: 'bikeny'
			});
		}

		else if (area == 'mechanics2') {
			return L.AwesomeMarkers.icon({
				icon: 'mechanic',
				markerColor: 'orange',
				prefix: 'bikeny'
			});
		}

		else if (area == 'mechanic2') {
			return L.AwesomeMarkers.icon({
				icon: 'mechanic',
				markerColor: 'orange',
				prefix: 'bikeny'
			});
		}

		else if (area == 'ribbon') {
			return L.AwesomeMarkers.icon({
				icon: 'ribbon',
				markerColor: 'blue',
				prefix: 'bikeny'
			});
		}

		else if (area == 'recycle') {
			return L.AwesomeMarkers.icon({
				icon: 'recycle',
				markerColor: 'green',
				prefix: 'bikeny'
			});
		}

		else if (area == 'tshirt2') {
			return L.AwesomeMarkers.icon({
				icon: 'tshirt2',
				markerColor: 'orange',
				prefix: 'bikeny'
			});
		}

		else if (area == 'search') {
			return L.AwesomeMarkers.icon({
				icon: 'search',
				markerColor: 'orange',
				prefix: 'bikeny'
			});
		}

		else if (area == 'license') {
			return L.AwesomeMarkers.icon({
				icon: 'license',
				markerColor: 'green',
				prefix: 'bikeny'
			});
		}

		else if (area == 'info-tent') {
			return L.AwesomeMarkers.icon({
				icon: 'info4',
				markerColor: 'green',
				prefix: 'flaticon'
			});
		}

		else if (area == 'info_tent') {
			return L.AwesomeMarkers.icon({
				icon: 'info-tent',
				markerColor: 'green',
				prefix: 'bikeny'
			});
		}

		else if (area == 'helmet') {
			return L.AwesomeMarkers.icon({
				icon: 'helmet',
				markerColor: 'orange',
				prefix: 'bikeny'
			});
		}

		else if (area == 'train2') {
			return L.AwesomeMarkers.icon({
				icon: 'train',
				markerColor: 'cadetblue',
				prefix: 'bikeny'
			});
		}

		// Area not found...

		else {

			return L.AwesomeMarkers.icon({
				markerColor: 'blue'
			});
		}


	},

	/**
	 * Goes through a placemark kml element and generates a leaflet marker, based
	 *		based on how many areas each placemark has
	 *
	 * @param {kml Element} place A placemark kml element
	 * @param {xml} xml Xml data related to the placemark
   * @param {path} style Style options for the placemark
	 * @return {layer[]} layerArray An array of layers that contain leaflet
	 * 		markers
	 */
	parsePlacemark: function (place, xml, style) {
		var layerArray = [];
		var areas = this.parseExtendedData(place);

	 	for (area in areas) {
			var options = this.getOptions(place, style)
			var layer = this.initializeLayer(place, options, xml);
			var name = this.parseName(place);
			var description = this.parseDescription(place);

			if (layer) {
				layer.bindPopup("<h1>" + name + "</h1><b1>" + description + "</b1>", {offset: new L.Point(0,-20)});
				layer.options.icon = this.createCustomMarker(areas[area]);
				layer.options.markerType = areas[area].toLowerCase();
				layerArray.push(layer);
			}
		}

		return layerArray;
	},

	/**
	 * Reads the values for the data inside an Extended Data kml tag
	 *
	 * @param {kml Element} place A placemark XML element
	 * @return {string[]} dataValueStrings An array of the strings of values
	 */
	parseExtendedData: function (place) {
		var dataValueStrings = [];
		var data = place.getElementsByTagName('Data');
		var dataValues = data[0].children;
		for (i = 0; i < dataValues.length; i++) {
			var dataValueString = dataValues[i].textContent;
			dataValueStrings.push(dataValueString);
		}
		return dataValueStrings;
	},

	/**
	 * Reads the description element for a placemark KML element
	 *
	 * @param {xml Element} place A placemark XML element
	 * @return {string} description The string of the description value
	 */
	parseDescription: function (place) {
		var description = "";
		var el = place.getElementsByTagName('description');
		for (i = 0; i < el.length; i++) {
			for (j = 0; j < el[i].childNodes.length; j++) {
						description = description + el[i].childNodes[j].nodeValue;
			}
		}
		return description;
	},

	/**
	 * Reads the name element for a placemark KML element
	 *
	 * @param {xml Element} place A placemark XML element
	 * @return {string} name The string of the name value
	 */
	parseName: function (place) {
		var name = "";
		var el = place.getElementsByTagName('name');
		if (el.length && el[0].childNodes.length) {
			name = el[0].childNodes[0].nodeValue;
		}
		return name;
	},

	parseCoords: function (xml) {
		var el = xml.getElementsByTagName('coordinates');
		return this._read_coords(el[0]);
	},

	parseLineString: function (line, xml, options) {
		var coords = this.parseCoords(line);
		options.opacity = 1; // set so that the line is completely solid as in mapbox.
		options.weight = 6; // set width to be a bit bigger
		options.color = "#0099CC";
		if (!coords.length) { return; }
		return new L.Polyline(coords, options);
	},

	parsePoint: function (line, xml, options) {

		var el = line.getElementsByTagName('coordinates');

		if (!el.length) {
			return;
		}
		var ll = el[0].childNodes[0].nodeValue.split(',');

		return new L.KMLMarker(new L.LatLng(ll[1], ll[0]), options);
	},

	parsePolygon: function (line, xml, options) {
		var el, polys = [], inner = [], i, coords;
		el = line.getElementsByTagName('outerBoundaryIs');
		for (i = 0; i < el.length; i++) {
			coords = this.parseCoords(el[i]);
			if (coords) {
				polys.push(coords);
			}
		}
		el = line.getElementsByTagName('innerBoundaryIs');
		for (i = 0; i < el.length; i++) {
			coords = this.parseCoords(el[i]);
			if (coords) {
				inner.push(coords);
			}
		}
		if (!polys.length) {
			return;
		}
		if (options.fillColor) {
			options.fill = true;
		}
		if (polys.length === 1) {
			return new L.Polygon(polys.concat(inner), options);
		}
		return new L.MultiPolygon(polys, options);
	},

	getLatLngs: function (xml) {
		var el = xml.getElementsByTagName('coordinates');
		var coords = [];
		for (var j = 0; j < el.length; j++) {
			// text might span many childNodes
			coords = coords.concat(this._read_coords(el[j]));
		}
		return coords;
	},


	/**
	 * Gets the style options for the placemarks leaflet marker
	 *
	 * @param {xml Element} place A placemark XML element
	 * @param {path} style Style options for the placemark
	 * @return {path[]} options The style options for the placemark
	 */
	getOptions: function (place, style) {
		var i, j, el, options = {};
		el = place.getElementsByTagName('styleUrl');

		for (i = 0; i < el.length; i++) {
			var url = el[i].childNodes[0].nodeValue;
			for (var a in style[url])
			{
				options[a] = style[url][a];
			}
		}

		return options;
	},

	/**
	 * Creates a base layergroup element for the placemarks leaflet icon
	 *
	 * @param {xml Element} place A placemark XML element
	 * @param {path[]} options The style options for the placemark
	 * @param {xml} xml Xml data related to the placemark
	 * @return {FeatureGroup} layer Basic location and style data pertaining to
	 * 		the placemark
	 */
	initializeLayer: function (place, options, xml) {
		var layers = [];
		var parse = ['LineString', 'Polygon', 'Point'];
		for (j in parse) {
			var tag = parse[j];
			el = place.getElementsByTagName(tag);

			for (i = 0; i < el.length; i++) {
				var l = this["parse" + tag](el[i], xml, options);
				if (l) { layers.push(l); }
			}
		}

		if (!layers.length) {
			return null;
		}
		var layer = layers[0];
		if (layers.length > 1) {
			layer = new L.FeatureGroup(layers);
		}

		return layer;
	},

	_read_coords: function (el) {
		var text = "", coords = [], i;
		for (i = 0; i < el.childNodes.length; i++) {
			text = text + el.childNodes[i].nodeValue;
		}
		text = text.split(/[\s\n]+/);
		for (i = 0; i < text.length; i++) {
			var ll = text[i].split(',');
			if (ll.length < 2) {
				continue;
			}
			coords.push(new L.LatLng(ll[1], ll[0]));
		}
		return coords;
	}

});

L.KMLIcon = L.Icon.extend({

	createIcon: function () {
		var img = this._createIcon('icon');
		img.onload = function () {
			var i = img;
			this.style.width = i.width + 'px';
			this.style.height = i.height + 'px';

			if (this.anchorType.x === 'UNITS_FRACTION' || this.anchorType.x === 'fraction') {
				img.style.marginLeft = (-this.anchor.x * i.width) + 'px';
			}
			if (this.anchorType.y === 'UNITS_FRACTION' || this.anchorType.x === 'fraction') {
				img.style.marginTop  = (-(1 - this.anchor.y) * i.height) + 'px';
			}
			this.style.display = "";
		};
		return img;
	},

	_setIconStyles: function (img, name) {
		L.Icon.prototype._setIconStyles.apply(this, [img, name])
		// save anchor information to the image
		img.anchor = this.options.iconAnchorRef;
		img.anchorType = this.options.iconAnchorType;
	}
});


L.KMLMarker = L.Marker.extend({
	options: {
		icon: new L.KMLIcon.Default(),
		/*
		* Marker type for each marker is a string
		* which can be found in the [AREA] tags
		* in the data.kml file
		*/
		markerType: String
	}
});
