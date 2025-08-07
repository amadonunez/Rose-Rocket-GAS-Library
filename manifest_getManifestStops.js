/**
 * Retrieves the stops array associated with a given Rose Rocket manifest.
 * Relies on instanceManager.getInstanceBaseURL() for the base URL.
 * Extracts stops from the `data.stops` path in the API response.
 *
 * @param {string} instanceName The name of the Rose Rocket instance.
 * @param {string} manifestId The Rose Rocket manifest ID.
 * @returns {Array<object>|null} An array of stop objects if found and successfully parsed,
 *   or null if not found, on error, or if the response structure is unexpected.
 *   Returns an empty array ([]) for 404 responses or if data.stops is missing/empty.
 */
function getStopsForManifest(instanceName, manifestId) {
    const functionName = 'getStopsForManifest'; // For logging context
    Logger.log(`${functionName}: Fetching stops for manifest ${manifestId} in instance ${instanceName}.`);

    // 1. Get Access Token
    const accessToken = getAccessTokenForInstance(instanceName); // Assuming this function exists and is accessible
    if (!accessToken) {
        Logger.log(`${functionName}: Failed to get access token for ${instanceName}.`);
        return null;
    }

    // 2. Get Instance Base URL
    let baseUrl;
    try {
        if (typeof instanceManager === 'undefined' || typeof instanceManager.getInstanceBaseURL !== 'function') {
             Logger.log(`Error in ${functionName}: instanceManager or instanceManager.getInstanceBaseURL is not defined.`);
             return null;
        }
        baseUrl = instanceManager.getInstanceBaseURL(instanceName);
        if (!baseUrl) {
            Logger.log(`Error in ${functionName}: instanceManager.getInstanceBaseURL returned null or empty for instance ${instanceName}.`);
            return null;
        }
    } catch (configError) {
         Logger.log(`Error in ${functionName} while getting base URL for ${instanceName}: ${configError}`);
         return null;
    }

    // 3. Construct the API Endpoint URL
    const stopsUrl = `${baseUrl}/api/v1/master_trips/${manifestId}/stops`;
    Logger.log(`${functionName}: Requesting URL: ${stopsUrl}`);

    // 4. Prepare UrlFetchApp Options
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        muteHttpExceptions: true,
    };

    // 5. Make the API Call
    try {
        const response = UrlFetchApp.fetch(stopsUrl, options);
        const responseCode = response.getResponseCode();
        const responseBody = response.getContentText();

        // 6. Handle Response
        if (responseCode >= 200 && responseCode < 300) {
            // Success case
            try {
                const responseData = JSON.parse(responseBody);
                 Logger.log(responseData);
                // *** MODIFIED PART: Access data.stops ***
                // Check if 'data' object exists and 'stops' array exists within it
                if (responseData && typeof responseData.data === 'object' && responseData.data !== null && Array.isArray(responseData.data.stops)) {
                    const stopsArray = responseData.data.stops;
                    Logger.log(`${functionName}: Successfully retrieved ${stopsArray.length} stops for manifest ${manifestId}.`);
                    return stopsArray; // Return the actual stops array
                } else {
                    // Log unexpected structure if data or data.stops is missing/wrong type
                    Logger.log(`${functionName}: Unexpected response structure for manifest ${manifestId}. Expected 'data.stops' array.`);
                    Logger.log(`Response Body: ${responseBody}`);
                    // Return empty array as it implies no usable stops were found in the expected place
                    
                    return [];                
                }
            } catch (parseError) {
                Logger.log(`${functionName}: Error parsing JSON response for manifest ${manifestId} (Status ${responseCode}). Error: ${parseError}`);
                Logger.log(`Response Body: ${responseBody}`);
                return null; // Parsing failed
            }
        } else if (responseCode === 404) {
            Logger.log(`${functionName}: Manifest ${manifestId} or its stops not found (404 response).`);
            return []; // Return an empty array for 404
        } else {
            // Handle other API errors
            Logger.log(`${functionName}: Error fetching stops for manifest ${manifestId}. Response Code: ${responseCode}`);
            Logger.log(`Response Body: ${responseBody}`);
            return null; // Return null for other errors
        }
    } catch (fetchError) {
        Logger.log(`${functionName}: Critical error during UrlFetchApp.fetch for manifest ${manifestId}: ${fetchError}. Stack: ${fetchError.stack}`);
        return null;
    }
}

function test_getstops(){

  Logger.log(
    getStopsForManifest(Instance.SONOT, 'b26f18e3-ee90-41c5-945f-74dfb4d5b11e')[0].tasks[0].order_id
  )

}


