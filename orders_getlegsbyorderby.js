/**
 * Retrieves the legs (shipment segments) for a single order by its OrderID from Rose Rocket.
 *
 * @param {string} instance The Rose Rocket instance name (e.g., 'acme', 'starlight'). Must match INSTANCES keys or be managed by instanceManager.
 * @param {string} orderId The Rose Rocket Order ID (or external ID format like 'ext:...') of the order whose legs are to be retrieved.
 * @returns {object[]|null} An array of leg objects on success, or null on error.
 */
function getOrderLegsByOrderId(instance, orderId) {
  // Instance validation (Assuming Instance enum or similar check exists)
  // If using instanceManager, validation might happen inside getAccessTokenForInstance
  if (typeof Instance !== 'undefined' && !Object.values(Instance).includes(instance)) {
    Logger.log(`Error: Invalid instance: ${instance}. Use one of: ${Object.values(Instance).join(', ')}`);
    return null;
  } else if (typeof instanceManager !== 'undefined' && !instanceManager.isValidInstance(instance)) { // Or use instanceManager validation if applicable
     Logger.log(`Error: Invalid instance provided via instanceManager: ${instance}`);
     return null;
  }


  // Get the access token
  // Assuming getAccessTokenForInstance handles different instances correctly
  const accessToken = getAccessTokenForInstance(instance);
  if (!accessToken) {
    Logger.log(`Error: Could not retrieve access token for instance ${instance}.`);
    return null;
  }

  // Construct the full API URL for order legs
  // Base URL might be stored elsewhere, but constructing directly is also fine.
  const apiUrl = `https://platform.roserocket.com/api/v1/orders/${encodeURIComponent(orderId)}/legs`;
  Logger.log(`API URL for Legs: ${apiUrl}`);

  const options = {
    'method': 'get',
    'headers': {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json' // Good practice to include Accept header
    },
    'muteHttpExceptions': true
  };

  // Make the API request
  let response;
  try {
      response = UrlFetchApp.fetch(apiUrl, options);
  } catch (e) {
      Logger.log(`Network or fetch error calling getOrderLegsByOrderId for order ${orderId} on instance ${instance}: ${e}`);
      return null; // Network-level error
  }


  // Check the response code
  const responseCode = response.getResponseCode();
  const responseBody = response.getContentText(); // Get body for logging regardless of code
  Logger.log(`API Response Code for Legs: ${responseCode}`);

  if (responseCode === 200) {
    // Success! Parse JSON and return the 'legs' array.
    try {
      const parsedResponse = JSON.parse(responseBody);
      // IMPORTANT: Check if the 'legs' property exists and is an array
      if (parsedResponse && Array.isArray(parsedResponse.legs)) {
         Logger.log(`Successfully retrieved ${parsedResponse.legs.length} leg(s) for order ${orderId}.`);
         return parsedResponse.legs; // Return only the array of legs
      } else {
         Logger.log(`Error: API response for legs (200 OK) did not contain a valid 'legs' array for order ${orderId}. Response: ${responseBody}`);
         return null; // Response structure unexpected
      }
    } catch (e) {
      Logger.log(`Error parsing JSON response for legs: ${e}`);
      Logger.log(`Raw response content for legs: ${responseBody}`);
      return null;
    }
  } else if (responseCode === 400) {
    // Bad Request (e.g., invalid orderId format potentially)
    Logger.log(`Bad Request (400) getting legs for order ${orderId}: ${responseBody}`);
    return null;
  } else if (responseCode === 404) {
    // Not Found (order doesn't exist - this is an assumption, add if observed)
    Logger.log(`Order Not Found (404) when getting legs for order ${orderId}: ${responseBody}`);
    return null;
  } else {
    // Other error
    Logger.log(`API Error getting legs for order ${orderId}: ${responseCode} - ${responseBody}`);
    return null;
  }
}

//----------------------------------------------------
// Test Function for getOrderLegsByOrderId
//----------------------------------------------------

/**
 * Test function for getOrderLegsByOrderId.
 */
function test_GetOrderLegsByOrderId() {
  // --- Configuration (Replace with your actual values) ---
  const testInstance = Instance.AMADO; // Replace with a valid instance enum/value
  // Use an Order ID known to have legs in the target instance for the success case
  const validOrderIdWithLegs = '0c01afe4-6c4f-45de-b66b-8a236eeb04a4'; // Replace with a *real* Order ID from your test instance THAT HAS LEGS
  const orderIdNotFound = 'fictional-order-id-12345'; // An ID likely not to exist
  const invalidFormatOrderId = 'bad:format:id'; // An ID with potentially bad formatting

  // --- Test Cases ---

  // Test case 1: Valid Order ID known to have legs
  Logger.log(`\n=== Test Case 1: Valid Order ID with Legs (${validOrderIdWithLegs}) ===`);
  const legsResult = getOrderLegsByOrderId(testInstance, validOrderIdWithLegs);

  if (legsResult === null) {
    Logger.log('Test Case 1 FAILED: Expected an array of legs, but got null.');
  } else if (!Array.isArray(legsResult)) {
    Logger.log(`Test Case 1 FAILED: Expected an array, but got type ${typeof legsResult}.`);
  } else {
    Logger.log(`Test Case 1 PASSED: Received an array with ${legsResult.length} leg(s).`);

    // Add more specific assertions if legs are expected
    if (legsResult.length > 0) {
      Logger.log("  Assertions on first leg:");
      const firstLeg = legsResult[0];

      // 1. Check leg ID
      if (firstLeg.id && typeof firstLeg.id === 'string') {
        Logger.log(`  Assertion PASSED: First leg has an ID: ${firstLeg.id}`);
      } else {
        Logger.log("  Assertion FAILED: First leg 'id' is missing or not a string.");
      }

      // 2. Check order_id matches input
      if (firstLeg.order_id === validOrderIdWithLegs) {
         Logger.log(`  Assertion PASSED: First leg 'order_id' matches requested orderId.`);
      } else {
         Logger.log(`  Assertion FAILED: First leg 'order_id' (${firstLeg.order_id}) does not match requested orderId (${validOrderIdWithLegs}).`);
      }

      // 3. Check sequence_id
      if (typeof firstLeg.sequence_id === 'number') {
         Logger.log(`  Assertion PASSED: First leg has sequence_id: ${firstLeg.sequence_id}`);
      } else {
         Logger.log("  Assertion FAILED: First leg 'sequence_id' is missing or not a number.");
      }

      // 4. Check type
      if (firstLeg.type && typeof firstLeg.type === 'string') {
         Logger.log(`  Assertion PASSED: First leg has type: ${firstLeg.type}`);
      } else {
         Logger.log("  Assertion FAILED: First leg 'type' is missing or not a string.");
      }

       // 5. Check origin details (basic check)
      if (firstLeg.origin && firstLeg.origin.city && firstLeg.origin.country) {
         Logger.log(`  Assertion PASSED: First leg has origin city/country: ${firstLeg.origin.city}, ${firstLeg.origin.country}`);
      } else {
         Logger.log("  Assertion FAILED: First leg 'origin' details (city/country) seem incomplete or missing.");
      }

       // 6. Check destination details (basic check)
      if (firstLeg.destination && firstLeg.destination.city && firstLeg.destination.country) {
         Logger.log(`  Assertion PASSED: First leg has destination city/country: ${firstLeg.destination.city}, ${firstLeg.destination.country}`);
      } else {
         Logger.log("  Assertion FAILED: First leg 'destination' details (city/country) seem incomplete or missing.");
      }

       // 7. Check commodities array
       if (Array.isArray(firstLeg.commodities)) {
         Logger.log(`  Assertion PASSED: First leg has a commodities array (length: ${firstLeg.commodities.length}).`);
       } else {
         Logger.log("  Assertion FAILED: First leg 'commodities' is missing or not an array.");
       }

    } else {
      Logger.log("  Note: Received an empty array of legs, which might be valid depending on the order.");
    }
  }

  // Test case 2: Order ID that likely doesn't exist
  Logger.log(`\n=== Test Case 2: Order ID Not Found (${orderIdNotFound}) ===`);
  const notFoundResult = getOrderLegsByOrderId(testInstance, orderIdNotFound);
  if (notFoundResult === null) {
    Logger.log('Test Case 2 PASSED: Correctly returned null for a non-existent order ID.');
    // Check logs for 404 or potentially 400 depending on API behavior
     if (Logger.getLog().includes("Order Not Found (404)") || Logger.getLog().includes("Bad Request (400)")) {
        Logger.log("  Assertion PASSED: Expected error (404 or 400) was logged.");
    } else {
        Logger.log("  Assertion FAILED: Expected 404 or 400 error in logs, but didn't find it clearly.");
    }
  } else {
    Logger.log('Test Case 2 FAILED: Unexpectedly returned a value for a non-existent order ID.');
    Logger.log(`Value returned: ${JSON.stringify(notFoundResult)}`)
  }

  // Test case 3: Invalid Format Order ID (expecting 400 Bad Request)
  Logger.log(`\n=== Test Case 3: Invalid Format Order ID (${invalidFormatOrderId}) ===`);
  const invalidFormatResult = getOrderLegsByOrderId(testInstance, invalidFormatOrderId);
  if (invalidFormatResult === null) {
    Logger.log('Test Case 3 PASSED: Correctly returned null for an invalid format order ID.');
     if (Logger.getLog().includes("Bad Request (400)")) {
        Logger.log("  Assertion PASSED: 400 Bad Request error was logged as expected.");
    } else {
        Logger.log("  Assertion FAILED: Expected 400 Bad Request error, but didn't find it in logs.");
    }
  } else {
    Logger.log('Test Case 3 FAILED: Unexpectedly returned a value for an invalid format order ID.');
     Logger.log(`Value returned: ${JSON.stringify(invalidFormatResult)}`)
  }


  // Test case 4: Invalid instance (Reuse logic from previous test)
  Logger.log(`\n=== Test Case 4: Invalid Instance ===`);
  const invalidInstanceResult = getOrderLegsByOrderId('invalid_instance_name', validOrderIdWithLegs); // Use a clearly invalid name
  if (invalidInstanceResult === null) {
    Logger.log('Test Case 4 PASSED: Correctly returned null for invalid instance.');
     if(Logger.getLog().includes("Error: Invalid instance")){ // Or check for instanceManager error message if used
       Logger.log("   Assertion PASSED: Invalid instance error was logged as expected.");
     } else {
       Logger.log("  Assertion FAILED: Expected Invalid Instance error, but didn't find it in logs");
     }
  } else {
    Logger.log('Test Case 4 FAILED: Unexpectedly returned a value for an invalid instance.');
  }


   // Test case 5: No Access Token (Reuse logic from previous test)
    Logger.log(`\n=== Test Case 5: Simulate No Access Token ===`);
    // Temporarily replace getAccessTokenForInstance
    const originalGetAccessToken = getAccessTokenForInstance;
    // Ensure the mock function exists before assigning
    if (typeof getAccessTokenForInstance !== 'undefined') {
        getAccessTokenForInstance = function(instance) {
            Logger.log(`Simulating getAccessTokenForInstance failure for instance: ${instance}.`);
            return null;
        };
    } else {
        Logger.log("Skipping No Access Token test - getAccessTokenForInstance function not found.");
        // Skip the actual call if the function doesn't exist (e.g., testing environment setup issue)
         // Restore immediately if skipping
         if(typeof originalGetAccessToken !== 'undefined') getAccessTokenForInstance = originalGetAccessToken; 
         return; // Exit test function early
    }

    let noTokenResult = null;
    try {
      noTokenResult = getOrderLegsByOrderId(testInstance, validOrderIdWithLegs);

      if (noTokenResult === null) {
        Logger.log('Test Case 5 PASSED: Correctly handled access token failure.');
          if (Logger.getLog().includes("Error: Could not retrieve access token.")){
            Logger.log("   Assertion PASSED: No Access Token error was logged as expected");
          } else{
            Logger.log("  Assertion FAILED: Expected No Access Token error, but didn't find it in logs");
          }
      } else {
        Logger.log('Test Case 5 FAILED:  Unexpected result when access token retrieval fails.');
      }
    } catch(e) {
       Logger.log(`Error during No Access Token test execution: ${e}`);
    } finally {
      // IMPORTANT: Always restore the original function
       if(typeof originalGetAccessToken !== 'undefined') getAccessTokenForInstance = originalGetAccessToken;
       Logger.log("Original getAccessTokenForInstance restored.");
    }


    Logger.log(`\n=== Leg Test Complete. Review the logs above for results. ===`);
}

