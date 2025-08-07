/**
 * Retrieves the equipment assigned to a given Rose Rocket manifest.
 *
 * @param {string} instanceName The name of the Rose Rocket instance.
 * @param {string} manifestId The Rose Rocket manifest ID.
 * @returns {Array<object>|null} An array of equipment objects if found, or null
 *   if no equipment is found or an error occurs.
 */
function getEquipmentForManifest(instanceName, manifestId) {
    const accessToken = getAccessTokenForInstance(instanceName);
    if (!accessToken) {
        Logger.log(`getEquipmentForManifest: Failed to get access token for ${instanceName}.`);
        return null;
    }

    const config = instanceManager.getConfig(instanceName);
    if (!config) {
        Logger.log(`Error: Could not retrieve configuration for instance: ${instanceName}`);
        return null;
    }
    const baseUrl = `https://platform.roserocket.com`;

    const equipmentUrl = `${baseUrl}/api/v1/manifests/${manifestId}/equipment`;
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        muteHttpExceptions: true,
    };

    try {
        const response = UrlFetchApp.fetch(equipmentUrl, options);
        const responseCode = response.getResponseCode();

        if (responseCode >= 200 && responseCode < 300) {
            const equipmentData = JSON.parse(response.getContentText());

              // Check if equipmentData is an array
            if (Array.isArray(equipmentData)) {
                return equipmentData; // Return the array of equipment objects
            } else {
                Logger.log(`getEquipmentForManifest: Unexpected response format. Expected an array, got: ${typeof equipmentData}`);
                Logger.log(`Response: ${response.getContentText()}`);
                return null; // Unexpected format
              }
        } else {
            Logger.log(`getEquipmentForManifest: Error fetching equipment for manifest ${manifestId}. Response Code: ${responseCode}`);
            Logger.log(response.getContentText());
            return null;
        }
    } catch (error) {
        Logger.log(`getEquipmentForManifest: Error: ${error}`);
        return null;
    }
}

/**
 * Example usage of getEquipmentForManifest.
 */
function testGetEquipment() {
    const instanceName = Instance.AMADO;
    const manifestId = 'fe8bcd3b-1f64-487b-8d50-6845ffc94fd9'; //  Manifest from your "in-transit" example.

    const equipment = getEquipmentForManifest(instanceName, manifestId);

    if (equipment) {
        Logger.log(`Equipment for manifest ${manifestId}:`);
        Logger.log(JSON.stringify(equipment, null, 2)); // Pretty-print the equipment array
    } else {
        Logger.log(`Failed to retrieve equipment for manifest ${manifestId}.`);
    }
}

/**
 * Retrieves the truck number (equipment name) associated with a given manifest.
 * This function now directly calls getEquipmentForManifest.
 *
 * @param {string} instanceName The name of the Rose Rocket instance.
 * @param {string} manifestId The Rose Rocket manifest ID.
 * @returns {string|null} The truck number (equipment name) if found, or null otherwise.
 */
function getTruckNumberForManifest(instanceName, manifestId) {
    const equipment = getEquipmentForManifest(instanceName, manifestId);

    if (!equipment) {
        return null; // Error already logged in getEquipmentForManifest
    }

    for (const equipmentEntry of equipment) {
        if (equipmentEntry && equipmentEntry.equipment_type) {
            // Correctly access the nested name property
            if (equipmentEntry.equipment_type.name === 'Vehicle') {
                if (equipmentEntry.equipment.name) {
                    return equipmentEntry.equipment.name;
                }
            }
        }
    }
    Logger.log(`getTruckNumberForManifest: Truck number not found for manifest ${manifestId}.`);
    return null; // No truck found
}
/**
 * Retrieves the trailer number (equipment name) associated with a given manifest.
 *  This function now directly calls getEquipmentForManifest.
 * @param {string} instanceName The name of the Rose Rocket instance.
 * @param {string} manifestId The Rose Rocket manifest ID.
 * @returns {string|null} The trailer number (equipment name) if found, or null otherwise.
 */
function getTrailerNumberForManifest(instanceName, manifestId) {
  const equipment = getEquipmentForManifest(instanceName, manifestId);

    if (!equipment) {
        return null; // Error already logged in getEquipmentForManifest
    }

  for (const equipmentEntry of equipment) {
    Logger.log(equipmentEntry.equipment_type.name)
    if (equipmentEntry && equipmentEntry.equipment_type) {
        // Correctly access the nested name property
        if(equipmentEntry.equipment_type.name === 'Trailer'){
          if(equipmentEntry.equipment.name){
            return equipmentEntry.equipment.name;
          }
        }
    }
  }
    Logger.log(`getTrailerNumberForManifest: Trailer number not found for manifest ${manifestId}.`);
    return null; // No trailer found
}

/**
 * Example usage of getTruckNumberForManifest.
 */
function testGetTruckNumber() {
    const instanceName = Instance.AMADO;
    const manifestId = 'fe8bcd3b-1f64-487b-8d50-6845ffc94fd9'; // Replace with a *real* manifest ID

    const truckNumber = getTruckNumberForManifest(instanceName, manifestId);

    if (truckNumber) {
        Logger.log(`Truck Number for manifest ${manifestId}: ${truckNumber}`);
    } else {
        Logger.log(`Failed to retrieve truck number for manifest ${manifestId}.`);
    }
}

/**
 *  Example usage of getTrailerNumberForManifest
 */
function testGetTrailerNumber() {
    const instanceName = Instance.AMADO;
    const manifestId = 'fe8bcd3b-1f64-487b-8d50-6845ffc94fd9'; // Replace with a *real* manifest ID

    const trailerNumber = getTrailerNumberForManifest(instanceName, manifestId);

    if (trailerNumber) {
        Logger.log(`Trailer Number for manifest ${manifestId}: ${trailerNumber}`);
    } else {
        Logger.log(`Failed to retrieve trailer number for manifest ${manifestId}.`);
    }
}