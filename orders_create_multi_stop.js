/**
 * Creates a multi-stop order for a customer using the Rose Rocket API.
 *
 * This function handles the authentication, data formatting, and API request
 * to create a multi-stop order for a specified customer in a Rose Rocket instance.
 * It validates the instance name, retrieves the configuration and access token,
 * constructs the API URL, prepares the request payload, and processes the response.
 *
 * @param {string} instanceName The name of the Rose Rocket instance (e.g., `Instance.TAYLOR`).  This should be a value from the `Instance` enum.
 * @param {string} customerId The ID of the customer for whom the order is being created.
 * @param {object} orderData The order data in JSON format.  This object should conform to the expected structure for the `multistop_orders` endpoint.  Refer to the Rose Rocket API documentation for details on the required fields and format.
 *                 Example:
 *                 ```
 *                 {
 *                     "order_number": "ORDER-123",
 *                     "customer_reference": "REF-456",
 *                     "stops": [
 *                         {
 *                             "location_id": "LOCATION-A",
 *                             "expected_arrival_date": "2024-10-27T08:00:00-04:00",
 *                             "type": "pickup"
 *                         },
 *                         {
 *                             "location_id": "LOCATION-B",
 *                             "expected_arrival_date": "2024-10-28T17:00:00-04:00",
 *                             "type": "delivery"
 *                         }
 *                     ],
 *                     // ... other order details
 *                 }
 *                 ```
 *
 * @returns {object | null} Returns the JSON response from the API if the order creation is successful.
 *                         Returns `null` if there is an error during the process, such as:
 *                         - Invalid instance name
 *                         - Unable to retrieve configuration
 *                         - Unable to retrieve access token
 *                         - API request fails
 *                         - JSON parsing error
 *
 * @throws {Error} Throws an error if `UrlFetchApp.fetch` fails, unless `muteHttpExceptions` is set to `true`.
 *
 * @customfunction
 */
function createOrderMultiStopTaylor(instanceName, customerId, orderData) {
    // Validate Instance Name
    if (!Object.values(Instance).includes(instanceName)) {
        Logger.log(`Error: Invalid instance name: ${instanceName}`);
        return null;
    }

    // Get Instance Configuration
    const config = instanceManager.getConfig(instanceName);
    if (!config) {
        Logger.log(`Error: Could not retrieve configuration for instance: ${instanceName}`);
        return null;
    }

    // Get Access Token
    const accessToken = getAccessTokenForInstance(instanceName);
    if (!accessToken) {
        Logger.log(`Error: Could not retrieve access token for instance: ${instanceName}`);
        return null;
    }

    // Construct API URL
    const apiUrl = `https://platform.roserocket.com/api/v1/customers/${customerId}/multistop_orders`;

    Logger.log(`API URL: ${apiUrl}`);

    // Prepare Request Options
    const options = {
        'method': 'post',
        'contentType': 'application/json',
        'headers': {
            'Authorization': `Bearer ${accessToken}`
        },
        'payload': JSON.stringify(orderData),
        'muteHttpExceptions': true
    };

    // Make API Request
    const response = UrlFetchApp.fetch(apiUrl, options);
    const statusCode = response.getResponseCode();
    const responseText = response.getContentText();

    // Process Response
    if (statusCode >= 200 && statusCode < 300) {
        try {
            return JSON.parse(responseText);
        } catch (e) {
            Logger.log(`Error parsing JSON response for instance ${instanceName}: ${e}`);
            Logger.log(`Raw response content: ${responseText}`);
            return null;
        }
    } else {
        Logger.log(`Error creating order for instance ${instanceName}, customer ${customerId}: Status Code ${statusCode}, Response: ${responseText}`);
        return null;
    }
}
