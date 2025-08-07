/**
 * InstanceManager class for managing Rose Rocket instance configurations.
 *
 * This class provides methods for:
 * - Retrieving all instance configurations (lazy-loaded from Script Properties).
 * - Retrieving the configuration for a specific instance.
 * - Setting up (or overwriting) instance configurations in Script Properties.
 * - Deleting all instance configurations from Script Properties.
 */
class InstanceManager {
  /**
   * Initializes a new InstanceManager instance.
   * @constructor
   */
  constructor() {
    this.instances = null; // Holds the loaded configurations. Starts as null.
  }

  /**
   * Retrieves all instance configurations, loading them from Script Properties
   * only once (lazy loading).
   *
   * @returns {object} An object where keys are instance names and values are
   *                   instance configuration objects.
   */
  getAllConfigs() {
    if (this.instances !== null) {
      return this.instances;
    }

    

    const scriptProperties = PropertiesService.getScriptProperties();
    const allProperties = scriptProperties.getProperties();
    this.instances = {};

    for (const instanceName in allProperties) {
      if (allProperties.hasOwnProperty(instanceName)) {
        try {
          this.instances[instanceName] = JSON.parse(allProperties[instanceName]);
        } catch (e) {
          Logger.log(`Error parsing instance config for ${instanceName}: ${e}`);
          Logger.log(`Raw property value: ${allProperties[instanceName]}`);
          // Consider throwing an error here, or skipping the invalid instance.
          continue;
        }
      }
    }

    return this.instances;
  }

    /**
     * Retrieves the configuration for a specific instance.
     *
     * @param {string} instanceName The name of the instance (e.g., "Amado").
     * @returns {object|null} The instance configuration object, or null if not found or invalid.
     */
    getConfig(instanceName){
        const allConfigs = this.getAllConfigs(); // Ensure configs are loaded
        if (!allConfigs || !allConfigs.hasOwnProperty(instanceName)) {
          Logger.log(`Error: Instance config not found for: ${instanceName}`);
            return null;
        }

      return allConfigs[instanceName];
    }

  // =============================================
  // === NEW METHOD: getInstanceBaseURL ==========
  // =============================================
  /**
   * Retrieves the base URL for a specific instance from its configuration.
   * Assumes the configuration object stored in Script Properties has a 'baseUrl' key.
   * Falls back to the platform URL if the key is missing but config exists.
   *
   * @param {string} instanceName The name of the instance (e.g., Instance.AMADO).
   * @returns {string|null} The base URL string (without trailing slash),
   *                        the default platform URL as a fallback, or null if config is missing/invalid.
   */
    getInstanceBaseURL(instanceName) {
        const config = this.getConfig(instanceName); // Use existing method to get config

        if (!config) {
            // Error already logged in getConfig if config wasn't found or was invalid
            Logger.log(`getInstanceBaseURL: Cannot determine base URL for ${instanceName} due to missing/invalid config.`);
            return null; // No config found or invalid
        }

        // Check for a non-empty SUBDOMAIN property of type string
        if (config.SUBDOMAIN && typeof config.SUBDOMAIN === 'string' && config.SUBDOMAIN.trim().length > 0) {
            const subdomain = config.SUBDOMAIN.trim(); // Trim whitespace just in case
            // Construct the URL using the subdomain
            const url = `https://${subdomain}.roserocket.com`;
            Logger.log(`getInstanceBaseURL: Using constructed subdomain URL for ${instanceName}: ${url}`);
            return url;
        } else {
            // SUBDOMAIN is missing, empty, null, undefined, or not a string - use default platform URL
            const defaultUrl = 'https://platform.roserocket.com';
            if (!config.hasOwnProperty('SUBDOMAIN')) {
                Logger.log(`getInstanceBaseURL: 'SUBDOMAIN' property missing in config for instance: ${instanceName}. Defaulting to ${defaultUrl}.`);
            } else {
                Logger.log(`getInstanceBaseURL: 'SUBDOMAIN' property is empty or invalid ('${config.SUBDOMAIN}') for instance: ${instanceName}. Defaulting to ${defaultUrl}.`);
            }
            return defaultUrl;
        }
    }

  /**
   * Checks if an instance configuration exists and was loaded correctly.
   *
   * @param {string} instanceName The name of the instance to check (e.g., "Amado"). Case-sensitive.
   * @returns {boolean} True if the instance configuration exists and was parsed successfully, false otherwise.
   */
  isValidInstance(instanceName) {
    // Ensure configurations are loaded first
    const allConfigs = this.getAllConfigs();

    // Check if instanceName is a non-empty string and exists as a key in the loaded configs
    return typeof instanceName === 'string'
           && instanceName.length > 0
           && allConfigs
           && allConfigs.hasOwnProperty(instanceName);
  }

  /**
   * Sets up (or overwrites) the instance configurations in Script Properties.
   *  IMPORTANT: Use this function *only* for initialization or updates.
   *  Ideally, manage properties through the Script Editor UI.
   * @param {object} instances an object with the instances to save
   */
    setupConfigs(instances) {

    const scriptProperties = PropertiesService.getScriptProperties();

    // Store each instance configuration as a JSON string
    for (const instanceName in instances) {
      if (instances.hasOwnProperty(instanceName)) {
        const config = instances[instanceName];
        scriptProperties.setProperty(instanceName, JSON.stringify(config));
        Logger.log(`Set config for: ${instanceName}`);
      }
     }
   }

  /**
     * Deletes all instance configurations from Script Properties.
     * Use this with caution!
     */
    deleteAllConfigs() {
        const scriptProperties = PropertiesService.getScriptProperties();
        scriptProperties.deleteAllProperties(); // Or deleteProperty() for specific keys
        Logger.log(`Deleted instance configs`);
    }

}


// Create a single, global instance of the InstanceManager.
const instanceManager = new InstanceManager();


/**
 *  Example function demonstrating how to use the InstanceManager.
 */
function testGetInstanceConfig() {
    const instanceName = Instance.SONOT; // Use the Instance enum!
    const config = instanceManager.getConfig(instanceName);

    if (config) {
      Logger.log(`Instance Config for ${instanceName}:`);
      Logger.log(`  USERNAME: ${config.USERNAME}`);
      Logger.log(`  PASSWORD: ${config.PASSWORD}`);
      Logger.log(`  CLIENT_ID: ${config.CLIENT_ID}`);
      Logger.log(`  CLIENT_SECRET: ${config.CLIENT_SECRET}`);
      Logger.log(`  SUBDOMAIN: ${config.SUBDOMAIN}`);
    } else {
      Logger.log(`Couldnt retrieve config for: ${instanceName}`);
    }
}

function getInstanceManager() {
    return new InstanceManager();
}

// --- Instance Enum ---
const Instance = {
  AMADO: 'Amado',
  SONOT: 'Sonot',
  // Add other instances here
};


/**
 * Returns the Instance enum object.
 * @returns {object} The Instance enum.
 */
function getInstanceEnum() {
    return Instance;
}


function testGetInstancedBaseURL() {
  Logger.log(instanceManager.getInstanceBaseURL(Instance.SONOT))
}


// --- Optional: Delete All Configs (Use with CAUTION!) ---
//function deleteAllInstanceConfigs() {
//    instanceManager.deleteAllConfigs();
//}

