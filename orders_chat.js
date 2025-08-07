/**
 * Posts an internal event (message) to a Rose Rocket order.
 *
 * @param {Instance} instanceName The Rose Rocket instance (from the Instance enum).
 * @param {string} orderId The ID of the order to post the event to.
 * @param {string} message The message to post in the internal event.
 * @return {boolean} True if the event was posted successfully, false otherwise.
 */
function postRoserocketInternalNote(instanceName, orderId, message) {

  // Validate instanceName
  if (!Object.values(Instance).includes(instanceName)) {
    Logger.log(`Error: Invalid instance: ${instanceName}. Use one of: ${Object.values(Instance).join(', ')}`);
    return false;
  }

  const instanceConfig = instanceManager.getConfig(instanceName); //INSTANCES[instanceName]; // Get the config
  const API_ENDPOINT = `https://athn.roserocket.com/api/v1/orders/${orderId}/internal_events`; // Use template literal

  const accessToken = getAccessTokenForInstance(instanceName); // Pass instanceName
  if (!accessToken) {
    Logger.log('Failed to get access token. Aborting.');
    return false;
  }

  const payload = {
    author: instanceConfig.USERNAME, // Or get the author dynamically if needed
    type: 'order-note', // Or make this a parameter if you need other types
    text: message, // Use the provided message
  };

  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  try {
    const response = UrlFetchApp.fetch(API_ENDPOINT, options);
    const responseCode = response.getResponseCode();

    if (responseCode >= 200 && responseCode < 300) {
      Logger.log('Successfully posted event.');
      Logger.log('nuevos comentarios')
      Logger.log(response.getContentText());
      return true; // Indicate success
    } else {
      Logger.log(`Error posting event. Response code: ${responseCode}`);
      Logger.log(response.getContentText());
      return false; // Indicate failure
    }
  } catch (error) {
    Logger.log('Error posting event:' + error);
    return false; // Indicate failure
  }
}


function testPostRoserocketInternalEvent() {
  // Get order IDs for each instance using searchOrders
  const instanceOrderIds = {};

  for (const instance of Object.values(Instance)) { // Iterate through the enum values
    const orders = searchOrders('in_status_ids=delivered', instance); // Get orders for the instance

    if (orders && orders.length > 0) {
      instanceOrderIds[instance] = orders[0].id; // Store the first order ID found
      Logger.log(`Found order ID ${orders[0].id} for instance ${instance}`);
    } else {
      Logger.log(`No orders found for instance ${instance}. Skipping test for this instance.`);
    }
  }

  // Now run tests for each instance that has an order ID
  for (const [instance, orderId] of Object.entries(instanceOrderIds)) {
    // Test case 1: Valid instance, valid order ID, valid message
    const message1 = `Test message 1 for ${instance}`;
    const success1 = postRoserocketInternalNote(instance, orderId, message1);
    Logger.log(`Test Case 1 (${instance}): ${success1 ? 'Passed' : 'Failed'}`);

    // Test case 4: Empty message
    const message4 = ''; // Empty message
    const success4 = postRoserocketInternalNote(instance, orderId, message4);
    Logger.log(`Test Case 4 (${instance}): ${success4 ? 'Passed' : 'Failed'}`);

  }

  // Test case 2: Invalid instance (run *after* the loop)
  const orderId2 = 'some_order_id'; // Placeholder
  const message2 = 'Test message 2';
  const success2 = postRoserocketInternalNote('InvalidInstance', orderId2, message2);
  Logger.log(`Test Case 2 (Invalid Instance): ${success2 === false ? 'Passed' : 'Failed'}`);

  // Test case 3: Invalid order ID
  const orderId3 = 'invalid_order_id';
  const message3 = 'Test message 3';
  const success3 = postRoserocketInternalNote(Instance.AMADO, orderId3, message3);
  Logger.log(`Test Case 3 (Invalid Order ID): ${success3 === false ? 'Passed' : 'Failed'}`);
}

