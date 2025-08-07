/**
 * Retrieves a manifest by its ID from the Rose Rocket API.
 *
 * @param {string} instanceName The name of the Rose Rocket instance.
 * @param {string} manifestId The Rose Rocket manifest ID.
 * @returns {object|null} The manifest object if found, or null if not found or on error.
 */
function getManifestById(instanceName, manifestId) {
    const accessToken = getAccessTokenForInstance(instanceName);
    if (!accessToken) {
        Logger.log(`getManifestById: Failed to get access token for ${instanceName}.`);
        return null;
    }

    const config = instanceManager.getConfig(instanceName);
    if (!config) {
        Logger.log(`Error: Could not retrieve configuration for instance: ${instanceName}`);
        return null;
    }
    const baseUrl = `https://platform.roserocket.com`;

    const manifestUrl = `${baseUrl}/api/v1/manifests/${manifestId}`;  // Correct endpoint
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        muteHttpExceptions: true,
    };

    try {
        const response = UrlFetchApp.fetch(manifestUrl, options);
        const responseCode = response.getResponseCode();

        if (responseCode >= 200 && responseCode < 300) {
            return JSON.parse(response.getContentText()); // Return the parsed manifest object
        } else {
            Logger.log(`getManifestById: Error fetching manifest ${manifestId}. Response Code: ${responseCode}`);
            Logger.log(response.getContentText());
            return null;
        }
    } catch (error) {
        Logger.log(`getManifestById: Error: ${error}`);
        return null;
    }
}
/**
 * Example usage of getManifestById.
 */
function testGetManifest_Sonot() {
    const instanceName = Instance.SONOT;  // Replace with your instance
    // Example manifest ID from previous examples.  Replace with a *real* manifest ID from your system.
    const manifestId = '94850ba5-d789-475a-bc31-640fb6f9d069'; // Example from multi-leg, in-transit order (Leg 1)
    //const manifestId = 'adfa044b-d4df-41fd-8047-27b95665cfdc'; // Example: manifest_id of first leg from second provided example
    //const manifestId = 'e8ef0481-35b5-41a5-86d2-01f675937b94'// Example manifest from leg 3 in the second example you gave
    //const manifestId = 'e3e14060-f5bd-473d-a203-396f91c73cb1'; // Example from delivered order (single leg).
     //const manifestId = '883b49ac-49c4-4126-8e47-e90f7348f1c9' // Example manifest from the second leg in the delivered example you provided
    //const manifestId = 'fe8bcd3b-1f64-487b-8d50-6845ffc94fd9';// Example manifest from leg 1 in "in-transit" example

    const manifest = getManifestById(instanceName, manifestId);

    if (manifest) {
        Logger.log(`Manifest Data for manifest ID ${manifestId}:`);
        Logger.log(JSON.stringify(manifest, null, 2)); // Pretty-print the JSON
    } else {
        Logger.log(`Failed to retrieve manifest for manifest ID ${manifestId}.`);
    }
}

/**
 * Example usage of getManifestById.
 */
function testGetManifest_Amado() {
    const instanceName = Instance.AMADO;  // Replaced with Instance.AMADO
    // Example manifest ID from previous examples.  Replace with a *real* manifest ID from your system.
    const manifestId = 'c9ecfd46-4aaf-4a39-8934-7efb713ca0f2'; // Example from multi-leg, in-transit order (Leg 1)
    //const manifestId = 'adfa044b-d4df-41fd-8047-27b95665cfdc'; // Example: manifest_id of first leg from second provided example
    //const manifestId = 'e8ef0481-35b5-41a5-86d2-01f675937b94'// Example manifest from leg 3 in the second example you gave
    //const manifestId = 'e3e14060-f5bd-473d-a203-396f91c73cb1'; // Example from delivered order (single leg).
     //const manifestId = '883b49ac-49c4-4126-8e47-e90f7348f1c9' // Example manifest from the second leg in the delivered example you provided
    //const manifestId = 'fe8bcd3b-1f64-487b-8d50-6845ffc94fd9';// Example manifest from leg 1 in "in-transit" example

    const manifest = getManifestById(instanceName, manifestId);

    if (manifest) {
        Logger.log(`Manifest Data for manifest ID ${manifestId}:`);
        Logger.log(JSON.stringify(manifest, null, 2)); // Pretty-print the JSON
    } else {
        Logger.log(`Failed to retrieve manifest for manifest ID ${manifestId}.`);
    }
}