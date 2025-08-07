// --- Example Usage ---
async function testCreateOrder() {
    const instanceName = Instance.AMADO;  // Use the Instance enum
    const customerId = "7caf07d5-8667-4d8a-aaa3-72180c6ac095"; // Replace!

  const orderData = {
    "customer": {
      "id": customerId //Required
    },
        "billing": {
          city: "Nogales",
          postal: "84090M",
          country: "MX"
        },
        "origin": { //Required
            "address_1": "525 West Monroe Street", //Required
            "city": "Chicago",//Required
            "state": "IL",//Required
            "postal": "60661",//Required
            "country": "US"//Required
        },
        "destination": { //Required
             "address_1": "1 Presidents Choice Circle",//Required
            "city": "Brampton",//Required
            "state": "ON",//Required
            "postal": "L6Y 5S5",//Required
            "country": "US"//Required
        },
        "pickup_start_at": "2024-12-01T08:00:00-05:00",
        "pickup_end_at": "2024-12-01T17:00:00-05:00",
        "delivery_start_at": "2024-12-02T08:00:00-05:00",
        "delivery_end_at": "2024-12-02T17:00:00-05:00",
        "billing_option": "prepaid", //Required
    "commodities": [ // Required, and must have at least one element
      {
        "commodity_type": "pallet", // Required
        "description": "Example Commodity", // Required
        "quantity": 1, // Required
        "measurement_unit": "inch",
        "weight_unit": "lb",
        "freight_class": "none"
       },
    ],

  };

  const result = await createBookedOrder(instanceName, customerId, orderData);

   if (result) {
        Logger.log('Order created successfully:');
        Logger.log(JSON.stringify(result, null, 2)); // Pretty-print the response
    } else {
        Logger.log('Order creation failed.  See previous logs for details.');
    }
}


function createBookedOrder(instanceName, customerId, orderData) {
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
    const apiUrl = `https://platform.roserocket.com/api/v1/customers/${customerId}/create_booked_order`;
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

  
  try {
    const response = UrlFetchApp.fetch(apiUrl, options);
    
    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();

    Logger.log('Response Code: ' + responseCode);
    Logger.log('Response Body: ' + responseBody);

    if (responseCode >= 200 && responseCode < 300) {
      // Successful response
      const jsonResponse = JSON.parse(responseBody);
      Logger.log('Order created successfully: ' + JSON.stringify(jsonResponse));
      return jsonResponse; // or do something with the data
    } else {
      // Handle error responses
      Logger.log('Error creating order. Response code: ' + responseCode + ', Body: ' + responseBody);
      // You might want to throw an error or return null to indicate failure
      return null;
    }

  } catch (e) {
    Logger.log('An error occurred: ' + e);
    return null; // Indicate failure
  }
}