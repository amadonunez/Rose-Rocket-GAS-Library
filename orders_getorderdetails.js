/**
 * Retrieves details for a specific order from the Rose Rocket API.
 *
 * @param {string} instanceName The name of the Rose Rocket instance.
 * @param {string} orderId The Rose Rocket order ID.
 * @returns {object|null} The order object if found, or null on error.
 */
function getOrderDetails(instanceName, orderId) {
    const accessToken = getAccessTokenForInstance(instanceName);
    if (!accessToken) {
        Logger.log(`getOrderDetails: Failed to get access token for ${instanceName}.`);
        return null;
    }

    const config = instanceManager.getConfig(instanceName);
    if (!config) {
        Logger.log(`Error: Could not retrieve configuration for instance: ${instanceName}`);
        return null;
    }
    const baseUrl = `https://platform.roserocket.com`;

    // Construct API URL to get order by ID.
    const orderUrl = `${baseUrl}/api/v1/orders/${orderId}`;

    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        muteHttpExceptions: true,
    };

    try {
        const response = UrlFetchApp.fetch(orderUrl, options);
        const responseCode = response.getResponseCode();

        if (responseCode >= 200 && responseCode < 300) {
            const parsedResponse = JSON.parse(response.getContentText());
            // Check if the 'order' property exists and return it directly
            if (parsedResponse && parsedResponse.order) {
                return parsedResponse.order; // Return the unwrapped order object
            } else {
                Logger.log(`getOrderDetails: Unexpected response format. Missing 'order' property. Response: ${response.getContentText()}`);
                return null;
            }
        } else {
            Logger.log(`getOrderDetails: Error fetching order details for order ID ${orderId}. Response Code: ${responseCode}`);
            Logger.log(response.getContentText());
            return null;
        }
    } catch (error) {
        Logger.log(`getOrderDetails: Error: ${error}`);
        return null;
    }
}

// Add this test function *within* the Rose Rocket Library project
function testGetOrderDetails() {
    const instanceName = Instance.AMADO;
    const orderId = "e2f29b55-9e6a-4883-9c8a-1f1f0d8901a5"; // Use a *REAL* order ID here.

    const orderDetails = getOrderDetails(instanceName, orderId);

    if (orderDetails) {
        Logger.log('Order Details (Unwrapped):');
        Logger.log(JSON.stringify(orderDetails, null, 2)); // Pretty-print

        // Example of accessing specific properties (now directly):
        Logger.log(`Order ID: ${orderDetails.id}`); // Access directly
        Logger.log(`Customer ID: ${orderDetails.customer.id}`); // Access directly
    } else {
        Logger.log('Order not found or error occurred.');
    }
}