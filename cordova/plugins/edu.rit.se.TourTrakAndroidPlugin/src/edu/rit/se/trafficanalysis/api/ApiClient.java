package edu.rit.se.trafficanalysis.api;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.util.List;

import org.apache.http.HttpResponse;
import org.apache.http.StatusLine;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;

import android.content.Context;
import android.os.Build;
import android.util.Log;

import com.google.gson.Gson;
import com.google.gson.JsonIOException;
import com.google.gson.JsonSyntaxException;

import edu.rit.se.trafficanalysis.TourConfig;
import edu.rit.se.trafficanalysis.TourConfig.TourConfigData;
import edu.rit.se.trafficanalysis.api.Messages.LocationUpdate;
import edu.rit.se.trafficanalysis.api.Messages.LocationUpdateRequest;
import edu.rit.se.trafficanalysis.api.Messages.LocationUpdateResponse;
import edu.rit.se.trafficanalysis.api.Messages.RegisterPushIdRequest;
import edu.rit.se.trafficanalysis.api.Messages.RegisterRiderRequest;
import edu.rit.se.trafficanalysis.api.Messages.RegisterRiderResponse;

/**
 * Handles all communication *to* the DCS.
 * Handles converting all data to JSON and converting responses into expected formats.
 *
 */
public class ApiClient {
	private static final String TAG = ApiClient.class.getSimpleName();

	public static final String ENDPOINT_REGISTER = "/register/";
	public static final String ENDPOINT_PUSH_ID = "/register_push/";
	public static final String ENDPOINT_LOCATION = "/location_update/";
	public static final String ENDPOINT_CONFIG = "/tour_config/%s/";

	private TourConfig mTourConfig;
	private Gson mGson;

	public ApiClient(Context context) {
		mTourConfig = new TourConfig(context);
		mGson = new Gson();
	}
	
	/**
	 * Requests an updated tour config from the server.
	 * @return The TourConfig returned by the server.
	 */
	public TourConfigData getConfig(String dcs, String tourId) {
		String endpoint = String.format(dcs.replaceAll("/+$", "") + ENDPOINT_CONFIG, tourId);
		try {
			return newGetRequest(endpoint, TourConfigData.class);
		} catch (Exception e) {
			return null;
		}
	}

	/**
	 * Registers the rider with the DCS.
	 * @return The RegisterRiderResponse returned by the server.
	 * @throws DcsException
	 */
	public RegisterRiderResponse register() throws DcsException {
		String os = "IanAndroid " + Build.VERSION.RELEASE;
		String device = Build.PRODUCT + " (" + Build.DEVICE + ")";
		String tourId = mTourConfig.getTourId();
		RegisterRiderRequest data = new RegisterRiderRequest(os, device, tourId);
		try {
			return newPostRequest(ENDPOINT_REGISTER, data,
					RegisterRiderResponse.class);
		} catch (Exception e) {
			throw new DcsException("Registration Failed", e);
		}
	}

	/**
	 * Registers the GCM push id with the server.
	 * @param pushId The CGM push id.
	 * @return Whether the registration succeeded.
	 */
	public boolean registerPushId(String pushId) {
		if (!mTourConfig.isRegistered()) {
			Log.e(TAG, "Attempted to register push id before rider registration.");
			return false;
		}
		
		Log.i(TAG, "Sending push id to server.");
		RegisterPushIdRequest data = new RegisterPushIdRequest(
				mTourConfig.getRiderId(), pushId);
		try {
			newPostRequest(ENDPOINT_PUSH_ID, data, null);
			Log.i(TAG, "Push ID successfully send to server.");
			return true;
		} catch (Exception e) {
			Log.e(TAG, "Push ID failed sending to server.", e);
			return false;
		}
	}

	/**
	 * Sends the location data collected by the app.
	 * @param mLocDeliverQueue
	 * @return
	 */
	public Integer locationUpdate(List<LocationUpdate> mLocDeliverQueue) {
		if (!mTourConfig.isRegistered()) {
			Log.e(TAG, "Attempted to send location data before rider registration.");
			return -1;
		}
		
		Log.i(TAG, "Sending locations to server.");
		LocationUpdateRequest data = new LocationUpdateRequest(mLocDeliverQueue,
				mTourConfig.getRiderId(), mTourConfig.getTourId());
		try {
			LocationUpdateResponse riderCount = 
				newPostRequest(ENDPOINT_LOCATION, data, LocationUpdateResponse.class);
			Log.i(TAG, "Locations sent successfully to server.");
			return riderCount.getRiderCount();
		} catch (Exception e) {
			Log.e(TAG, "Could not send Locations to server.", e);
			return -1;
		}
	}

	/**
	 * Sends a generic post request to the server containing JSON data.
	 * @param path The path/endpoint to hit on the server.
	 * @param data The JSON object to send.
	 * @param responseType The Class of the expected JSON response. Null if none.
	 * @return The object of type `responseType` returned from the server.
	 * @throws ClientProtocolException
	 * @throws IOException
	 * @throws DcsException
	 */
	public <T, R> R newPostRequest(String path, T data, Class<R> responseType)
			throws ClientProtocolException, IOException, DcsException {
		HttpClient httpClient = new DefaultHttpClient();
		path = normalizeEndpoint(path);
		HttpPost post = new HttpPost(path);
		Log.i(TAG, "Hitting: " + path);
		post.addHeader("Content-Type", "application/json");

		String stringData = mGson.toJson(data);
		try {
			post.setEntity(new StringEntity(stringData));
		} catch (UnsupportedEncodingException e) {
			Log.e(TAG, "", e);
			throw e;
		}

		Log.d(TAG, "POST: " + stringData);

		HttpResponse response = httpClient.execute(post);
		return processResponse(response, responseType);
	}
	
	/**
	 * Sends a generic get request to the server.
	 * @param path The path/endpoint to hit on the server.
	 * @param responseType The Class of the expected JSON response. Null if none.
	 * @return The object of type `responseType` returned from the server.
	 * @throws ClientProtocolException
	 * @throws IOException
	 * @throws DcsException
	 */
	public <R> R newGetRequest(String path, Class<R> responseType)
			throws ClientProtocolException, IOException, DcsException {
		HttpClient httpClient = new DefaultHttpClient();
		path = normalizeEndpoint(path);
		HttpGet get = new HttpGet(path);
		Log.i(TAG, "Hitting: " + path);
		get.addHeader("Content-Type", "application/json");

		HttpResponse response = httpClient.execute(get);
		return processResponse(response, responseType);
	}
	
	/**
	 * Process and return the response from the server.
	 * @param response The HttpResponse from the server.
	 * @param responseType The JSOON type of the response, or null for success/failure.
	 * @return The JSON object of type responseType.
	 * @throws DcsException
	 * @throws JsonSyntaxException
	 * @throws JsonIOException
	 * @throws IllegalStateException
	 * @throws IOException
	 */
	private <R> R processResponse(HttpResponse response, Class<R> responseType) throws DcsException, JsonSyntaxException, JsonIOException, IllegalStateException, IOException {
		StatusLine statusLine = response.getStatusLine();
		if (statusLine.getStatusCode() < 400) {
			if (responseType != null) {
				return mGson.fromJson(new BufferedReader(new InputStreamReader(
						response.getEntity().getContent())), responseType);
			}
		} else {
			Log.e(TAG, statusLine.getReasonPhrase());
			throw new DcsException("API Request Failed");
		}
		return null;
	}
	
	private String normalizeEndpoint(String endpoint) {
		if (!endpoint.contains("://")) {
			endpoint = mTourConfig.getServerUrl().replaceAll("/+$", "") + endpoint;
		}
		return endpoint;
	}
}
