/**
 * Retrieves details for a specific customer from the Rose Rocket API, including custom fields.
 *
 * @param {string} instanceName The name of the Rose Rocket instance.
 * @param {string} customerId The Rose Rocket customer ID.
 * @returns {object|null} The customer object if found, or null on error.
 */
function getCustomerDetails(instanceName, customerId) {
    const accessToken = getAccessTokenForInstance(instanceName);
    if (!accessToken) {
        Logger.log(`getCustomerDetails: Failed to get access token for ${instanceName}.`);
        return null;
    }

     const config = instanceManager.getConfig(instanceName);
    if (!config) {
        Logger.log(`Error: Could not retrieve configuration for instance: ${instanceName}`);
        return null;
    }
    const baseUrl = `https://platform.roserocket.com`;
    // Construct API URL to get customer by ID.
    const customerUrl = `${baseUrl}/api/v1/customers/${customerId}`;

    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        muteHttpExceptions: true,
    };

    try {
        const response = UrlFetchApp.fetch(customerUrl, options);
        const responseCode = response.getResponseCode();

        if (responseCode >= 200 && responseCode < 300) {
            const parsedResponse = JSON.parse(response.getContentText());
            // Check if the 'customer' property exists and return it directly
            if (parsedResponse && parsedResponse.customer) {
                return parsedResponse.customer; // Return the unwrapped customer object
            } else {
                Logger.log(`getCustomerDetails: Unexpected response format. Missing 'customer' property. Response: ${response.getContentText()}`);
                return null;
            }
        } else {
            Logger.log(`getCustomerDetails: Error fetching customer details for customer ID ${customerId}. Response Code: ${responseCode}`);
            Logger.log(response.getContentText());
            return null;
        }
    } catch (error) {
        Logger.log(`getCustomerDetails: Error: ${error}`);
        return null;
    }
}

/**
 * Example usage of getCustomerDetails.
 */
function testGetCustomerDetails() {
    const instanceName = Instance.AMADO; // Replace with your instance, e.g., Instance.SONOT if needed
    const customerId = '7caf07d5-8667-4d8a-aaa3-72180c6ac095'; // The provided customer ID

    const customerDetails = getCustomerDetails(instanceName, customerId);

    if (customerDetails) {
        Logger.log('Customer Details:');
        Logger.log(JSON.stringify(customerDetails, null, 2)); // Pretty-print the JSON

        // Example of accessing specific properties:
        Logger.log(`Customer Name: ${customerDetails.name}`);
        Logger.log(`Customer External ID: ${customerDetails.external_id}`); // This is where the MPID will be

        // Example of accessing custom fields (if they exist)
        if (customerDetails.custom_fields && Array.isArray(customerDetails.custom_fields)) {
            Logger.log('Custom Fields:');
            customerDetails.custom_fields.forEach(field => {
                Logger.log(`  Field Name: ${field.custom_field_config_field.field_name}, Value: ${field.field_value.value}`);
            });
        }


    } else {
        Logger.log('Failed to retrieve customer details.');
    }
}