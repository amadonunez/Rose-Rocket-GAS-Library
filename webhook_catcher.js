/**
 * Handles incoming POST requests from the Rose Rocket webhook.
 * This function is the entry point for the web app and is automatically
 * called by Google Apps Script when a POST request is received.
 * It parses the request body and extracts the `current_status` and `order_id`.
 * It also handles basic validation and error logging.
 *
 * @param {Object} e The event object provided by Apps Script on webhook trigger.
 *               This object contains information about the incoming request.
 * @returns {Object} A ContentService response object, as required by Apps Script web apps.
 *                   Returns a JSON object with a "success" status and either the extracted data or an error message.
 */
function doPost(e) {
  try {
    // Check if the request has a body
    if (!e || !e.postData || !e.postData.contents) {
      Logger.log('Error: Webhook request is missing postData or contents.');
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Missing postData' })).setMimeType(ContentService.MimeType.JSON);
    }

    // Parse the JSON payload (request body)
    let payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseError) {
      Logger.log(`Error: Failed to parse webhook JSON payload: ${parseError}`);
      Logger.log(`Raw payload: ${e.postData.contents}`);
       return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Invalid JSON payload' })).setMimeType(ContentService.MimeType.JSON);
    }

    // Validate that required fields are present in the payload
    if (!payload.event || !payload.current_status || !payload.order_id) {
      Logger.log('Error: Webhook payload is missing required fields (event, current_status, or order_id).');
      Logger.log(`Payload: ${JSON.stringify(payload)}`);
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Missing required fields' })).setMimeType(ContentService.MimeType.JSON);
    }

    // Check if the event is an order status update and the status is 'in-transit'
    if (payload.event !== 'order.status_updated') {
        Logger.log(`Info: Webhook event is not an order status update.  Event: ${payload.event}`);
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Incorrect event type', event: payload.event })).setMimeType(ContentService.MimeType.JSON); // Don't process if it's not the correct event.
    }

    if (payload.current_status !== 'in-transit') {
        Logger.log(`Info: Order status is not 'in-transit'.  Current status: ${payload.current_status}`);
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Incorrect status', status: payload.current_status })).setMimeType(ContentService.MimeType.JSON);  // Or handle other statuses as needed.
    }

    // Extract the relevant data
    const currentStatus = payload.current_status;
    const orderId = payload.order_id;

    // Return a success response
    return ContentService.createTextOutput(JSON.stringify({ success: true, data: { current_status: currentStatus, order_id: orderId } })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log(`Error in doPost: ${error}`);
    Logger.log(`Event object: ${JSON.stringify(e)}`); // Log the entire event object for debugging
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Internal server error' })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 *  Example usage of simulating a webhook request.
 *  This is for testing purposes only.  In a real deployment,
 *  Apps Script would automatically call doPost(e) when a webhook is received.
 */
function testWebhook() {

    // Simulate a webhook event object (replace with actual data from a real webhook)
    const mockEvent = {
        postData: {
            contents: JSON.stringify({
                event: 'order.status_updated',
                previous_status: 'dispatched',
                current_status: 'in-transit',
                order_id: 'test_order_id_123',
                timestamp: '2025-03-13T17:21:01.741996Z',
            }),
        },
    };

    const response = doPost(mockEvent);
  Logger.log(response.getContent());


    //Simulate a second case
     const mockEvent2 = {
        postData: {
            contents: JSON.stringify({
                event: 'order.status_updated',
                previous_status: 'dispatched',
                current_status: 'created', //different status
                order_id: 'test_order_id_123',
                timestamp: '2025-03-13T17:21:01.741996Z',
            }),
        },
    };

    const response2 = doPost(mockEvent2);
     Logger.log(response2.getContent());

     //Simulate a third case
    const mockEvent3 = {
        postData: {
            contents: JSON.stringify({
                event: 'order.created', //different event
                previous_status: 'dispatched',
                current_status: 'created',
                order_id: 'test_order_id_123',
                timestamp: '2025-03-13T17:21:01.741996Z',
            }),
        },
    };
    const response3 = doPost(mockEvent3);
    Logger.log(response3.getContent());
}