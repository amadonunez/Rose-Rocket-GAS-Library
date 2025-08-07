function getAssigneesForManifest(instanceName, manifestId) {
    const functionName = 'getAssigneesForManifest'; // For logging context
    Logger.log(`${functionName}: Fetching assignees for manifest ${manifestId} in instance ${instanceName}.`);

    // 1. Get Access Token
    const accessToken = getAccessTokenForInstance(instanceName); // Assuming this function exists and is accessible
    if (!accessToken) {
        Logger.log(`${functionName}: Failed to get access token for ${instanceName}.`);
        return null;
    }

    // 2. Get Instance Base URL
    let baseUrl;
    try {
        if (typeof instanceManager === 'undefined' || typeof instanceManager.getInstanceBaseURL !== 'function') {
             Logger.log(`Error in ${functionName}: instanceManager or instanceManager.getInstanceBaseURL is not defined.`);
             return null;
        }
        baseUrl = instanceManager.getInstanceBaseURL(instanceName);
        if (!baseUrl) {
            Logger.log(`Error in ${functionName}: instanceManager.getInstanceBaseURL returned null or empty for instance ${instanceName}.`);
            return null;
        }
    } catch (configError) {
         Logger.log(`Error in ${functionName} while getting base URL for ${instanceName}: ${configError}`);
         return null;
    }

    // 3. Construct the API Endpoint URL
    const assigneesUrl = `${baseUrl}/api/v1/master_trips/${manifestId}/assignees`;
    Logger.log(`${functionName}: Requesting URL: ${assigneesUrl}`);

    // 4. Prepare UrlFetchApp Options
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        muteHttpExceptions: true,
    };

    // 5. Make the API Call
    try {
        const response = UrlFetchApp.fetch(assigneesUrl, options);
        const responseCode = response.getResponseCode();
        const responseBody = response.getContentText();

        // 6. Handle Response
        if (responseCode >= 200 && responseCode < 300) {
            // Success case
            try {
                const responseData = JSON.parse(responseBody);

                // *** MODIFIED PART: Access the assignees data ***
                // Check if the response itself is an array of assignees
                if (responseData && Array.isArray(responseData.data)) {
                    Logger.log(`${functionName}: Successfully retrieved ${responseData.data.length} assignees for manifest ${manifestId}.`);
                    return responseData.data; // Return the actual assignees array
                }
                else {
                    // Log unexpected structure if data or data.assignees is missing/wrong type
                    Logger.log(`${functionName}: Unexpected response structure for manifest ${manifestId}. Expected 'data' array.`);
                    Logger.log(`Response Body: ${responseBody}`);
                    // Return empty array as it implies no usable assignees were found in the expected place
                    return [];
                }
            } catch (parseError) {
                Logger.log(`${functionName}: Error parsing JSON response for manifest ${manifestId} (Status ${responseCode}). Error: ${parseError}`);
                Logger.log(`Response Body: ${responseBody}`);
                return null; // Parsing failed
            }
        } else if (responseCode === 404) {
            Logger.log(`${functionName}: Manifest ${manifestId} or its assignees not found (404 response).`);
            return []; // Return an empty array for 404
        } else {
            // Handle other API errors
            Logger.log(`${functionName}: Error fetching assignees for manifest ${manifestId}. Response Code: ${responseCode}`);
            Logger.log(`Response Body: ${responseBody}`);
            return null; // Return null for other errors
        }
    } catch (fetchError) {
        Logger.log(`${functionName}: Critical error during UrlFetchApp.fetch for manifest ${manifestId}: ${fetchError}. Stack: ${fetchError.stack}`);
        return null;
    }
}

function test_getAssignees(){
  // Replace Instance.AMADO and a valid manifest ID
  const assignees = getAssigneesForManifest(Instance.AMADO, 'c9ecfd46-4aaf-4a39-8934-7efb713ca0f2');
  Logger.log(assignees);
}

// function getAssigneesForManifest(instanceName, manifestId) {
//     const functionName = 'getAssigneesForManifest'; // For logging context
//     Logger.log(`${functionName}: Fetching assignees for manifest ${manifestId} in instance ${instanceName}.`);

//     // 1. Get Access Token
//     const accessToken = getAccessTokenForInstance(instanceName); // Assuming this function exists and is accessible
//     if (!accessToken) {
//         Logger.log(`${functionName}: Failed to get access token for ${instanceName}.`);
//         return null;
//     }

//     // 2. Get Instance Base URL
//     let baseUrl;
//     try {
//         if (typeof instanceManager === 'undefined' || typeof instanceManager.getInstanceBaseURL !== 'function') {
//              Logger.log(`Error in ${functionName}: instanceManager or instanceManager.getInstanceBaseURL is not defined.`);
//              return null;
//         }
//         baseUrl = instanceManager.getInstanceBaseURL(instanceName);
//         if (!baseUrl) {
//             Logger.log(`Error in ${functionName}: instanceManager.getInstanceBaseURL returned null or empty for instance ${instanceName}.`);
//             return null;
//         }
//     } catch (configError) {
//          Logger.log(`Error in ${functionName} while getting base URL for ${instanceName}: ${configError}`);
//          return null;
//     }

//     // 3. Construct the API Endpoint URL
//     const assigneesUrl = `${baseUrl}/api/v1/master_trips/${manifestId}/assignees`;
//     Logger.log(`${functionName}: Requesting URL: ${assigneesUrl}`);

//     // 4. Prepare UrlFetchApp Options
//     const options = {
//         method: 'GET',
//         headers: {
//             'Authorization': `Bearer ${accessToken}`,
//             'Content-Type': 'application/json',
//         },
//         muteHttpExceptions: true,
//     };

//     // 5. Make the API Call
//     try {
//         const response = UrlFetchApp.fetch(assigneesUrl, options);
//         const responseCode = response.getResponseCode();
//         const responseBody = response.getContentText();

//         // 6. Handle Response
//         if (responseCode >= 200 && responseCode < 300) {
//             // Success case
//             try {
//                 const responseData = JSON.parse(responseBody);

//                 // *** MODIFIED PART: Access the assignees data ***
//                 // Check if 'data' object exists and 'assignees' array exists within it. Adjusted to accommodate different possible data structures.
//                 if (responseData && typeof responseData.data === 'object' && responseData.data !== null && Array.isArray(responseData.data.assignees)) {
//                     const assigneesArray = responseData.data.assignees;
//                     Logger.log(`${functionName}: Successfully retrieved ${assigneesArray.length} assignees for manifest ${manifestId}.`);
//                     return assigneesArray; // Return the actual assignees array
//                 } else if (responseData && Array.isArray(responseData)) {
//                     // Handle the case where the response itself is an array of assignees
//                     Logger.log(`${functionName}: Successfully retrieved ${responseData.length} assignees for manifest ${manifestId}.`);
//                     return responseData;
//                 }
//                 else {
//                     // Log unexpected structure if data or data.assignees is missing/wrong type
//                     Logger.log(`${functionName}: Unexpected response structure for manifest ${manifestId}. Expected 'data.assignees' array or a direct array.`);
//                     Logger.log(`Response Body: ${responseBody}`);
//                     // Return empty array as it implies no usable assignees were found in the expected place
//                     return [];
//                 }
//             } catch (parseError) {
//                 Logger.log(`${functionName}: Error parsing JSON response for manifest ${manifestId} (Status ${responseCode}). Error: ${parseError}`);
//                 Logger.log(`Response Body: ${responseBody}`);
//                 return null; // Parsing failed
//             }
//         } else if (responseCode === 404) {
//             Logger.log(`${functionName}: Manifest ${manifestId} or its assignees not found (404 response).`);
//             return []; // Return an empty array for 404
//         } else {
//             // Handle other API errors
//             Logger.log(`${functionName}: Error fetching assignees for manifest ${manifestId}. Response Code: ${responseCode}`);
//             Logger.log(`Response Body: ${responseBody}`);
//             return null; // Return null for other errors
//         }
//     } catch (fetchError) {
//         Logger.log(`${functionName}: Critical error during UrlFetchApp.fetch for manifest ${manifestId}: ${fetchError}. Stack: ${fetchError.stack}`);
//         return null;
//     }
// }



// function test_getAssignees(){
//   // Replace Instance.AMADO and a valid manifest ID
//   const assignees = getAssigneesForManifest(Instance.AMADO, 'c9ecfd46-4aaf-4a39-8934-7efb713ca0f2');
// }