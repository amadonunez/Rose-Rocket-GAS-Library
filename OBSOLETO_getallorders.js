
function fetchAndFilterRoserocketOrders() {
  const API_ENDPOINT = 'https://platform.roserocket.com/api/v1/orders';
  const PAGE_SIZE = 50;

  const accessToken = getAccessTokenForInstance('Amado');
    if (!accessToken) {
    Logger.log('Failed to get access token. Aborting.');
    return;
  }

  // Calculate date range for the last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  // Format dates to ISO strings
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
        'accept': 'application/json',
        'authorization': accessToken,
      },
      'muteHttpExceptions': true
    };

    try {
      const response = UrlFetchApp.fetch(url, options);
        const responseCode = response.getResponseCode();
            if (responseCode >= 200 && responseCode < 300) {
                const jsonResponse = response.getContentText();
                const parsedResponse = JSON.parse(jsonResponse);

                if (parsedResponse && parsedResponse.orders) {
                    allOrders = allOrders.concat(parsedResponse.orders);
                } else {
                    Logger.log("No orders property in response:", parsedResponse);
                    break;
                }

                totalRecords = parsedResponse.total || 0;
                offset += PAGE_SIZE;

            } else {
                Logger.log("Error: " + responseCode + " " + response.getContentText());
                break;
            }
    } catch (error) {
       Logger.log('Error fetching page:', error);
        break;
    }
  }


  Logger.log(`Total records Retrieved: ${allOrders.length}`);
  // Filter for orders with destination country as USA
  const usaOrders = allOrders.filter(order => {
    return order.destination && order.destination.country === 'US';
  });
  Logger.log(`Total US orders: ${usaOrders.length}`);

  // Log organization names grouped by billing, then origin, then destination
  const groupedOrders = usaOrders.reduce((acc, order) => {
    const billingName = order.billing?.org_name || 'N/A';
    const originName = order.origin?.org_name || 'N/A';
    const destinationName = order.destination?.org_name || 'N/A';

    if (!acc[billingName]) {
      acc[billingName] = {};
    }
    if (!acc[billingName][originName]) {
      acc[billingName][originName] = {};
    }
     if (!acc[billingName][originName][destinationName]) {
        acc[billingName][originName][destinationName] = [];
    }

    acc[billingName][originName][destinationName].push(order);
    return acc;
  }, {});


  Logger.log("Billing\tOrigin\tDestination (Records)");
  for (const billingName in groupedOrders) {
    for (const originName in groupedOrders[billingName]) {
      for (const destinationName in groupedOrders[billingName][originName]) {
        const recordCount = groupedOrders[billingName][originName][destinationName].length;
         Logger.log(`${billingName}\t${originName}\t${destinationName} (${recordCount})`);
      }
    }
  }
}