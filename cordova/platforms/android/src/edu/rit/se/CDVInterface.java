package edu.rit.se;

//import org.apache.cordova.CordovaPlugin;
//import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import org.apache.cordova.*;

import android.content.res.Resources;
import android.location.LocationListener;
import android.location.LocationManager;
import android.util.Log;

import edu.rit.se.tourtrak.BuildConfig; 
import edu.rit.se.tourtrak.R;

import edu.rit.se.trafficanalysis.TourConfig;
import edu.rit.se.trafficanalysis.TourConfig.TourConfigData;
import edu.rit.se.trafficanalysis.api.ApiClient;
import edu.rit.se.trafficanalysis.api.DcsException;
import edu.rit.se.trafficanalysis.api.Messages;
import edu.rit.se.trafficanalysis.api.Messages.RegisterRiderResponse;
import edu.rit.se.trafficanalysis.tracking.LocationReceiver;
import edu.rit.se.trafficanalysis.tracking.StateBroadcaster;
import edu.rit.se.trafficanalysis.tracking.TrackingService;
import edu.rit.se.trafficanalysis.util.GCMHelper;

/**
 * This is the Tour-Trak Android Java Cordova Plugin. 
 * 
 * Acts as a location transmitter in the background of the device,
 * sending location updates of the rider as he or she rides through 
 * the tour to the Data Collection Server. 
 * 
 * @author Christoffer Rosen (cbr4830@rit.edu)
 * @author Ian Graves 
 *
 */

public class CDVInterface extends CordovaPlugin {

	private final static String TAG = CDVInterface.class.getSimpleName();
	private final static String DCS_URL = "http://devcycle.se.rit.edu/";

	private String mHelloTo = "World";
	private Messages.LocationUpdate loc = null;

	private boolean locationInit = false;
	private LocationListener locationListener = null;
	private TrackingService trackingService = null;
	private LocationReceiver test = null;
	private StateBroadcaster stateCaster= null;

	// Acquire a reference to the system Location Manager
	LocationManager locationManager;

	/**
	 * JavaScript will fire off a plugin request to the native side (HERE) and 
	 * will be passed to this method. Here we check for the action aka method to call
	 * 
	 * This does not run on the UI Thread but on the WebCore thread.
	 */
	@Override
	public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {

		// this is for test purposes to ensure plugin is working properly - will be removed!
		if (action.equals("echo")) {
			
			JSONObject msgObj = args.getJSONObject(0);
			String msg = msgObj.getString("message");
			this.echo(msg, callbackContext);
			return true;
		} else if (action.equals("start")) {
			this.start(callbackContext);
			
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
	 * @param callbackContext		The callback context (called on the JS side).
	 */
	private void start(CallbackContext callbackContext){
		if(!locationInit){
			this.initLoc();
		}
		callbackContext.success();
	}
	
	/**
	 * Pause tracking the rider
	 * @param callbackContext		The callback context (JS side).
	 */
	private void pauseTracking(CallbackContext callbackContext){
		Log.d("INFO: ", "PAUSE TRACKING");
	}
	
	/**
	 * Resume tracking the rider
	 * @param callbackContext		The callback context (JS side).
	 */
	private void resumeTracking(CallbackContext callbackContext){
		Log.d("RESULE: ", "RESUME");
	}

	/**
	 * "Echos" the message back in the callbackContext
	 * @param message				The message to be echoed
	 * @param callbackContext		The callback context.
	 */
	private void echo(String message, CallbackContext callbackContext) {
		if (message != null && message.length() > 0) { 
			callbackContext.success(message);
		} else {
			callbackContext.error("Expected one non-empty string argument.");
		}
	}

	/** 
	 * Set up the default configuration:
	 * I wonder how necessary this really is.
	 * @param cfg	TourConfig configuration
	 */
	public void setupDefaultConfig(TourConfig cfg) {
		if (!cfg.isTourConfigured()) {
			TourConfigData tour = new TourConfigData();

			// Get a handle to the system's resources
			Resources res = this.cordova.getActivity().getApplicationContext().getResources();

			tour.tour_id = res.getString(R.string.defaultConfigRaceId);
			tour.tour_name = res.getString(R.string.defaultConfigRaceName);
			tour.tour_organization = res.getString(R.string.defaultConfigTourOwner);
			tour.tour_logo = res.getString(R.string.defaultConfigTourLogo);
			tour.tour_url = res.getString(R.string.defaultConfigTourUrl);
			tour.dcs_url = res.getString(R.string.defaultConfigServerUrl);
			tour.gcm_sender_id = res.getString(R.string.defaultConfigGcmSenderId);

			if (BuildConfig.DEBUG) {
				tour.dcs_url = DCS_URL;
				tour.start_time = System.currentTimeMillis() + 60000 * 3;
				tour.max_tour_time = 30000000;
			} else {
				tour.start_time = Long.parseLong(res.getString(
						R.string.defaultConfigRaceStartTime));
				tour.max_tour_time = Long.parseLong(res.getString(
						R.string.defaultConfigRaceMaxTime));
			}

			cfg.setNewTourConfig(tour);
		}
	}
	
    private void initLoc() {

		Log.d(TAG,"init loc: HelloWorld calling CycleOps");
		
		//Set up the default config for sharedprefs.
		TourConfig cfg = new TourConfig(this.cordova.getActivity().getApplicationContext());
		setupDefaultConfig(cfg);
		
		trackingService = new TrackingService();
		stateCaster = new StateBroadcaster(this.cordova.getActivity().getApplicationContext());
		test = new LocationReceiver();
		
		ApiClient apc = new ApiClient(this.cordova.getActivity().getApplicationContext());
		try {
			RegisterRiderResponse riderResponse = apc.register();
			Log.d("RIDER ID: ", riderResponse.getRiderId());
			//Begin Ian's Hardcoding time.
			cfg.setRiderId(riderResponse.getRiderId());
//			boolean success = new ApiClient(this).registerPushId(cfg.HARDCODED_PUSH_ID);
//			if (success) {
//				new TourConfig(this).setGcmPushId(cfg.HARDCODED_PUSH_ID);
//			}
			//End Ian's Hardcoding time.
			Log.d(this.cordova.getActivity().getApplicationContext().getPackageName(), riderResponse.toString());
		} catch (DcsException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		GCMHelper.registerPush(this.cordova.getActivity().getApplicationContext());
		TrackingService.startTracking(this.cordova.getActivity().getApplicationContext());
		locationInit = true;
	}
}
