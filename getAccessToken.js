let ACCESS_TOKEN = {}; // Store access tokens per instance and their expiry

const RR_TOKEN_ENDPOINT = 'https://auth.roserocket.com/oauth2/token';
const A_TOKEN_ENDPOINT = RR_TOKEN_ENDPOINT; //Unused, remove it

function getAccessTokenForInstance(instanceName) {

    //const { USERNAME, PASSWORD, CLIENT_ID, CLIENT_SECRET } = INSTANCES[instanceName]; // Use instanceName
    const { USERNAME, PASSWORD, CLIENT_ID, CLIENT_SECRET } = instanceManager.getConfig(instanceName);

    // Check if a token exists and is still valid
    if (ACCESS_TOKEN[instanceName] && ACCESS_TOKEN[instanceName].token && ACCESS_TOKEN[instanceName].expires_at > Date.now()) {
        Logger.log(`Returning cached access token for ${instanceName}.`);
        return ACCESS_TOKEN[instanceName].token;
    }

    const payload = {
        grant_type: 'password',
        username: USERNAME,
        password: PASSWORD,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
    };

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true,
    };

    try {
        const response = UrlFetchApp.fetch(RR_TOKEN_ENDPOINT, options);
        const responseCode = response.getResponseCode();

        if (responseCode >= 200 && responseCode < 300) {
            const jsonResponse = JSON.parse(response.getContentText());
            const accessToken = jsonResponse.data.access_token;
            const expiresIn = jsonResponse.data.expires_in; // Get expiry time in seconds

            if (!accessToken || !expiresIn) {
                Logger.log(`Error: access_token or expires_in missing from response for ${instanceName}.`);
                Logger.log(JSON.stringify(jsonResponse)); // Log the entire response for debugging
                return null;
            }

            // Calculate expiry timestamp
            const expiresAt = Date.now() + (expiresIn * 1000);  // Convert seconds to milliseconds

            // Store the token and expiry. Use instanceName as the key.
            ACCESS_TOKEN[instanceName] = { 
                token: accessToken,
                expires_at: expiresAt,
            };

            Logger.log(`Successfully obtained new access token for ${instanceName}. Expires at: ${new Date(expiresAt)}`);

            return accessToken;
        } else {
            Logger.log(`Error getting access token for ${instanceName}. Response Code: ${responseCode}`);
            Logger.log(response.getContentText());
            return null;
        }
    } catch (error) {
        Logger.log(`Error getting access token for ${instanceName}: ${error}`);
        return null;
    }
}

