/******************************************Amado Nunez*******************************************/
/**
 * @function obtenerDatosAddressBook
 * @description Retrieves address book data from the Rose Rocket API for a specific location.
 * @param {string} instanceName - The name of the Rose Rocket instance. Must be a valid value from the `Instance` enum.
 * @param {string} locationId - The unique identifier for the location.
 * @param {string} searchTerm - (Optional) A search term to filter address books.  If empty, all address books for the location are returned.
 * @returns {object | null} -  A JavaScript object containing the address book data, or null if an error occurs. The object's structure corresponds to the Rose Rocket API's response format.
 *                           Returns null if:
 *                           - The instance name is invalid.
 *                           - The instance configuration cannot be retrieved.
 *                           - An access token cannot be retrieved.
 *                           - The API request fails (e.g., invalid location ID, network error, authentication error).
 *                           - The API returns invalid JSON.
 * @throws {Error} - If the `Instance`, `instanceManager`, or `getAccessTokenForInstance` are not properly defined.
 */
function obtenerDatosAddressBook(instanceName, locationId, searchTerm) {

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

    // Construct the API URL dynamically
    const apiUrl = `https://athn.roserocket.com/api/v1/locations/${locationId}/address_books?searchTerm=${searchTerm}&offset=0&limit=50`;

    // Prepare Request Options
    const options = {
        'method': 'get',
        'contentType': 'application/json',
        'headers': {
            'Authorization': `Bearer ${accessToken}`
        },
        'muteHttpExceptions': true // Suppress HTTP exceptions and handle them manually
    };
try {
    // Make API Request
    const response = UrlFetchApp.fetch(apiUrl, options);

    // Check HTTP Status Code
    const responseCode = response.getResponseCode();

    if (responseCode >= 400) {
        Logger.log(`Error: API request failed with status code ${responseCode}.  Response: ${response.getContentText()}`);
        return null; // Or throw an error, depending on your needs
    }

    // Parse the JSON response
    const content = response.getContentText();
    const data = JSON.parse(content);

    return data;  // Return the parsed JSON

} catch (e) {
    Logger.log(`Error during API request or JSON parsing: ${e}`);
    return null; // Handle errors gracefully
}
}

/**
 * @function testObtenerDatosAddressBook
 * @description  Tests the `obtenerDatosAddressBook` function with sample data and logs the results.  This function demonstrates how to use `obtenerDatosAddressBook` and extract organization names.
 */
function testObtenerDatosAddressBook() {
    // Define your test values
    const instanceName = "Amado"; // Ensure this is a valid instance name
    const locationId = "7caf07d5-8667-4d8a-aaa3-72180c6ac095"; // Replace with a valid location ID
    const searchTerm = ""; // Replace with a search term, or leave empty for all address books.

    // Call the function
    const data = obtenerDatosAddressBook(instanceName, locationId, searchTerm);

    // Verify if the function returned data
    if (data) {
        // Extract and display the organization names
        const organizationNames = extractOrganizationNames(data);
        if (organizationNames && organizationNames.length > 0) {
            organizationNames.forEach((name) => Logger.log(name)); // Log each name individually
        } else {
            Logger.log("No se encontraron nombres de organizaciones.");
        }
    } else {
        Logger.log("No se pudieron obtener los datos del Address Book.");
    }
}

/**
 * @function extractOrganizationNames
 * @description Extracts the organization names from the address book API response.
 * @param {object} data - The JSON response from the Address Book API (the output of `obtenerDatosAddressBook`).
 * @returns {string[]} - An array containing the organization names.  Returns an empty array if:
 *                      - The JSON structure is not as expected (missing 'data' or 'address_books' properties).
 *                      - An error occurs during the extraction process.
 *                      - The 'org_name' property is missing for an address book entry (defaults to "Unknown Organization").
 */
function extractOrganizationNames(data) {
    try {
        if (data?.data?.address_books) {  // Use optional chaining for safer access
            return data.data.address_books.map(addressBook => addressBook?.org_name || "Unknown Organization"); //Handles if org_name is missing
        } else {
            Logger.log("La estructura del JSON no es la esperada.");
            return []; // Return an empty array instead of null
        }
    } catch (e) {
        Logger.log(`Error al extraer nombres de organizaciones: ${e}`);
        return []; // Return an empty array on error
    }
}