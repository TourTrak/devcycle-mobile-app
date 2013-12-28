package edu.rit.se.trafficanalysis.api;

import java.util.List;
import java.util.Locale;

import android.location.Location;

/**
 * JSON messages used for communicating with the DCS.
 */
public class Messages {
	
	/**
	 * Rider registration.
	 */
	@SuppressWarnings("unused")
	public static class RegisterRiderRequest {
		private String os;
		private String device;
		private String tour_id;
		
		public RegisterRiderRequest(String os, String device, String tour_id) {
			this.os = os;
			this.device = device;
			this.tour_id = tour_id;
		}
	}
	
	public static class RegisterRiderResponse {
		private String rider_id;
		
		public RegisterRiderResponse(String rider_id) {
			this.rider_id = rider_id;
		}
		
		public String getRiderId() {
			return rider_id;
		}
	}
	
	/**
	 * Push ID registration
	 */
	public static class RegisterPushIdRequest {
		@SuppressWarnings("unused")
		private String rider_id;
		@SuppressWarnings("unused")
		private String push_id;
		public RegisterPushIdRequest(String rider_id, String push_id) {
			this.rider_id = rider_id;
			this.push_id = push_id;
		}
	}
	
	/**
	 * Location updates
	 */
	public static class LocationUpdate {
		public long time;
		public double latitude;
		public double longitude;
		public Float accuracy;
		public Float speed;
		public Float bearing;
		public String provider;
		public Float battery;
		
		public LocationUpdate() {
		}
		
		public LocationUpdate(Location location, Float batteryLife) {
			this.time = location.getTime();
			this.latitude = location.getLatitude();
			this.longitude = location.getLongitude();
			if (location.hasAccuracy()) {
				this.accuracy = location.getAccuracy();
			}
			if (location.hasSpeed()) {
				this.speed = location.getSpeed();
			}
			if (location.hasBearing()) {
				this.bearing = location.getBearing();
			}
			this.provider = location.getProvider().toUpperCase(Locale.US);
			this.battery = batteryLife;
		}
	}
	
	/**
	 * The request sent to the DCS server
	 * that contains location updates
	 */
	public static class LocationUpdateRequest {
		private String tour_id;
		@SuppressWarnings("unused")
		private String rider_id;
		@SuppressWarnings("unused")
		private List<LocationUpdate> locations;
		
		public LocationUpdateRequest(List<LocationUpdate> locDeliverQueue, String rider_id, String tour_id) {
			this.locations = locDeliverQueue;
			this.rider_id = rider_id;
			this.tour_id = tour_id;
		}
	}
	
	/**
	 * The response from the DCS server after
	 * sending location updates that includes
	 * the current number of riders still participating
	 * in tour.
	 */
	public static class LocationUpdateResponse {
		private int rider_count;
		
		public LocationUpdateResponse(int rider_count) {
			this.rider_count = rider_count;
		}
		
		public int getRiderCount() {
			return rider_count;
		}
	}

}
