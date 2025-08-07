/**
 * Retrieves a single order by its OrderID from Rose Rocket.
 *
 * @param {string} instance The Rose Rocket instance name (e.g., 'acme', 'starlight').  Must match INSTANCES keys.
 * @param {string} orderId The Rose Rocket Order ID of the order to retrieve.
 * @returns {object|null} The API response object on success, or null on error.
 */
function getOrderByOrderId(instance, orderId) {
  // Instance validation
  if (!Object.values(Instance).includes(instance)) {
    Logger.log(`Error: Invalid instance: ${instance}. Use one of: ${Object.values(Instance).join(', ')}`);
    return null;
  }

  const instanceConfig = INSTANCES[instance];
  const apiUrlBase = 'https://platform.roserocket.com/api/v1/orders';

  // Get the access token
  const accessToken = getAccessTokenForInstance(instance);
  if (!accessToken) {
    Logger.log("Error: Could not retrieve access token.");
    return null;
  }

  // Construct the full API URL
  const apiUrl = `${apiUrlBase}/${orderId}`;
  Logger.log(`API URL: ${apiUrl}`);

  const options = {
    'method': 'get',
    'headers': {
      'Authorization': `Bearer ${accessToken}`
    },
    'muteHttpExceptions': true
  };

  // Make the API request
  const response = UrlFetchApp.fetch(apiUrl, options);

  // Check the response code
  const responseCode = response.getResponseCode();
  Logger.log(`API Response Code: ${responseCode}`);

  if (responseCode === 200) {
    // Success!  Return the parsed JSON.
    try {
      return JSON.parse(response.getContentText());
    } catch (e) {
      Logger.log(`Error parsing JSON response: ${e}`);
      Logger.log(`Raw response content: ${response.getContentText()}`);
      return null;
    }
  } else if (responseCode === 400) {
    // Bad Request
    Logger.log(`Bad Request (400): ${response.getContentText()}`);
    return null;
  } else if (responseCode === 404) {
    // Not Found (order doesn't exist)
    Logger.log(`Order Not Found (404): ${response.getContentText()}`);
    return null;
  } else {
    // Other error
    Logger.log(`API Error: ${responseCode} - ${response.getContentText()}`);
    return null;
  }
}

/**
 * Test function for getOrderByOrderId.
 */
function testGetOrderByOrderId() {
  // --- Configuration (Replace with your actual values) ---
  const testInstance = Instance.AMADO;  // Replace with a valid instance.
  const validOrderId = 'f5b2e8e0-a89b-4382-a07d-cc8acd26b886'; // Replace with a *known* valid order ID. From the provided JSON
  const invalidOrderId = 'INVALID_ORDER_ID'; // Intentionally invalid ID.

  // --- Test Cases ---

  // Test case 1: Valid order ID - More comprehensive checks
  Logger.log(`=== Test Case 1: Valid Order ID (${validOrderId}) ===`);
  const validOrderResult = getOrderByOrderId(testInstance, validOrderId);
  if (validOrderResult) {
    Logger.log('Test Case 1 PASSED: Order retrieved successfully.');

    // Assertions based on the provided JSON structure:
    const order = validOrderResult.order; // Access the 'order' object

    // 1. Check the top-level 'order' object exists
    if (order) {
      Logger.log("  Assertion PASSED: Top-level 'order' object exists.");
    } else {
      Logger.log("  Assertion FAILED: Top-level 'order' object is missing.");
    }


    // 2. Check order ID
    if (order && order.id === validOrderId) {
      Logger.log(`  Assertion PASSED: orderId matches expected value (${validOrderId}).`);
    } else {
      Logger.log(`  Assertion FAILED: orderId does not match.  Expected: ${validOrderId}, Got: ${order ? order.id : 'N/A'}`);
    }

    // 3. Check status
     if (order && order.status) {
        Logger.log(`  Assertion PASSED: status exists - ${order.status}.`);
      } else {
        Logger.log("  Assertion FAILED: status is missing");
      }


    // 4. Check customer object and a nested property
    if (order && order.customer && order.customer.short_code) {
      Logger.log(`  Assertion PASSED: customer.short_code exists (${order.customer.short_code}).`);
    } else {
      Logger.log("  Assertion FAILED: customer.short_code is missing.");
    }

    // 5. Check origin object and nested properties
   if (order && order.origin && order.origin.city && order.origin.country) {
      Logger.log(`  Assertion PASSED: origin.city and origin.country exist (${order.origin.city}, ${order.origin.country}).`);
    } else {
      Logger.log("  Assertion FAILED: origin.city or origin.country is missing.");
    }

     // 6. Check destination object and nested properties
    if (order && order.destination && order.destination.city && order.destination.country) {
      Logger.log(`  Assertion PASSED: destination.city and destination.country exist (${order.destination.city}, ${order.destination.country}).`);
    } else {
      Logger.log("  Assertion FAILED: destination.city or destination.country is missing.");
    }

    // 7. Check commodities array and its contents (at least one element)
    if (order && Array.isArray(order.commodities) && order.commodities.length > 0) {
      Logger.log(`  Assertion PASSED: commodities array exists and has at least one element.`);
      // Check a property within the first commodity
      if (order.commodities[0].description) {
          Logger.log(`   Assertion PASSED: First commodity has a description (${order.commodities[0].description}).`);
      } else {
          Logger.log("   Assertion FAILED: First commodity's description is missing.");
      }

    } else {
      Logger.log("  Assertion FAILED: commodities array is missing or empty.");
    }

    // 8. check created_at and updated_at
    if (order && order.created_at && order.updated_at) {
       Logger.log(` Assertion PASSED: created_at and updated_at exist.`);
    } else {
       Logger.log(" Assertion FAILED: created_at and/or updated_at is missing.");
    }
  } else {
    Logger.log('Test Case 1 FAILED: Could not retrieve order.');
  }

  // Test case 2: Invalid order ID (remains the same)
  Logger.log(`\n=== Test Case 2: Invalid Order ID (${invalidOrderId}) ===`);
  const invalidOrderResult = getOrderByOrderId(testInstance, invalidOrderId);
  if (invalidOrderResult === null) {
    Logger.log('Test Case 2 PASSED:  Correctly returned null for invalid order ID.');
    if (Logger.getLog().includes("Order Not Found (404)")) {
        Logger.log("  Assertion PASSED: 404 Not Found error was logged as expected.");
    } else {
        Logger.log("  Assertion FAILED:  Expected 404 Not Found error, but didn't find it in logs.");
    }
  } else {
    Logger.log('Test Case 2 FAILED:  Unexpectedly returned a value for an invalid order ID.');
  }

  // Test case 3: Invalid instance (remains the same)
  Logger.log(`\n=== Test Case 3: Invalid Instance ===`);
  const invalidInstanceResult = getOrderByOrderId('invalid_instance', validOrderId);
  if (invalidInstanceResult === null) {
    Logger.log('Test Case 3 PASSED: Correctly returned null for invalid instance.');
    if(Logger.getLog().includes("Error: Invalid instance")){
      Logger.log("   Assertion PASSED: Invalid instance error was logged as expected.");
    } else {
      Logger.log("  Assertion FAILED: Expected Invalid Instance, but didn't find it in logs");
    }
  } else {
    Logger.log('Test Case 3 FAILED: Unexpectedly returned a value for an invalid instance.');
  }

   // Test case 4: No Access Token (simulate token failure) (remains the same)
    Logger.log(`\n=== Test Case 4: Simulate No Access Token ===`);
    const originalGetAccessToken = getAccessTokenForInstance;
    getAccessTokenForInstance = function(instance) {
        Logger.log("Simulating getAccessTokenForInstance failure.");
        return null;
    };
     const noTokenResult = getOrderByOrderId(testInstance, validOrderId);

      if (noTokenResult === null) {
        Logger.log('Test Case 4 PASSED: Correctly handled access token failure.');
          if (Logger.getLog().includes("Error: Could not retrieve access token.")){
            Logger.log("   Assertion PASSED: No Access Token error was logged as expected");
          } else{
            Logger.log("  Assertion FAILED: Expected No Access Token error, but didn't find it in logs");
          }
      } else {
        Logger.log('Test Case 4 FAILED:  Unexpected result when access token retrieval fails.');
      }
      getAccessTokenForInstance = originalGetAccessToken; // Restore.

    Logger.log(`\n=== Test Complete. Review the logs above for results. ===`);
}