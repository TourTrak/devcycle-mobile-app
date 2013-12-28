package edu.rit.se.trafficanalysis.tracking;

import java.util.ArrayList;
import java.util.List;

import edu.rit.se.trafficanalysis.api.Messages.LocationUpdate;
import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;

/**
 * Used to queue location data on the device for delivery to the DCS.
 * 
 */
public class LocationDBOpenHelper extends SQLiteOpenHelper {

	private static final String TAG = LocationDBOpenHelper.class
			.getSimpleName();

	/**
	 * Database info.
	 */
	private static final int DATABASE_VERSION = 1;
	private static final String DB_NAME = "TourTrak";
	private static final String LOCATIONS_TABLE_NAME = "locationUpdates";

	/**
	 * Location Table Columns names.
	 */
	private static final String KEY_TIME = "time";
	private static final String KEY_LAT = "latitude";
	private static final String KEY_LON = "longitude";
	private static final String KEY_ACCURACY = "accuracy";
	private static final String KEY_SPEED = "speec";
	private static final String KEY_BEARING = "bearing";
	private static final String KEY_PROVIDER = "provider";
	private static final String KEY_BATTERY = "battery";

	private static final String LOCATIONS_TABLE_CREATE = "CREATE TABLE "
			+ LOCATIONS_TABLE_NAME + " (" + KEY_TIME + " INTEGER, " + KEY_LAT
			+ " REAL, " + KEY_LON + " REAL, " + KEY_ACCURACY + " REAL, "
			+ KEY_SPEED + " REAL, " + KEY_BEARING + " REAL, " + KEY_PROVIDER
			+ " TEXT, " + KEY_BATTERY + " REAL" + ");";

	public LocationDBOpenHelper(Context context) {
		super(context, DB_NAME, null, DATABASE_VERSION);
	}

	@Override
	public void onCreate(SQLiteDatabase db) {
		db.execSQL(LOCATIONS_TABLE_CREATE);
	}

	@Override
	public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
		// Drop older table if existed
		db.execSQL("DROP TABLE IF EXISTS " + LOCATIONS_TABLE_NAME);

		// Create tables again
		onCreate(db);
	}

	/**
	 * Inserts a single location into the database.
	 * 
	 * @param location
	 * @return
	 */
	public long insertLocation(LocationUpdate location) {
		SQLiteDatabase db = getWritableDatabase();
		ContentValues initialValues = new ContentValues();
		initialValues.put(KEY_TIME, location.time);
		initialValues.put(KEY_LAT, location.latitude);
		initialValues.put(KEY_LON, location.longitude);
		initialValues.put(KEY_ACCURACY, location.accuracy);
		initialValues.put(KEY_SPEED, location.speed);
		initialValues.put(KEY_BEARING, location.bearing);
		initialValues.put(KEY_PROVIDER, location.provider);
		initialValues.put(KEY_BATTERY, location.battery);
		long id = db.insertOrThrow(LOCATIONS_TABLE_NAME, null, initialValues);
		db.close();
		Log.i(TAG, "Insert location with ID " + id);
		return id;
	}

	/**
	 * Retrieves all the locations in the database.
	 * 
	 * @return
	 */
	public List<LocationUpdate> getAllLocations() {
		SQLiteDatabase db = getReadableDatabase();
		Cursor results = db.query(LOCATIONS_TABLE_NAME, null, null, null, null,
				null, null);

		List<LocationUpdate> updates = new ArrayList<LocationUpdate>();
		while (results.moveToNext()) {
			LocationUpdate update = new LocationUpdate();
			update.time = results.getLong(results.getColumnIndex(KEY_TIME));
			update.latitude = results.getFloat(results.getColumnIndex(KEY_LAT));
			update.longitude = results
					.getFloat(results.getColumnIndex(KEY_LON));
			update.accuracy = results.getFloat(results
					.getColumnIndex(KEY_ACCURACY));
			update.speed = results.getFloat(results.getColumnIndex(KEY_SPEED));
			update.bearing = results.getFloat(results
					.getColumnIndex(KEY_BEARING));
			update.provider = results.getString(results
					.getColumnIndex(KEY_PROVIDER));
			update.battery = results.getFloat(results
					.getColumnIndex(KEY_BATTERY));
			updates.add(update);
		}
		results.close();
		db.close();
		Log.i(TAG, "Locations Found: " + updates.size());
		return updates;
	}

	/**
	 * Retrieves up to `size` oldest locations from the database.
	 * 
	 * @param size
	 *            The number of locations to retrieve.
	 * @return
	 */
	public List<LocationUpdate> getLocations(int size) {
		SQLiteDatabase db = getReadableDatabase();
		Cursor results = db.rawQuery("SELECT * FROM " + LOCATIONS_TABLE_NAME
				+ " ORDER BY " + KEY_TIME + " ASC LIMIT " + size, null);

		List<LocationUpdate> updates = new ArrayList<LocationUpdate>();
		while (results.moveToNext()) {
			LocationUpdate update = new LocationUpdate();
			update.time = results.getLong(results.getColumnIndex(KEY_TIME));
			update.latitude = results.getFloat(results.getColumnIndex(KEY_LAT));
			update.longitude = results
					.getFloat(results.getColumnIndex(KEY_LON));
			update.accuracy = results.getFloat(results
					.getColumnIndex(KEY_ACCURACY));
			update.speed = results.getFloat(results.getColumnIndex(KEY_SPEED));
			update.bearing = results.getFloat(results
					.getColumnIndex(KEY_BEARING));
			update.provider = results.getString(results
					.getColumnIndex(KEY_PROVIDER));
			update.battery = results.getFloat(results
					.getColumnIndex(KEY_BATTERY));
			updates.add(update);
		}
		results.close();
		db.close();
		Log.i(TAG, "Locations found " + updates.size());
		return updates;
	}

	/**
	 * Deletes all locations older than `timeStamp` in the database.
	 * 
	 * @param timeStamp
	 */
	public void deleteByTimeStamp(long timeStamp) {
		SQLiteDatabase db = getWritableDatabase();
		db.execSQL("DELETE FROM " + LOCATIONS_TABLE_NAME + " WHERE " + KEY_TIME
				+ " <= " + timeStamp);
		db.close();
		Log.i(TAG, "Locations deleted");
	}

	/**
	 * Deletes all locations in the database.
	 * 
	 * @return
	 */
	public int clearLocations() {
		SQLiteDatabase db = getWritableDatabase();
		int count = db.delete(LOCATIONS_TABLE_NAME, null, null);
		db.close();
		Log.i(TAG, "Locations deleted");
		return count;
	}
}