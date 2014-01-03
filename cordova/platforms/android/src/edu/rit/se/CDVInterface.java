package edu.rit.se;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import org.apache.cordova.*;

import android.location.LocationListener;
import android.location.LocationManager;
import android.util.Log;
import edu.rit.se.trafficanalysis.TourConfig;
import edu.rit.se.trafficanalysis.TourConfig.TourConfigData;
import edu.rit.se.trafficanalysis.tracking.LocationReceiver;
import edu.rit.se.trafficanalysis.tracking.StateBroadcaster;
import edu.rit.se.trafficanalysis.tracking.TrackingService;
import edu.rit.se.trafficanalysis.util.GCMHelper;

/**
 * CDVInterface
 * This is the Tour-Trak Android Java Cordova Plugin Native Interface. 
 * 
 * Implements the native method available to be called by the cordova 
 * interface as exposed by the CDVInterface.js under assets/js.
 * 
 * This plugin acts as a location transmitter in the background of the device,
 * sending location updates of the rider as he or she rides through 
 * the tour to the Data Collection Server. 
 * 
 * @author Christoffer Rosen (cbr4830@rit.edu)
 * @author Ian Graves 
 * 
 * @TODO Push notifications
 */

public class CDVInterface extends CordovaPlugin {

	private final static String TAG = CDVInterface.class.getSimpleName(); 
    private final static String DCS_URL = "http://devcycle.se.rit.edu/";
	
	private boolean locationInit = false;				/* checks if it has already started tracking previously */
	private LocationListener locationListener = null;	/* location listener */
	private TrackingService trackingService = null;		/* tracking service */
	private LocationReceiver locReceiver = null;		/* the location receiver */
	private StateBroadcaster stateCaster= null;		 	/* state caster */
	LocationManager locationManager;					/* Acquire a reference to the system location manager */

	/**
	 * JavaScript will fire off a plugin request to the native side (HERE) and 
	 * will be passed to this method. Here we check for the action aka method to call
	 * 
	 * This does not run on the UI Thread but on the WebCore thread.
	 * @param action		Action to take (i.e., start, pauseTracking, resumeTracking)
	 */
	@Override
	public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {

		 if (action.equals("start")) {
			
			JSONObject msgObj = args.getJSONObject(0);
			Log.d("JSON: ", msgObj.toString());
			String dcsUrl = msgObj.getString("dcsUrl");
			int startTime = msgObj.getInt("startTime");
			int endTime = msgObj.getInt("endTime");
			String tourId = msgObj.getString("tourId");
			String riderId = msgObj.getString("riderId");
			
			this.start(dcsUrl, startTime, endTime, tourId, riderId, callbackContext);
		} else if (action.equals("pauseTracking")) {
			this.pauseTracking(callbackContext);
		} else if (action.equals("resumeTracking")) {
			this.resumeTracking(callbackContext);
		}
		return false;
	}
	
	/**
	 * Will setup the tour configuration and automatically start
	 * tracking the rider at the start time and stop time of the 
	 * tour. 
	 * 
	 * TODO - get the parameters for DCS URL, etc!
	 * @param dcsUrl				Url to the Data Collection Server
	 * @param startTime				Unix time of the tour start time
	 * @param endTime				Unix time of the tour end time
	 * @param tourId				The tour identification number
	 * @param riderId				The rider's unique identification number.
	 * @param callbackContext		The callback context (called on the JS side).
	 */
	private void start(String dcsUrl, long startTime, long endTime, String tourId, 
			String riderId, CallbackContext callbackContext){
		
		Log.d(TAG, "DCS URL: " + dcsUrl);
		Log.d(TAG, "START TIME: " + startTime);
		Log.d(TAG, "END TIME: " + endTime);
		Log.d(TAG, "TOUR ID: " + tourId);
		Log.d(TAG, "RIDER ID: " + riderId);
		
		if(!locationInit){
			
			/* Setup the tour configuration */
			TourConfig cfg = new TourConfig(this.cordova.getActivity().getApplicationContext());
			setupTourConfiguration(cfg, dcsUrl, startTime, endTime, tourId);
			cfg.setRiderId(riderId);
			
			trackingService = new TrackingService();
			stateCaster = new StateBroadcaster(this.cordova.getActivity().getApplicationContext());
			locReceiver = new LocationReceiver();
			
			GCMHelper.registerPush(this.cordova.getActivity().getApplicationContext());
			TrackingService.startTracking(this.cordova.getActivity().getApplicationContext());
			locationInit = true;
		}
		callbackContext.success();
	}
	
	/** 
	 * Set up the tour configuration
	 * 
	 * @param cfg			The Tour Configuration Object
	 * @param dcsUrl		Url to the data collection server
	 * @param startTime		The start time of the tour (IN UNIX TIME)
	 * @param endTime		The end time of the tour (IN UNIX TIME)
	 * @param tourId		The tour identification number.
	 */
	private void setupTourConfiguration(TourConfig cfg, String dcsUrl, long startTime, long endTime, String tourId) {
		
		if (!cfg.isTourConfigured()) {
			TourConfigData tour = new TourConfigData();

			tour.tour_id = tourId;
			tour.dcs_url = dcsUrl;
			
			/* The tour configuration expects time in form of MS since epoch */
			tour.start_time = startTime * 1000; // unix timestamp are in seconds, convert to ms
			tour.max_tour_time = endTime * 1000; // unix timestamp are in seconds, convert to ms
			
			//tour.gcm_sender_id = res.getString(R.string.defaultConfigGcmSenderId);
			cfg.setNewTourConfig(tour);
		}
		
	}
	
	/**
	 * Pause tracking the rider
	 * @param callbackContext		The callback context (JS side).
	 */
	private void pauseTracking(CallbackContext callbackContext){
		Log.d(TAG, "PAUSE TRACKING");
		if (TrackingService.isTracking()){
			TrackingService.pauseTracking(this.cordova.getActivity().getApplicationContext());
		}
		callbackContext.success();
	}
	
	/**
	 * Resume tracking the rider
	 * @param callbackContext		The callback context (JS side).
	 */
	private void resumeTracking(CallbackContext callbackContext){
		Log.d(TAG, "RESUME TRACKING");
		if (!TrackingService.isTracking()){
			TrackingService.startTracking(this.cordova.getActivity().getApplicationContext());
		}
		callbackContext.success();
	}
}
