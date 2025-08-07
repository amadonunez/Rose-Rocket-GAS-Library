function fetchSampleOrders() {
    const orders = fetchOrdersForInstance('Amado');

    // Filter orders for specific customers
    const filteredOrders = orders.filter(order => {
        const billingName = order.billing?.org_name || '';
        return ['The ILS Company', 'Berlin Packaging LLC', 'Taylor Corp'].includes(billingName);
    });

    Logger.log(`Filtered orders count: ${filteredOrders.length}`);
    logOrdersToSheets(filteredOrders);
}

function testListBoards() {
  const API_ENDPOINT = 'https://athn.roserocket.com/api/v1/locations/890e7a09-151b-4c8f-99de-2939430a1b79/address_books/ebc21d22-8550-4b67-a43b-1eac65a630a7';
  const accessToken = getAccessTokenForInstance('Amado'); // Ensure valid access token

  if (!accessToken) {
    Logger.log('Failed to retrieve access token for Amado.');
    return;
  }

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${accessToken}`, // Include 'Bearer ' prefix
    },
    muteHttpExceptions: true,
  };

  try {
    const response = UrlFetchApp.fetch(API_ENDPOINT, options);
    const responseCode = response.getResponseCode();

    if (responseCode >= 200 && responseCode < 300) {
      const jsonResponse = response.getContentText();
      const parsedResponse = JSON.parse(jsonResponse);

        const addressBooks = parsedResponse.data.address_book;
        logFlattenedJsonArrayToSheet([addressBooks]); // Log to sheet

    } else {
      Logger.log(`Error for Amado: ${responseCode} - ${response.getContentText()}`);
    }
  } catch (error) {
    Logger.log(`Error fetching: ${error.message}`);
  }
}



/**
 * Helper function: Recursively flattens a nested object (or arrays within objects)
 * into a single-level object.
 * Example:
 *   { "data": { "location": { "city": "Nogales" } } }
 * becomes:
 *   { "data.location.city": "Nogales" }
 */
function flattenObject(obj, parentKey = '', result = {}) {
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) {
      continue;
    }

    const value = obj[key];
    // Build new key using dot notation (e.g., "parent.child") or bracket notation for arrays
    const newKey = parentKey ? `${parentKey}.${key}` : key;

    // If value is a non-null object, recurse
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flattenObject(value, newKey, result);
    // If value is an array, flatten each element
    } else if (Array.isArray(value)) {
      value.forEach((element, index) => {
        const arrayKey = `${newKey}[${index}]`;
        if (element && typeof element === 'object' && !Array.isArray(element)) {
          flattenObject(element, arrayKey, result);
        } else {
          result[arrayKey] = element;
        }
      });
    } else {
      // Otherwise, set it directly
      result[newKey] = value;
    }
  }
  return result;
}

/**
 * Logs multiple JSON records to a new sheet in a Google Spreadsheet by:
 *  1. Flattening each object into key-value pairs (dot/bracket notation)
 *  2. Aggregating all flattened keys across all records to form a single set of columns
 *  3. Logging each record in a separate row.
 *
 * @param {Object[]} jsonRecords An array of JSON objects you want to flatten and log.
 */
function logFlattenedJsonArrayToSheet(jsonRecords) {
  if (!SPREADSHEET_ID) {
    Logger.log('SPREADSHEET_ID is not set. Aborting Google Sheets log.');
    return;
  }

  // Open or create the new sheet
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const now = new Date();
  const sheetName = Utilities.formatDate(now, Session.getTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  const sheet = ss.insertSheet(sheetName);

  // Flatten each object in the array
  const flattenedObjects = jsonRecords.map(obj => flattenObject(obj));

  // Collect all unique keys across all flattened objects
  const allKeysSet = new Set();
  flattenedObjects.forEach(record => {
    Object.keys(record).forEach(key => allKeysSet.add(key));
  });

  // Convert set to an array for the header row
  const headers = Array.from(allKeysSet);

  // Append header row
  sheet.appendRow(headers);

  // Build data rows for each record
  const dataRows = flattenedObjects.map(record => {
    return headers.map(key => {
      // If the key doesn't exist in this record, default to empty string
      return record.hasOwnProperty(key) ? record[key] : '';
    });
  });

  // Write data rows to sheet
  sheet.getRange(2, 1, dataRows.length, headers.length).setValues(dataRows);

  Logger.log(`Logged ${jsonRecords.length} records to sheet: ${sheetName}`);
}
