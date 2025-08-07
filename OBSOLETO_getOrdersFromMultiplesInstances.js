// Code.gs or similar

const SHIPPERS_TAB_NAME = "Shippers";
const ORDER_LOG_TAB_NAME = "Order Log";


function fetchOrdersForInstance(instance) {
    const API_ENDPOINT = 'https://platform.roserocket.com/api/v1/orders';
    const PAGE_SIZE = 50;

    const accessToken = getAccessTokenForInstance(instance);
    if (!accessToken) {
        Logger.log(`Failed to get access token for ${instance}. Aborting.`);
        return [];
    }

    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 365);

    const createdEndAt = today.toISOString();
    const createdStartAt = thirtyDaysAgo.toISOString();

    let allOrders = [];
    let offset = 0;
    let totalRecords = Infinity;

    while (offset < totalRecords) {
        const url = `${API_ENDPOINT}?created_start_at=${createdStartAt}&created_end_at=${createdEndAt}&offset=${offset}&limit=${PAGE_SIZE}`;
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                authorization: accessToken,
            },
            muteHttpExceptions: true,
        };

        try {
            const response = UrlFetchApp.fetch(url, options);
            const responseCode = response.getResponseCode();
            if (responseCode >= 200 && responseCode < 300) {
                const jsonResponse = response.getContentText();
                const parsedResponse = JSON.parse(jsonResponse);

                if (parsedResponse && parsedResponse.orders) {
                    allOrders = allOrders.concat(parsedResponse.orders.map(order => ({ ...order, instance })));
                } else {
                    Logger.log(`No orders property in response for ${instance}:`, parsedResponse);
                    break;
                }

                totalRecords = parsedResponse.total || 0;
                offset += PAGE_SIZE;

            } else {
                Logger.log(`Error for ${instance}: ${responseCode} ${response.getContentText()}`);
                break;
            }
        } catch (error) {
            Logger.log(`Error fetching page for ${instance}:`, error);
            break;
        }
    }

    Logger.log(`Total records retrieved for ${instance}: ${allOrders.length}`);
    return allOrders;
}

function fetchAndFilterRoserocketOrders() {
    const allOrders = [];

    // Fetch orders for both instances
    for (const instance of Object.keys(INSTANCES)) {
        const orders = fetchOrdersForInstance(instance);
        allOrders.push(...orders);
    }

    Logger.log(`Total records retrieved for all instances: ${allOrders.length}`);

    // Filter for orders with Origin Country as MX and Destination Country as US
    const mxToUsOrders = allOrders.filter(order => {
        const originCountry = order?.origin?.country?.toUpperCase();
        const destinationCountry = order?.destination?.country?.toUpperCase();

        return originCountry === 'MX' && destinationCountry === 'US';
    });

    Logger.log(`Total MX to US orders: ${mxToUsOrders.length}`);

    // Load existing shippers from Google Sheets
    const shippers = loadShippersFromSheet();

    // Update or add shippers and get the pickup date from the last order
    const updatedShippers = updateShippersWithOrders(shippers, mxToUsOrders);

    // Update the "Shippers" sheet with the updated information
    updateShippersSheet(updatedShippers);

    // Log all orders to Google Sheets
    logOrdersToSheets(mxToUsOrders);
}

function loadShippersFromSheet() {
    if (!SPREADSHEET_ID) {
        Logger.log('SPREADSHEET_ID is not set. Aborting load shippers from sheets.');
        return {};
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHIPPERS_TAB_NAME);

    if (!sheet) {
        Logger.log(`Sheet named "${SHIPPERS_TAB_NAME}" not found. Returning empty list of shippers.`);
        return {};
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const shippers = {};

    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const shipperName = row[headers.indexOf('Shipper Name')]; //Changed from Origin Name to Shipper Name

        if (shipperName) {
            shippers[shipperName] = {
                "CTPAT Status": row[headers.indexOf('CTPAT Status')],
                "Last Order Pickup": row[headers.indexOf('Last Order Pickup')],
                "Last Order Number": row[headers.indexOf('Last Order Number')],
                "Billing Name": row[headers.indexOf('Customer Name')]
            };
        }
    }

    Logger.log(`Loaded ${Object.keys(shippers).length} shippers from sheet`);

    return shippers;
}


function updateShippersWithOrders(shippers, orders) {
    const updatedShippers = {};

     for (const shipperName in shippers) {
        updatedShippers[shipperName] = { ...shippers[shipperName] };
    }

    orders.forEach(order => {
        const originName = order.origin?.org_name;

        if (!originName) {
            Logger.log(`Order missing origin name skipping it: ${order.id || 'N/A'}`);
            return; //Skip orders without origin name
        }

      const billingName = order.billing?.org_name || 'N/A'

        const createdAt = order.created_at;
        let formattedDate = 'N/A';
        if(createdAt){
            const date = new Date(createdAt);
            formattedDate = Utilities.formatDate(date, Session.getTimeZone(), "yyyy-MM-dd HH:mm:ss");
        }

        const publicId = order.public_id || 'N/A';

        if(updatedShippers.hasOwnProperty(originName)){
            const existingDate = updatedShippers[originName]["Last Order Pickup"];
             if(createdAt){
                if (existingDate === 'N/A'){
                 updatedShippers[originName]["Last Order Pickup"] = formattedDate;
                  updatedShippers[originName]["Last Order Number"] = publicId;
                   updatedShippers[originName]["Billing Name"] = billingName;
                } else {
                     const existingDateObj = new Date(existingDate);
                   const currentDateObj = new Date(createdAt);
                      if (currentDateObj > existingDateObj) {
                          updatedShippers[originName]["Last Order Pickup"] = formattedDate;
                        updatedShippers[originName]["Last Order Number"] = publicId;
                         updatedShippers[originName]["Billing Name"] = billingName;
                      }
                }
           }
        } else {
            updatedShippers[originName] = {
                 "CTPAT Status": "NOT COMPLIANT",
                "Last Order Pickup": formattedDate,
                "Last Order Number": publicId,
                "Billing Name": billingName
              };
            Logger.log(`Added new shipper: ${originName}`);
        }
    });

    return updatedShippers;
}


function updateShippersSheet(shippers) {
    if (!SPREADSHEET_ID) {
        Logger.log('SPREADSHEET_ID is not set. Aborting update shippers to sheets.');
        return;
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHIPPERS_TAB_NAME);
    if (!sheet) {
        Logger.log(`Sheet named "${SHIPPERS_TAB_NAME}" not found. Can't update.`);
        return;
    }

    // Prepare data to write to the sheet
    const dataRows = [];
    for (const shipperName in shippers) {
        const shipper = shippers[shipperName];
        dataRows.push([shipper["Billing Name"], shipperName, shipper["CTPAT Status"], shipper["Last Order Pickup"], shipper["Last Order Number"]]); // Swapped Customer Name and Shipper Name
    }


    // Clear existing data (except headers) and write the updated data
    const numRows = sheet.getLastRow()
    if(numRows > 1) {
      sheet.getRange(2, 1, numRows - 1, 5).clearContent();
    }

    if (dataRows.length > 0) {
        sheet.getRange(2, 1, dataRows.length, dataRows[0].length).setValues(dataRows);
    }

    Logger.log(`Updated ${Object.keys(shippers).length} shippers on the sheet.`);
}

function logOrdersToSheets(orders) {
    if (!SPREADSHEET_ID) {
        Logger.log('SPREADSHEET_ID is not set. Aborting Google Sheets log.');
        return;
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const now = new Date();
    const sheetName = Utilities.formatDate(now, Session.getTimeZone(), "yyyy-MM-dd HH:mm:ss");
    const sheet = ss.insertSheet(sheetName);

    // Headers
    const headers = [
        'Instance', 'Public ID', 'Origin Name', 'Origin Address 1', 'Origin Address 2', 'Origin City', 'Origin State', 'Origin Postal', 'Origin Country', 'Origin Phone', 'Origin Email', 'Origin Latitude', 'Origin Longitude',
        'Destination Name', 'Destination Address 1', 'Destination Address 2', 'Destination City', 'Destination State', 'Destination Postal', 'Destination Country', 'Destination Phone', 'Destination Email', 'Destination Latitude', 'Destination Longitude',
        'Billing Name', 'Commodities', 'Created At', 'Updated At', 'Order ID'
    ];
    sheet.appendRow(headers);

    // Order data rows
    const dataRows = orders.map(order => {
        const origin = order.origin || {};
        const destination = order.destination || {};
        const billingName = order.billing?.org_name || 'N/A';
        const instance = order.instance || 'N/A';
        const publicId = order.public_id || 'N/A';

        let commoditiesString = '';
        if (order.commodities && Array.isArray(order.commodities)) {
            commoditiesString = order.commodities.map(commodity => {
                return `Weight: ${commodity.weight || 'N/A'}, Pieces: ${commodity.pieces || 'N/A'}, Commodity: ${commodity.commodity || 'N/A'}, Description: ${commodity.description || 'N/A'}`;
            }).join('\n'); // Join with newlines for multiple commodities
        } else {
            commoditiesString = 'N/A';
        }

        return [
            instance, publicId,
            origin.org_name || 'N/A', origin.address_1 || 'N/A', origin.address_2 || 'N/A', origin.city || 'N/A', origin.state || 'N/A', origin.postal || 'N/A', origin.country || 'N/A', origin.phone || 'N/A', origin.email || 'N/A', origin.latitude || 'N/A', origin.longitude || 'N/A',
            destination.org_name || 'N/A', destination.address_1 || 'N/A', destination.address_2 || 'N/A', destination.city || 'N/A', destination.state || 'N/A', destination.postal || 'N/A', destination.country || 'N/A', destination.phone || 'N/A', destination.email || 'N/A', destination.latitude || 'N/A', destination.longitude || 'N/A',
            billingName, commoditiesString,
            order.created_at || 'N/A', order.updated_at || 'N/A', order.id || 'N/A'
        ];
    });

    sheet.getRange(2, 1, dataRows.length, dataRows[0].length).setValues(dataRows);

    Logger.log(`Logged ${orders.length} orders to sheet: ${sheetName}`);
}

function testLoginForBothInstances() {
    var testAccessToken = getAccessTokenForInstance('Amado');

    Logger.log(testAccessToken);

    testAccessToken = getAccessTokenForInstance('Sonot');

    Logger.log(testAccessToken);
}