/**
 * Updates payment information for a specific manifest in Rose Rocket.
 *
 * @param {string} instanceName - The name of the Rose Rocket instance.
 * @param {string} manifestId - The ID of the manifest for which to update payment information.
 * @param {object} paymentData - The payment data to send in the PUT request body.
 * @returns {object|null} The parsed JSON response from the API on success, or null on failure.
 */
function putPaymentForManifest(instanceName, manifestId, paymentData) {
  const functionName = 'putPaymentForManifest'; // For logging context
  Logger.log(`${functionName}: Updating payment for manifest ${manifestId} in instance ${instanceName}.`);

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
  //  It is YOUR RESPONSIBILITY to have the correct one. It may be, it may not be. It might need to hard code.
  const paymentUrl = `https://platform.roserocket.com/api/v1/manifests/${manifestId}/payment/items/upsert`;
  Logger.log(`${functionName}: Requesting URL: ${paymentUrl}`);

  // 4. Prepare UrlFetchApp Options (PUT Request)
  const options = {
    method: 'PUT', // Changed to PUT
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    payload: JSON.stringify(paymentData), // Added payload
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
        Logger.log(`${functionName}: Successfully updated payment data for manifest ${manifestId}.`);
        return responseData; // Return the response data
      } catch (parseError) {
        Logger.log(`${functionName}: Error parsing JSON response for manifest ${manifestId} (Status ${responseCode}). Error: ${parseError}`);
        Logger.log(`Response Body: ${responseBody}`);
        return responseBody; // return raw
      }
    } else {
      // Handle API errors
      Logger.log(`${functionName}: Error updating payment for manifest ${manifestId}. Response Code: ${responseCode}`);
      Logger.log(`Response Body: ${responseBody}`);
      return null; // Return null for errors
    }
  } catch (fetchError) {
    Logger.log(`${functionName}: Critical error during UrlFetchApp.fetch for manifest ${manifestId}: ${fetchError}. Stack: ${fetchError.stack}`);
    return null;
  }
}


function test_putPayment() {
  const manifestId = '94850ba5-d789-475a-bc31-640fb6f9d069';

  const paymentData = {
    payment_items: [
      {
        id: "c19c63ef-3ffa-4469-a29e-b010b197f0ee",
        description: "P5190914 IMPO DE BERLYN",
        unit_price: 230.0,
        quantity: 1,
        total_amount: 230.0,
        bill_class: "misc"
      },
      {
        id: "5b9623d6-eb44-47c7-a289-1f0f228ec85b",
        description: "P5190914 MOV AL TALLER AMADO",
        unit_price: 28.5,
        quantity: 1,
        total_amount: 28.5,
        bill_class: "misc"
      },
      {
        description: "Nuevo cargo adicional",
        unit_price: 50.0,
        quantity: 1,
        total_amount: 50.0,
        bill_class: "misc"
      }
    ]
  };

  const payment = putPaymentForManifest(Instance.SONOT, manifestId, paymentData);
  Logger.log(payment);
}