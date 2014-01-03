package edu.rit.se.trafficanalysis;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;

public class TourConfig {
	//Begin Ian's Hardcoding time.
	public static final String HARDCODED_PUSH_ID = "APA91bHzBb_mrysg-EKvJkWp6GdjJj5XUMmy7zzho70AXLYNIzkrXhEnPHzn2shTza9sSg8Ylxp0C0a13ykMMJl77YUudFnJz9sDSeN05GttpaXG1nV68s5m1t3vZIqL57Wd7ZaIjmb1UYbuq48H-T5_hxYeZynrpHF3CFOPQcIw3pR7x-lciG8";
	//public static final String HARDCODED_RIDER_ID = "TcH4FR09ROSA4b42WJX6i55dAJN32K5ia1RXo0yEZHI\u003d\n";
	//End Ian's Hardcoding time.
	
	
	public static final String PREF_NAME = "TourConfig";

	/**
	 * Global tour values
	 */
	public static final String KEY_TOUR_ID = "TourId";
	public static final String KEY_TOUR_SERVER_URL = "ServerUrl";
	public static final String KEY_TOUR_GCM_SENDER_ID = "GcmSenderId";
	public static final String KEY_TOUR_START_TIME = "TourDate";
	public static final String KEY_TOUR_MAX_TIME = "MaxTourTime";
	public static final String KEY_TOUR_CANCELLED = "TourCancelled";

	/**
	 * Per rider values
	 */
	public static final String KEY_RIDER_ID = "RiderId";
	public static final String KEY_RIDER_GCM_PUSH_ID = "GcmPushId";
	public static final String KEY_RIDER_START_TIME = "RiderStartTime";
	public static final String KEY_RIDER_AUTO_TRACKING = "AutomaticTrakEnabled";

	/**
	 * Rider state values
	 */
	private static final String KEY_RIDER_CHANGE_TIMES = "NeedsTimeUpdate";
	private static final String KEY_RIDER_MESSAGE = "RiderMessages";
	private static final String KEY_RIDER_TRACK_ELAPSED_TIME = "ElaspedTrackTime";
	private static final String KEY_RIDER_TOUR_REMINDER_SHOWN = "TourReminderShown";

	private SharedPreferences mSharedPrefs;

	public TourConfig(Context context) {
		mSharedPrefs = context.getSharedPreferences(PREF_NAME,
				Activity.MODE_PRIVATE);
	}

	/**
	 * Is there a tour configured on the device?
	 * 
	 * @return
	 */
	public boolean isTourConfigured() {
		return mSharedPrefs.contains(KEY_TOUR_ID);
	}

	/**
	 * Has the rider registered with the server?
	 * 
	 * @return
	 */
	public boolean isRegistered() {
		return getRiderId() != null;
	}

	/**
	 * Has the tour already started?
	 * 
	 * @return
	 */
	public boolean isTourCancelled() {
		return mSharedPrefs.getBoolean(KEY_TOUR_CANCELLED, false);
	}

	/**
	 * Has the tour already started?
	 * 
	 * @return
	 */
	public boolean isTourStarted() {
		return System.currentTimeMillis() >= getTourStartTime();
	}

	/**
	 * Has the tour already ended?
	 * 
	 * @return
	 */
	public boolean isTourOver() {
		return System.currentTimeMillis() >= getTourFinishTime() || isTourCancelled();
	}

	/**
	 * Global Tour Values These are set as a group since they should never
	 * change individually.
	 */
	public boolean setNewTourConfig(TourConfigData tour) {
		Editor editor = mSharedPrefs.edit();
		boolean isCurrentTour = isTourConfigured() && getTourId().equals(tour.tour_id);
		if (isCurrentTour) {
			if (tour.is_cancelled) {
				editor.putBoolean(KEY_TOUR_CANCELLED, true);
			} else if (isRegistered() && isAutomaticTrackEnabled() && !isTourStarted() && (getTourStartTime() != tour.start_time)) {
				editor.putBoolean(KEY_RIDER_CHANGE_TIMES, true);
				editor.putLong(KEY_RIDER_START_TIME, tour.start_time);
				editor.putBoolean(KEY_RIDER_TOUR_REMINDER_SHOWN, false);
			}
		} else {
			// Read-only fields
			editor.clear();
			editor.putString(KEY_TOUR_ID, tour.tour_id);
			editor.putString(KEY_TOUR_SERVER_URL, tour.dcs_url);
			editor.putString(KEY_TOUR_GCM_SENDER_ID, tour.gcm_sender_id);
		}
		
		// We can't change these during the tour, but we can do it before/after.
		boolean allowTimeUpdate = !isTourConfigured() || !isCurrentTour || !isTourStarted() || isTourOver();
		if (allowTimeUpdate) {
			editor.putLong(KEY_TOUR_START_TIME, tour.start_time);
			editor.putLong(KEY_TOUR_MAX_TIME, tour.max_tour_time);
		}

		editor.commit();
		return true;
	}

	/**
	 * Clears the tour configuration.
	 */
	public void clearTourConfig() {
		mSharedPrefs.edit().clear().commit();
	}
	
	/**
	 * The unique identifier of the tour.
	 * 
	 * @return
	 */
	public String getTourId() {
		return mSharedPrefs.getString(KEY_TOUR_ID, "*");
	}
	
	/**
	 * The server containing the DCS. It should not contain the trailing slash.
	 * 
	 * @return
	 */
	public String getServerUrl() {
		return mSharedPrefs.getString(KEY_TOUR_SERVER_URL, null);
	}

	/**
	 * The GCM sender id from the google Developer API console. USed to identify
	 * what app is registering for push notifications.
	 * 
	 * @return
	 */
	public String getGcmSenderId() {
		return mSharedPrefs.getString(KEY_TOUR_GCM_SENDER_ID, null);
	}

	/**
	 * The official start time of the tour. This is the earliest possible time
	 * we want to start tracking. The value is in milliseconds, and ignores
	 * seconds.
	 * 
	 * @return
	 */
	public Long getTourStartTime() {
		return mSharedPrefs.getLong(KEY_TOUR_START_TIME, 0)
				- (mSharedPrefs.getLong(KEY_TOUR_START_TIME, 0) % 60000);
	}

	/**
	 * The longest that we want to track users in milliseconds, from the
	 * official start time.
	 * 
	 * @return
	 */
	public Long getTourMaxTime() {
		return mSharedPrefs.getLong(KEY_TOUR_MAX_TIME, 0);
	}

	/**
	 * The official tour end time in milliseconds. Tour Start time + Tour Max
	 * Time
	 * 
	 * @return
	 */
	public long getTourFinishTime() {
		return getTourStartTime() + getTourMaxTime();
	}

	/**
	 * The rider id provided by the DCS.
	 */
	public String getRiderId() {
		return mSharedPrefs.getString(KEY_RIDER_ID, null);
	}

	/**
	 * The rider's GCM push ID. This can be null if they were unable to register
	 * for an ID. This may happen if they do not have a Google account on a
	 * pre-Jellybean version of Android.
	 * 
	 * @return
	 */
	public String getGcmPushId() {
		return mSharedPrefs.getString(KEY_RIDER_GCM_PUSH_ID, null);
	}

	public void setRiderId(String riderId) {
		mSharedPrefs.edit().putString(KEY_RIDER_ID, riderId).commit();
	}

	public void setGcmPushId(String gcmId) {
		mSharedPrefs.edit().putString(KEY_RIDER_GCM_PUSH_ID, gcmId).commit();
	}

	/**
	 * Get the rider's start time.
	 * @return
	 */
	public long getRiderStartTime() {
		if (mSharedPrefs.contains(KEY_RIDER_START_TIME)) {
			return mSharedPrefs.getLong(KEY_RIDER_START_TIME, 0);
		}
		return getTourStartTime();
	}

	/**
	 * Set the rider's start time.
	 * @param time
	 */
	public void setRiderStartTime(long time) {
		mSharedPrefs.edit().putLong(KEY_RIDER_START_TIME, time).commit();
	}

	/**
	 * Have we reminded the user of the race yet.
	 * @return
	 */
	public boolean isTourReminderShown() {
		return mSharedPrefs.getBoolean(KEY_RIDER_TOUR_REMINDER_SHOWN, false);
	}

	/**
	 * Set that we have reminded the user of the race.
	 */
	public void setTourReminderShown() {
		mSharedPrefs.edit().putBoolean(KEY_RIDER_TOUR_REMINDER_SHOWN, true)
				.commit();
	}

	/**
	 * Returns whether the tracking will start automatically.
	 * @return
	 */
	public boolean isAutomaticTrackEnabled() {
		return mSharedPrefs.getBoolean(KEY_RIDER_AUTO_TRACKING, true);
	}

	/**
	 * Sets whether the tracking will start automatically.
	 * @param value
	 */
	public void setAutomaticTrackEnabled(boolean value) {
		mSharedPrefs.edit().putBoolean(KEY_RIDER_AUTO_TRACKING, value).commit();
	}

	/**
	 * Adds time to the total tracking time.
	 * @param time Number of ms the user tracked for.
	 */
	public void addTotalTrackTime(long time) {
		mSharedPrefs
				.edit()
				.putLong(KEY_RIDER_TRACK_ELAPSED_TIME,
						getTotalTrackTime() + time).commit();
	}

	public Long getTotalTrackTime() {
		return mSharedPrefs.getLong(KEY_RIDER_TRACK_ELAPSED_TIME, 0);
	}

	/**
	 * Sets the latest message/alert received from the server.
	 * 
	 * @param message
	 *            the message.
	 */
	public void setLatestRiderMessage(String message) {
		mSharedPrefs.edit().putString(KEY_RIDER_MESSAGE, message).commit();
	}

	/**
	 * Gets the latest message/alert received from the server.
	 */
	public String getLatestRiderMessage() {
		return mSharedPrefs.getString(KEY_RIDER_MESSAGE, null);
	}

	/**
	 * Returns whether the rider needs to update the tour registration times.
	 */
	public boolean needsUpdatedTimes() {
		return mSharedPrefs.getBoolean(KEY_RIDER_CHANGE_TIMES, false) && isAutomaticTrackEnabled() && !isTourOver();
	}

	/**
	 * Sets that the user has updated their times.
	 */
	public void clearNeedsUpdatedTimes() {
		mSharedPrefs.edit().remove(KEY_RIDER_CHANGE_TIMES).commit();
	}

	/**
	 * Clears all rider specific values.
	 */
	public void clearRiderConfig() {
		mSharedPrefs.edit().remove(KEY_RIDER_ID).remove(KEY_RIDER_GCM_PUSH_ID)
				.remove(KEY_RIDER_START_TIME).remove(KEY_RIDER_AUTO_TRACKING)
				.remove(KEY_RIDER_CHANGE_TIMES).remove(KEY_RIDER_MESSAGE)
				.remove(KEY_RIDER_TRACK_ELAPSED_TIME)
				.remove(KEY_RIDER_TOUR_REMINDER_SHOWN).commit();
	}
	
	
	/**
	 * Tour Config
	 */
	public static class TourConfigData {
		public String tour_id;
		public String dcs_url;
		public String gcm_sender_id;
		public long start_time;
		public long max_tour_time;
		public double loc_latitude;
		public double loc_longitude;
		public double loc_radius;
		public boolean is_cancelled;
	}
}
