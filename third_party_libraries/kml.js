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
*
* 2015-2016 Modifications to allow support for multiple AREA tags for a
* point of interest and refactoring of the previous teams work.
* by @cshapleigh and @bbesmanoff
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
			layers = this.populateLayers(layers, el[j], xml, style);
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
			layers = this.populateLayers(layers, el[j], xml, style);
		}
		if (!layers.length) { return; }
		if (layers.length === 1) { return layers[0]; }
		return new L.FeatureGroup(layers);
		//return layers;
	},

	/**
	 * Pushes newly created placemark layers into a layer array
	 *
	 * @param {layer[]} layers An array of FeatureGroup objects
	 * @param {xml Element} element The Placemark to parse
	 * @param {xml} xml Xml data related to the placemark
   	 * @param {path} style Style options for the placemark
 	 * @return {layer[]} layers Updated array of FeatureGroup objects
	 */
	populateLayers: function (layers, element, xml, style) {
		var parsedLayers = this.parsePlacemark(element, xml, style);
		for (layer in parsedLayers) {
			layers.push(parsedLayers[layer]);
		}
		return layers;
	},


	/*
	given an area tag, returns the custom marker using awesome markers and the appropriate icon.
	look at the map marker icon area tags documentation.

	for areas not found, simply places a plain blue marker.
	*/
	createCustomMarker: function(area) {
		var areas = window.areaMapping;
		area = area.toLowerCase(); // change so that the casing doesn't matter
		
	 	return areas[area] ? areas[area]() : areas['DEFAULT']();
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
			name = this.sanitizeHtml(name);
			var description = this.parseDescription(place);
			description = this.sanitizeHtml(description);

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
			for (var a in style[url]) {
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
				switch(tag) {
					case 'LineString':
  					var layer = this.parseLineString(el[i], xml, options);
    					if (l) { layers.push(l); }
    					break;
     				case 'Polygon':
					var l = this.parsePolygon(el[i], xml, options);
					if (l) { layers.push(l); }
					break;
         			case 'Point':
					var l = this.parsePoint(el[i], xml, options);
					if (l) { layers.push(l); }
					break;
				}
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


		/**
		 * Replaces open/close tags with safe strings
		 * @param {string} String to sanitize
		 * @return {string} Sanitized string
		 */
		 sanitizeHtml: function (string) {
			 var string = string.replace(/</g, "&lt;");
			 var string = string.replace(/>/g, "&gt;");
			 return string;
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
