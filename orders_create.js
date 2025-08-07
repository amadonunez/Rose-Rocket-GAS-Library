/**
 * Crea una nueva orden en Rose Rocket para un cliente específico.
 *
 * Esta función maneja la autenticación automáticamente utilizando las funciones
 * `instanceManager` y `getAccessTokenForInstance`.  Solo necesita proporcionar el nombre
 * de la instancia, el ID del cliente y los datos de la orden. La función recupera
 * la configuración y el token de acceso necesarios en función del `instanceName` proporcionado.
 *
 * Punto de conexión de la API de Rose Rocket: {@link https://roserocket.readme.io/v1.0/reference/create-order}
 *
 * @param {string} instanceName El nombre de la instancia de Rose Rocket (por ejemplo, "Amado"). Debe ser un valor válido del enum `Instance`.
 * @param {string} customerId El ID del cliente para el que se crea la orden.  Este es el ID de cliente de Rose Rocket.
 * @param {object} orderData El objeto de datos de la orden. Consulte la documentación de la API de Rose Rocket (enlace arriba)
 *   para conocer la estructura y los campos requeridos. Este objeto se enviará como JSON en el cuerpo de la solicitud.
 * @returns {object|null} El objeto de respuesta JSON analizado de Rose Rocket en caso de éxito (normalmente el objeto de orden creado),
 *   o `null` en caso de error. Los errores se registran.
 * @throws {Error} Podría lanzar errores indirectamente desde funciones subyacentes como `instanceManager.getConfig()` o `getAccessTokenForInstance()`
 *   si hay problemas con la configuración de la instancia o la recuperación del token.
 *
 * @example
 * // Ejemplo de uso:
 * const instanceName = Instance.AMADO; // Usar el enum Instance
 * const customerId = '12345'; // Reemplazar con un ID de cliente real
 * const orderData = {
 *   // Completar con los datos de la orden según la documentación de la API de Rose Rocket
 *   // Por ejemplo:
 *    stops: [
 *     {
 *       company: "ACME Corp",
 *       location: {
 *         address_1: '123 Main St',
 *         city: 'Anytown',
 *         state: 'CA',
 *         postal_code: '90210',
 *       },
 *      },
 *   ],
 *    // ... otros campos requeridos ...
 * };
 *
 * const createdOrder = createOrder(instanceName, customerId, orderData);
 *
 * if (createdOrder) {
 *   Logger.log('Orden creada exitosamente:', createdOrder);
 * } else {
 *   Logger.log('Error al crear la orden.');
 * }
 */
//async function createOrder(instanceName, customerId, orderData) {
function createOrder(instanceName, customerId, orderData) {

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

    // Construct API URL
    const apiUrl = `https://platform.roserocket.com/api/v1/customers/${customerId}/orders`;
    Logger.log(`API URL: ${apiUrl}`);

    // Prepare Request Options
    const options = {
        'method': 'post',
        'contentType': 'application/json',
        'headers': {
            'Authorization': `Bearer ${accessToken}`
        },
        'payload': JSON.stringify(orderData),
        'muteHttpExceptions': true
    };

    // Make API Request
    const response = UrlFetchApp.fetch(apiUrl, options);
    const statusCode = response.getResponseCode();
    const responseText = response.getContentText();

    // Process Response
    if (statusCode >= 200 && statusCode < 300) {
        try {
           // return JSON.parse(responseText);
              var order = JSON.parse(responseText); // Parse the JSON response body.
              return order; // Return the created order object.
        } catch (e) {
            Logger.log(`Error parsing JSON response for instance ${instanceName}: ${e}`);
            Logger.log(`Raw response content: ${responseText}`);
            return null;
        }
    } else {
        Logger.log(`Error creating order for instance ${instanceName}, customer ${customerId}: Status Code ${statusCode}, Response: ${responseText}`);
        return null;
    }
}


// --- Example Usage ---

async function testCreateOrder() {
    // Replace with your actual values
    const instanceName = Instance.AMADO;  // Use the Instance enum
    const customerId = "7caf07d5-8667-4d8a-aaa3-72180c6ac095"; // Replace!

  const orderData = {
    "customer": {
      "id": customerId //Required
    },
        "billing": {
          city: "Nogales",
          postal: "84090M",
          country: "MX"
        },
        "origin": { //Required
            "address_1": "525 West Monroe Street", //Required
            "city": "Chicago",//Required
            "state": "IL",//Required
            "postal": "60661",//Required
            "country": "US"//Required
        },
        "destination": { //Required
             "address_1": "1 Presidents Choice Circle",//Required
            "city": "Brampton",//Required
            "state": "ON",//Required
            "postal": "L6Y 5S5",//Required
            "country": "US"//Required
        },
        "pickup_start_at": "2024-12-01T08:00:00-05:00",
        "pickup_end_at": "2024-12-01T17:00:00-05:00",
        "delivery_start_at": "2024-12-02T08:00:00-05:00",
        "delivery_end_at": "2024-12-02T17:00:00-05:00",
        "billing_option": "prepaid", //Required
    "commodities": [ // Required, and must have at least one element
      {
        "commodity_type": "pallet", // Required
        "description": "Example Commodity", // Required
        "quantity": 1, // Required
        "measurement_unit": "inch",
        "weight_unit": "lb",
        "freight_class": "none"
       },
    ],

    // Add other *required* fields based on the Rose Rocket API documentation.
  };


/*
============================================================================
*/




    const result = await createOrder(instanceName, customerId, orderData);

    if (result) {
        Logger.log('Order created successfully:');
        Logger.log(JSON.stringify(result, null, 2)); // Pretty-print the response
    } else {
        Logger.log('Order creation failed.  See previous logs for details.');
    }
}

function createRoseRocketOrder(customerID, orderData) {
      try {
        // Step 1: Generate Headers
        var headers = headerGenerator();

        if (!headers) {
          Logger.log("Failed to generate headers.  Aborting order creation.");
          return null;  // Indicate failure
        }

        // Step 2: Construct API URL
        var url = `https://platform.roserocket.com/api/v1/customers/${customerID}/orders`;

        // Step 3: Construct API Options
        var options = {
          'method': 'post',
          'contentType': 'application/json',
          'headers': headers,
          'payload': JSON.stringify(orderData),
          'muteHttpExceptions': true //Crucial!
        };

        // Step 4: Make the API Request
        var response = UrlFetchApp.fetch(url, options);
        var statusCode = response.getResponseCode();
        var responseText = response.getContentText();

      //  Logger.log("createRoseRocketOrder Status Code: " + statusCode);
      //  Logger.log("createRoseRocketOrder Response Text: " + responseText);

        // Step 5: Process the Response
        if (statusCode >= 200 && statusCode < 300) {
          var order = JSON.parse(responseText);
         // Logger.log(JSON.stringify(order, null, 2)) //PRINT THE RETURN
             var orderUrl = order.order.public_id; //Check if it works, will likely fail
                Logger.log("Order created successfully! Order URL: " + orderUrl);
          return orderUrl;
        } else {
          Logger.log("Error creating order: Status Code " + statusCode + ", Response: " + responseText);
          return null;
        }
      } catch (e) {
        Logger.log("Exception in createRoseRocketOrder: " + e);
        return null;
      }
    }

function testCreateRoseRocketOrder() {
  // 1. Mock the `headerGenerator` function (VERY IMPORTANT)
  // Replace this with your actual header generation logic if it's not trivial.
  //  Crucially, the mocked function MUST return a valid object!
  function mockHeaderGenerator() {
    // Replace with real logic if needed.  This is a placeholder.
    // The real header generator probably gets the access token.
    const accessToken = getAccessTokenForInstance("Amado"); // Replace with a valid test access token.  DO NOT COMMIT REAL ACCESS TOKENS!
    if (!accessToken || accessToken === 'YOUR_TEST_ACCESS_TOKEN') {
        Logger.log("ERROR: Please replace YOUR_TEST_ACCESS_TOKEN with a valid test access token or the test will fail.");
        return null;
    }



    return {
      'Authorization': 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    };
  }
  //Assign mock function to the real function.  Use it at the end for real
  //const headerGeneratorOriginal = headerGenerator;
  headerGenerator = mockHeaderGenerator;

  // 2. Define Test Data
  const customerID = '7caf07d5-8667-4d8a-aaa3-72180c6ac095'; // Replace with a valid customer ID for TESTING
  const orderData = {
    "created_at": "2025-01-29T15:28:42.495405Z",
    "updated_at": "2025-01-31T23:33:10.754453Z",
    "id": "3cb6531b-57b5-49ca-be52-114d41ea619d", // this is going to cause a problem.
    "sequence_id": 4158,
    "external_id": "",
    "public_id": "ATHN-TAY-4158",
    "tender_id": null,
    "customer": {
      "id": "1f7c2474-c480-4641-9392-c6931e1a129d",
      "external_id": "",
      "short_code": "TAY"
    },
    "origin": {
      "address_book_id": "65b4a7a4-facf-42bf-8e9c-c0c39ad883f6",
      "address_book_external_id": null,
      "org_name": "Sonora Forming Technologies, S.A. De C.V.",
      "contact_name": "",
      "address_1": "Calle Henry Ford No 43",
      "address_2": "Parque Industrial Dynatch Ford",
      "suite": "",
      "city": "Hermosillo",
      "state": "MX-Son.",
      "country": "MX",
      "postal": "83297",
      "phone": "",
      "phone_ext": "",
      "email": "",
      "fax": "",
      "latitude": 28.996788,
      "longitude": -110.907265,
      "bus_hours_start_at": null,
      "bus_hours_end_at": null,
      "timezone": "America/Hermosillo"
    },
    "destination": {
      "address_book_id": "f613107b-2cf5-4a1a-b1b4-2e63e8a0e36b",
      "address_book_external_id": null,
      "org_name": "Ryder Crossdock - El Paso (Hub)",
      "contact_name": "",
      "address_1": "551 Inglewood Dr",
      "address_2": "",
      "suite": "",
      "city": "El Paso",
      "state": "TX",
      "country": "US",
      "postal": "79927",
      "phone": "",
      "phone_ext": "",
      "email": "",
      "fax": "",
      "latitude": 31.678213,
      "longitude": -106.295745,
      "bus_hours_start_at": null,
      "bus_hours_end_at": null,
      "timezone": "America/Denver"
    },
    "billing": {
      "address_book_id": null,
      "address_book_external_id": null,
      "org_name": "Taylor Corp",
      "contact_name": "",
      "address_1": "18911 Hardy Oak Blvd",
      "address_2": "Suite 239",
      "suite": "",
      "city": "San Antonio",
      "state": "TX",
      "country": "US",
      "postal": "78258",
      "phone": "",
      "phone_ext": "",
      "email": "",
      "fax": "",
      "latitude": 40.46336,
      "longitude": -88.979527,
      "bus_hours_start_at": null,
      "bus_hours_end_at": null,
      "timezone": "America/Chicago"
    },
    "status": "in-transit",
    "billing_option": "thirdparty",
    "notes": "",
    "po_num": "AT53827",
    "tender_num": "4229669",
    "ref_num": "SHP2501-A19P328",
    "custom_broker": "",
    "port_of_entry": "",
    "declared_value": 0,
    "declared_value_currency": "usd",
    "pickup_start_at": "2025-01-31T20:00:00Z",
    "pickup_start_at_local": "2025-01-31T13:00:00",
    "pickup_end_at": "2025-02-03T08:00:00Z",
    "pickup_end_at_local": "2025-02-03T01:00:00",
    "pickup_appt_start_at": null,
    "pickup_appt_start_at_local": null,
    "pickup_appt_end_at": null,
    "pickup_appt_end_at_local": null,
    "pickup_notes": null,
    "delivery_start_at": "2025-02-03T15:00:00Z",
    "delivery_start_at_local": "2025-02-03T08:00:00",
    "delivery_end_at": "2025-02-03T19:00:00Z",
    "delivery_end_at_local": "2025-02-03T12:00:00",
    "delivery_appt_start_at": null,
    "delivery_appt_start_at_local": null,
    "delivery_appt_end_at": null,
    "delivery_appt_end_at_local": null,
    "delivery_notes": null,
    "current_leg_id": null,
    "pickedup_at": "2025-01-31T23:33:07Z",
    "pickedup_at_local": null,
    "delivered_at": null,
    "delivered_at_local": null,
    "dim_type": "ftl",
    "default_measurement_unit_id": "inch",
    "default_weight_unit_id": "lb",
    "commodities": [
      {
        "id": "9df47c68-660a-4943-bea3-43ef16b6abed",
        "measurement_unit": "inch",
        "weight_unit": "lb",
        "freight_class": "none",
        "commodity_type": "skid",
        "description": "Auto Parts",
        "feet": 0,
        "volume": 0,
        "length": 0,
        "width": 0,
        "height": 0,
        "weight": 252.25,
        "nmfc": "",
        "is_stackable": false,
        "quantity": 8,
        "pieces": 8,
        "commodity_type_other": "",
        "sku": ""
      }
    ],
    "accessorials": [],
    "type": "",
    "is_multistop_order": false,
    "multistop_order_id": null,
    "multistop_order_full_id": null,
    "multistop_order_sequence_id": null,
    "billable_miles": null,
    "source": null,
    "transportation_authority_id": null,
    "sales_user_ids": [
      "30a31375-7a8a-4cfc-9765-4a6db7183e7f"
    ],
    "sales_user_id": "30a31375-7a8a-4cfc-9765-4a6db7183e7f"
  };

  // 3. Call the function
  Logger.log("Starting testCreateRoseRocketOrder...");
  const orderUrl = createRoseRocketOrder(customerID, orderData);

  // 4. Assert the results
  if (orderUrl) {
    Logger.log("Test Passed: Order created successfully. Order URL: " + orderUrl);
    // Additional assertions can be made here, like checking that the order
    // actually exists in Rose Rocket, but that requires more API calls.
  } else {
    Logger.log("Test Failed: Order creation failed.");
  }
    //headerGenerator = headerGeneratorOriginal; //restore the old function

  Logger.log("Test Complete.");
}



