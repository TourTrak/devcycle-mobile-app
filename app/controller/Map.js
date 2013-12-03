Ext.define('DevCycleMobile.controller.Map', {
	extend: 'Ext.app.Controller',
	
	config: {
		refs: {
			map: "leafletMap",
		},

		control : {
			map: {
				update: 'update'
			}
		}
	},

	update: function(){
		alert("In update");
		window.currPosMarker = null;
		setInterval( function() {
			var getCurrentPos = function(position) {
					if(this.currPosMarker === null){

				 		var personIcon = L.AwesomeMarkers.icon({
							icon: 'user',
							color: 'dark red'
						});

						window.currPosMarker = L.marker([position.coords.latitude, 
														 position.coords.longitude]);
						window.currPosMarker.addTo(window.map);
					} else {
						var currPos = new L.LatLng(position.coords.latitude, position.coords.longitude);
						window.currPosMarker.setLatLng(currPos);
						window.map.panTo(currPos);
					}
			}

			var failBoat = function(e){
				alert("fail" + e.message);
			}

			navigator.geolocation.getCurrentPosition(getCurrentPos,
				failBoat, {timeout: 15000});
				
			},1500); // every 1.5 seconds
	}

});