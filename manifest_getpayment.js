function getPaymentForManifest(instanceName, manifestId) {
    const functionName = 'getPaymentForManifest'; // For logging context
    Logger.log(`${functionName}: Fetching payment for manifest ${manifestId} in instance ${instanceName}.`);

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
    const paymentUrl = `${baseUrl}/api/v1/master_trips/${manifestId}/payment`;
    Logger.log(`${functionName}: Requesting URL: ${paymentUrl}`);

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
        const response = UrlFetchApp.fetch(paymentUrl, options);
        const responseCode = response.getResponseCode();
        const responseBody = response.getContentText();

        // 6. Handle Response
        if (responseCode >= 200 && responseCode < 300) {
            // Success case
            try {
                const responseData = JSON.parse(responseBody);

                // *** MODIFIED PART: Access the payment data ***
                // Check if 'data' object exists and 'payment' object exists within it. Adjusted to accommodate different possible data structures.
                if (responseData && typeof responseData.data === 'object' && responseData.data !== null && responseData.data.payment) {
                    const paymentData = responseData.data.payment;
                    Logger.log(`${functionName}: Successfully retrieved payment data for manifest ${manifestId}.`);
                    return paymentData; // Return the actual payment data
                } else if (responseData && typeof responseData === 'object' && responseData !== null) {
                    // Handle the case where the response itself is a payment object
                    Logger.log(`${functionName}: Successfully retrieved payment data for manifest ${manifestId}.`);
                    return responseData;
                }
                else {
                    // Log unexpected structure if data or data.payment is missing/wrong type
                    Logger.log(`${functionName}: Unexpected response structure for manifest ${manifestId}. Expected 'data.payment' object or a direct payment object.`);
                    Logger.log(`Response Body: ${responseBody}`);
                    // Return null as it implies no usable payment was found in the expected place
                    return null;
                }
            } catch (parseError) {
                Logger.log(`${functionName}: Error parsing JSON response for manifest ${manifestId} (Status ${responseCode}). Error: ${parseError}`);
                Logger.log(`Response Body: ${responseBody}`);
                return null; // Parsing failed
            }
        } else if (responseCode === 404) {
            Logger.log(`${functionName}: Manifest ${manifestId} or its payment not found (404 response).`);
            return null; // Return null for 404
        } else {
            // Handle other API errors
            Logger.log(`${functionName}: Error fetching payment for manifest ${manifestId}. Response Code: ${responseCode}`);
            Logger.log(`Response Body: ${responseBody}`);
            return null; // Return null for other errors
        }
    } catch (fetchError) {
        Logger.log(`${functionName}: Critical error during UrlFetchApp.fetch for manifest ${manifestId}: ${fetchError}. Stack: ${fetchError.stack}`);
        return null;
    }
}

function test_getPayment(){
  // Replace Instance.AMADO and a valid manifest ID
  const payment = getPaymentForManifest(Instance.AMADO, 'c9ecfd46-4aaf-4a39-8934-7efb713ca0f2');
  Logger.log(payment); // Log the payment data to see its structure
}