package edu.rit.se.trafficanalysis;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.support.v4.app.NotificationCompat;
import android.text.Html;
import android.util.Log;

import com.google.android.gcm.GCMBaseIntentService;
import com.google.gson.Gson;

import edu.rit.se.trafficanalysis.TourConfig.TourConfigData;
import edu.rit.se.trafficanalysis.api.RegisterPushService;
import edu.rit.se.trafficanalysis.api.UpdateTourConfigService;

/**
 * Service that receives push notifications from the Google Cloud Messaging (GCM) service.
 *
 */
public class GCMIntentService extends GCMBaseIntentService {

	private static final String TAG = GCMIntentService.class.getSimpleName();

	/**
	 * Notification ID of the custom message notification.
	 */
	private static final int NOTIFICATION_ID_MESSAGE = 1000 + 1;
	
	/**
	 * Data key containing the custom message string.
	 */
	private static final String KEY_MESSAGE = "msg";
	
	/**
	 * Data key containing the new configuration for the tour.
	 */
	private static final String KEY_NEW_CONFIG = "config";

	public GCMIntentService() {
		super();
	}

	/**
	 * Method called on device registered.
	 * If the registration id does not match the one for the active race, sends the new id
	 * to the server.
	 **/
	@Override
	protected void onRegistered(Context context, final String registrationId) {
		Log.i(TAG, "Device registered: regId = " + registrationId);
		TourConfig raceConfig = new TourConfig(this);
		if (!registrationId.equals(raceConfig.getGcmPushId())) {
			Intent i = new Intent(this, RegisterPushService.class);
			i.putExtra(RegisterPushService.KEY_REGISTRATION_ID, registrationId);
			startService(i);
		}
	}

	/**
	 * Method called on device unregistered.
	 * Removes the current registration id from the active race.
	 * */
	@Override
	protected void onUnregistered(Context context, String registrationId) {
		Log.i(TAG, "Device unregistered");
		new TourConfig(this).setGcmPushId(null);
	}

	/**
	 * Method called on receiving a new message
	 * */
	@Override
	protected void onMessage(Context c, Intent intent) {
		Log.i(TAG, "Received Message");
		Bundle extras = intent.getExtras();
		
		TourConfig cfg = new TourConfig(this);

		// Show a notification containing the message.
		if (extras.containsKey(KEY_MESSAGE) && cfg.isRegistered()) {
			String message = extras.getString(KEY_MESSAGE);
			cfg.setLatestRiderMessage(message);
			
			message = Html.fromHtml(message).toString();

//			NotificationCompat.Builder builder = NotificationHelper
//					.getNotificationBuilder(c);
//			//TODO: Add icons
//			builder.setSmallIcon(android.R.drawable.ic_dialog_info)
//					.setContentTitle(c.getString(R.string.push_message_title))
//					.setContentText(message)
//					.setAutoCancel(true);
//			
//			Intent i = new Intent(c, MessagesActivity.class);
//			PendingIntent pi = PendingIntent.getActivity(c, 0, i, 0);
//			builder.setContentIntent(pi);
//
//			NotificationHelper.showNotification(c, NOTIFICATION_ID_MESSAGE, builder);
		}

		// Update the tour configuration.
		if (extras.containsKey(KEY_NEW_CONFIG)) {
			String configStr = extras.getString(KEY_NEW_CONFIG);
			TourConfigData newConfig = new Gson().fromJson(
					configStr, TourConfigData.class);
			UpdateTourConfigService.updateConfig(this, cfg, newConfig);
		}
	}

	/**
	 * Method called on receiving a deleted message
	 * Not used.
	 * */
	@Override
	protected void onDeletedMessages(Context context, int total) {
		Log.i(TAG, "Received deleted messages notification");
	}

	/**
	 * Method called on Error
	 * Not used.
	 * */
	@Override
	public void onError(Context context, String errorId) {
		Log.i(TAG, "Received error: " + errorId);
	}

	@Override
	protected boolean onRecoverableError(Context context, String errorId) {
		// log message
		Log.i(TAG, "Received recoverable error: " + errorId);
		return super.onRecoverableError(context, errorId);
	}

}