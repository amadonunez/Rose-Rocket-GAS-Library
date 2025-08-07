function getTagsForManifest(instanceName, manifestId) {
    const functionName = 'getTagsForManifest'; // Updated function name for logging context
    Logger.log(`${functionName}: Fetching tags for manifest ${manifestId} in instance ${instanceName}.`);

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
    const tagsUrl = `${baseUrl}/api/v1/master_trips/${manifestId}/tags`;  // ***UPDATED ENDPOINT***
    Logger.log(`${functionName}: Requesting URL: ${tagsUrl}`);

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
        const response = UrlFetchApp.fetch(tagsUrl, options);
        const responseCode = response.getResponseCode();
        const responseBody = response.getContentText();

        // 6. Handle Response
        if (responseCode >= 200 && responseCode < 300) {
            // Success case
            try {
                const responseData = JSON.parse(responseBody);
              //  Logger.log(responseData)

                // *** MODIFIED PART: Access data array ***
                if (responseData && typeof responseData.data === 'object' && Array.isArray(responseData.data)) {
                    const tagsArray = responseData.data;
                  //  Logger.log(`${functionName}: Successfully retrieved ${tagsArray.length} tags for manifest ${manifestId}.`);
                    return tagsArray; // Return the actual tags array
                } else {
                    // Log unexpected structure if data is missing/wrong type
                    Logger.log(`${functionName}: Unexpected response structure for manifest ${manifestId}. Expected 'data' array.`);
                    Logger.log(`Response Body: ${responseBody}`);
                    // Return empty array as it implies no usable tags were found in the expected place
                    return [];
                }
            } catch (parseError) {
                Logger.log(`${functionName}: Error parsing JSON response for manifest ${manifestId} (Status ${responseCode}). Error: ${parseError}`);
                Logger.log(`Response Body: ${responseBody}`);
                return null; // Parsing failed
            }
        } else if (responseCode === 404) {
            Logger.log(`${functionName}: Manifest ${manifestId} or its tags not found (404 response).`);
            return []; // Return an empty array for 404
        } else {
            // Handle other API errors
            Logger.log(`${functionName}: Error fetching tags for manifest ${manifestId}. Response Code: ${responseCode}`);
            Logger.log(`Response Body: ${responseBody}`);
            return null; // Return null for other errors
        }
    } catch (fetchError) {
        Logger.log(`${functionName}: Critical error during UrlFetchApp.fetch for manifest ${manifestId}: ${fetchError}. Stack: ${fetchError.stack}`);
        return null;
    }
}

function test_getTagsForManifest(){

  Logger.log(
    getTagsForManifest(Instance.SONOT, '5a66e421-3e86-43a9-a157-139db3940138')
  )

}