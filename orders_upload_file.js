
/**
 * Uploads a file to a specified order in Rose Rocket, using the customer-specific API.
 *
 * @param {string} instance The Rose Rocket instance name.
 * @param {string} orderId The ID of the order.
 * @param {Blob} fileBlob The file blob to upload.
 * @param {string} [fileType] Optional. The type of file. Defaults to "other".
 * @param {string} [description] Optional. A description for the file.
 * @returns {object|null} The API response object on success, or null on error.
 */
async function uploadFileToOrder(instance, orderId, fileBlob, fileType = "other", description = "filename") {
    // Instance validation
    if (!Object.values(Instance).includes(instance)) {
        Logger.log(`Error: Invalid instance: ${instance}. Use one of: ${Object.values(Instance).join(', ')}`);
        return null;
    }

    // const instanceConfig = INSTANCES[instance];
    const instanceConfig = instanceManager.getConfig(instance)

    // Check for the SUBDOMAIN property
    if (!instanceConfig.SUBDOMAIN) {
        Logger.log(`Error: SUBDOMAIN not defined for instance: ${instance}`);
        return null;
    }

    // --- Filename Validation ---
    if (description) {  // Only validate if a description is provided
        if (!isValidFilename(description)) {
            Logger.log(`Error: Invalid filename provided in description: ${description}`);
            return null; // Or throw an error: throw new Error("Invalid filename in description");
        }
    }

    // Get the access token
    const accessToken = getAccessTokenForInstance(instance);
    if (!accessToken) {
        Logger.log("Error: Could not retrieve access token.");
        return null;
    }


    // Construct the API URL using the subdomain
    const apiUrl = `https://${instanceConfig.SUBDOMAIN}.roserocket.com/api/v1/orders/${orderId}/files/upload_file`;
    Logger.log(`Upload URL: ${apiUrl}`);

    // Prepare the payload, including the description
    const formData = {
        'file': fileBlob,
        'type': fileType,
        'description': description // Add the description to the form data
    };

    const options = {
        'method': 'post',
        'headers': {
            'Authorization': `Bearer ${accessToken}`
        },
        'payload': formData,
        'muteHttpExceptions': true
    };

    const response = UrlFetchApp.fetch(apiUrl, options);
    const responseCode = response.getResponseCode();
    Logger.log(`API Response Code: ${responseCode}`);

    if (responseCode === 200) {
        try {
            return JSON.parse(response.getContentText());
        } catch (e) {
            Logger.log(`Error parsing JSON response: ${e}`);
            Logger.log(`Raw response content: ${response.getContentText()}`);
            return null;
        }
    } else if (responseCode === 400) {
         Logger.log(`Bad Request (400): ${response.getContentText()}`);
        return null;
    } else {
        Logger.log(`API Error: ${responseCode} - ${response.getContentText()}`);
        return null;
    }
}


/**
 * Test function for uploadFileToOrder.  Uploads a test file from Google Drive.
 */
async function testUploadFileToOrder2() {
  // --- Configuration (Replace with your actual values) ---
  const testInstance = Instance.AMADO; // Replace with your valid instance.
  const validOrderId = '22aeaf86-7953-4648-8594-89182af34395'; //  Replace with a *known* valid order ID.
  const testFileId = '1h4-rqNJlT9kYaLIy-eoAhjHp4Ps83_rE';   // Replace with the ID of a test file in *your* Google Drive.
                                          //  Make it a small, harmless file (e.g., a text file).
  const fileType = 'other';       // Optional file type.

  // --- Get the file blob from Google Drive ---
  let fileBlob;
  let file;
  try {
    file = DriveApp.getFileById(testFileId);
    fileBlob = file.getBlob();
  } catch (error) {
    Logger.log(`Error getting file from Drive: ${error}`);
    return; // Exit if we can't get the file
  }

  // --- Test Cases ---

  // Test Case 1: Valid Order ID and File
  Logger.log(`=== Test Case 1: Valid Order ID and File ===`);
  Logger.log(file.getName())
  const uploadResult = await uploadFileToOrder(testInstance, validOrderId, fileBlob, fileType, file.getName());

  if (uploadResult) {
    Logger.log('Test Case 1 PASSED: File uploaded successfully.');
    // Add assertions based on the *expected* response from the upload API.
    // (You'll need to consult the Rose Rocket API documentation for the
    //  exact structure of the successful response.)
    // Example (replace with the actual expected properties):
    if (uploadResult.success) { // Assuming the API returns a 'success' property
      Logger.log("  Assertion PASSED: API reported success.");
    } else {
      Logger.log("  Assertion FAILED: API did not report success.");
      Logger.log(`    Response: ${JSON.stringify(uploadResult)}`); // Log the full response
    }
    // Add more assertions here as needed, based on the API docs.

  } else {
    Logger.log('Test Case 1 FAILED: File upload failed.'); // Error details are logged by uploadFileToOrder
  }
}


async function testUploadFileToOrder() {
  // --- Configuration (Replace with your actual values) ---
  const testInstance = Instance.AMADO; // Replace with your valid instance.
  const validOrderId = 'f5b2e8e0-a89b-4382-a07d-cc8acd26b886'; //  Replace with a *known* valid order ID.
  const testFileId = '1WPQJDNM4mnRHihbHN_JBmzh96TJRh_F1';   // Replace with the ID of a test file in *your* Google Drive.
                                          //  Make it a small, harmless file (e.g., a text file).
  const fileType = 'other';       // Optional file type.

  // --- Get the file blob from Google Drive ---
  let fileBlob;
  let file;
  try {
    file = DriveApp.getFileById(testFileId);
    fileBlob = file.getBlob();
  } catch (error) {
    Logger.log(`Error getting file from Drive: ${error}`);
    return; // Exit if we can't get the file
  }

  // --- Test Cases ---

  // Test Case 1: Valid Order ID and File
  Logger.log(`=== Test Case 1: Valid Order ID and File ===`);
  Logger.log(file.getName())
  const uploadResult = await uploadFileToOrder(testInstance, validOrderId, fileBlob, fileType, file.getName());

  if (uploadResult) {
    Logger.log('Test Case 1 PASSED: File uploaded successfully.');
    // Add assertions based on the *expected* response from the upload API.
    // (You'll need to consult the Rose Rocket API documentation for the
    //  exact structure of the successful response.)
    // Example (replace with the actual expected properties):
    if (uploadResult.success) { // Assuming the API returns a 'success' property
      Logger.log("  Assertion PASSED: API reported success.");
    } else {
      Logger.log("  Assertion FAILED: API did not report success.");
      Logger.log(`    Response: ${JSON.stringify(uploadResult)}`); // Log the full response
    }
    // Add more assertions here as needed, based on the API docs.

  } else {
    Logger.log('Test Case 1 FAILED: File upload failed.'); // Error details are logged by uploadFileToOrder
  }


    // Test Case 2: Invalid Order ID
    const invalidOrderId = "INVALID_ORDER";
    Logger.log(`\n=== Test Case 2: Invalid Order ID ===`);
      const invalidOrderResult = await uploadFileToOrder(testInstance, invalidOrderId, fileBlob, fileType);
      if (invalidOrderResult === null) {
        Logger.log('Test Case 2 PASSED:  Correctly returned null for invalid order ID.');
        // Check for expected error messages in the log.  We expect:
        //  - "Error: Could not retrieve order details..."  (from uploadFileToOrder)
        //  - "Order Not Found (404)" (from getOrderByOrderId)

        if (Logger.getLog().includes("Error: Could not retrieve order details") &&
            Logger.getLog().includes("Order Not Found (404)")) {
           Logger.log(" Assertion PASSED: Expected error messages found in logs.");
        } else {
          Logger.log(" Assertion FAILED: Expected error messages not found in logs.");
        }

      } else {
        Logger.log('Test Case 2 FAILED:  Unexpectedly returned a value for an invalid order ID.');
      }

  // Test Case 3: Invalid Instance
    Logger.log(`\n=== Test Case 3: Invalid Instance ===`);
    const invalidInstanceResult = await uploadFileToOrder("invalid_instance", validOrderId, fileBlob, fileType);

    if (invalidInstanceResult === null) {
      Logger.log('Test Case 3 PASSED: Correctly returned null for an invalid instance.');
      if(Logger.getLog().includes("Error: Invalid instance")){
        Logger.log(" Assertion PASSED: Invalid Instance error found");
      } else{
        Logger.log(" Assertion FAILED: Invalid instance error not found");
      }
    } else {
      Logger.log('Test Case 3 FAILED: Unexpectedly returned a value for an invalid instance.');
    }


    // Test Case 4: Simulate No Access Token
    Logger.log(`\n=== Test Case 4: No Access Token ===`);
    const originalGetAccessToken = getAccessTokenForInstance;
    getAccessTokenForInstance = () => {
        Logger.log("Simulating getAccessToken failure");
        return null;
    };
    const tokenFailResult = await uploadFileToOrder(testInstance, validOrderId, fileBlob, fileType);

    if(tokenFailResult === null){
        Logger.log("Test Case 4 PASSED: Correctly handled access token failure.");
        if(Logger.getLog().includes("Error: Could not retrieve access token.")){
          Logger.log(" Assertion PASSED: No access token error found in logs");
        } else {
          Logger.log(" Assertion FAILED: No access token error not found in logs");
        }
    } else {
        Logger.log('Test Case 4 FAILED: Unexpected value when access token fails.');
    }
    getAccessTokenForInstance = originalGetAccessToken;

    Logger.log(`\n=== Test Complete. Review the logs above for results. ===`);
}


/**
 * Deletes a document (file) associated with an order in Rose Rocket.
 *
 * @param {string} instance The Rose Rocket instance name.
 * @param {string} orderId The ID of the order.
 * @param {string} fileId The ID of the file to delete.
 * @returns {boolean|null}  True on successful deletion, false if the API returns
 *                          a non-204 response, and null on errors (e.g., invalid
 *                          instance, no access token, network issues).
 */
async function deleteOrderFile(instance, orderId, fileId) {
  // Instance validation
  if (!Object.values(Instance).includes(instance)) {
    Logger.log(`Error: Invalid instance: ${instance}. Use one of: ${Object.values(Instance).join(', ')}`);
    return null;
  }

  // Get the access token
  const accessToken = getAccessTokenForInstance(instance);
  if (!accessToken) {
    Logger.log("Error: Could not retrieve access token.");
    return null;
  }

  // 1. Retrieve the order to get the customer ID (same as uploadFileToOrder)
  const orderDetails = getOrderByOrderId(instance, orderId);
  if (!orderDetails) {
    Logger.log(`Error: Could not retrieve order details for order ID: ${orderId}`);
    return null;
  }

  const customerId = orderDetails.order?.customer?.id;
  if (!customerId) {
    Logger.log(`Error: Could not find customer ID in order details for order ID: ${orderId}`);
    Logger.log(`Order Details: ${JSON.stringify(orderDetails)}`);
    return null;
  }

  // 2. Construct the API URL
  const apiUrlBase = 'https://platform.roserocket.com/api/v1/customers';
  const apiUrl = `${apiUrlBase}/${customerId}/orders/${orderId}/files/${fileId}`;
  Logger.log(`Delete URL: ${apiUrl}`);

  // 3. Prepare options for the DELETE request
  const options = {
    'method': 'delete',
    'headers': {
      'Authorization': `Bearer ${accessToken}`
    },
    'muteHttpExceptions': true // Handle errors ourselves
  };

  // 4. Make the API request
  const response = UrlFetchApp.fetch(apiUrl, options);

  // 5. Handle the response
  const responseCode = response.getResponseCode();
  Logger.log(`API Response Code: ${responseCode}`);

  // Successful deletion returns a 204 No Content response.
  if (responseCode === 204) {
    Logger.log(`File with ID ${fileId} deleted successfully from order ${orderId}.`);
    return true; // Indicate successful deletion
  } else if (responseCode === 404) {
    Logger.log(`File Not Found (404): Either the order or the file ID is invalid. ${response.getContentText()}`);
    return false; // Indicate failure (but not a script-breaking error)
  } else if (responseCode === 400) {
      Logger.log(`Bad Request (400): ${response.getContentText()}`);
      return false;
  }else {
    Logger.log(`API Error: ${responseCode} - ${response.getContentText()}`);
    return false; // Other error (e.g., 401, 500)
  }
}

/**
 * Deletes the specific file uploaded in the previous example.
 *  This function uses the file ID and order ID from the saved JSON response.
 */
async function deletePreviouslyUploadedFile() {
  // Replace with your actual instance name
  const instance = Instance.AMADO;

  // Data from the *saved* JSON response (from your previous upload):
  const uploadedFileJsonResponse = {
    "order_file": {
      "id": "bd6465c3-d96c-4d74-a74d-bf2298bf54c4",  // <-- File ID to delete
      "order_id": "f5b2e8e0-a89b-4382-a07d-cc8acd26b886", // <-- Order ID
      "org_id": "87f420e1-f531-4ac2-be7f-a386f94e704c",
      "uploaded_by_name": "",
      "uploaded_by": "4def088d-390b-40fb-8ed8-1d4fb6b1b327",
      "uploaded_at": "2025-02-14T20:20:37.28322Z",
      "description": null,
      "url": "https://roserocket.s3.us-west-2.amazonaws.com/order_files/f5b2e8e0-a89b-4382-a07d-cc8acd26b886/1739564436_AT103.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIWAMPIA4F2IMTXFA%2F20250214%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250214T202037Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=9ba8194b9021a1947820f6f26854b3acf69602678ca5af642b684c7a5e3eab0e",
      "type": "other",
      "created_at": "2025-02-14T20:20:37.279375Z",
      "updated_at": "2025-02-14T20:20:37.279375Z"
    }
  };

  // Extract the file ID and order ID
  const fileId = uploadedFileJsonResponse.order_file.id;
  const orderId = uploadedFileJsonResponse.order_file.order_id;

  // Call the deleteOrderFile function
  const deleteResult = await deleteOrderFile(instance, orderId, fileId);

  if (deleteResult === true) {
    Logger.log(`File with ID ${fileId} deleted successfully from order ${orderId}.`);
  } else if (deleteResult === false) {
    Logger.log(`File deletion failed (API error or file not found).  See previous logs.`);
  } else { // deleteResult === null
    Logger.log('An error occurred (invalid instance or token problem). See previous logs.');
  }
}

