/**
 * Recupera todas las órdenes desde la API de Rose Rocket, manejando la paginación automáticamente.
 * Esta función realiza múltiples solicitudes a la API para obtener todas las órdenes que coincidan 
 * con los parámetros de consulta especificados, utilizando paginación con `limit` y `offset`.
 *
 * La función llama a `getAccessTokenForInstance(instance)` para obtener un token de autenticación 
 * válido antes de realizar las solicitudes a la API.
 *
 * ### Ejemplo de Uso:
 * ```javascript
 * var queryParams = 'status=dispatched';
 * var instance = 'Amado'; // Especifica la instancia para la autenticación
 * var orders = searchOrders(queryParams, instance);
 * Logger.log('Total de órdenes obtenidas: ' + orders.length);
 * ```
 *
 * ### Flujo de la Función:
 * 1. Se valida que la instancia proporcionada exista en la constante `INSTANCES`.
 * 2. Se obtiene la primera página de resultados con `offset=0`.
 * 3. Se extrae el total de órdenes desde la respuesta de la API.
 * 4. Se realizan solicitudes adicionales incrementando `offset` hasta obtener todas las órdenes.
 * 5. Se maneja cualquier error de API o red de forma segura, registrando los problemas en los logs.
 *
 * ### Ejemplo de Respuesta de la API:
 * ```json
 * {
 *   "orders": [
 *     {
 *       "id": "28f33241-a33e-450f-a88e-4bbb8b722310",
 *       "public_id": "ATHN-TAY-4248",
 *       "status": "in-transit"
 *     }
 *   ],
 *   "offset": 0,
 *   "limit": 50,
 *   "total": 120
 * }
 * ```
 * 
 * @author mario.estrella@amadotrucking.com
 * @lastModified 2025-02-13 (YYYY-MM-DD)
 * @param {string} queryParams Parámetros de consulta para filtrar órdenes (ej. `created_end_at=2025-02-01%2000%3A00%3A00&in_status_ids=delivered`). ver https://roserocket.readme.io/v1.0/reference/find-orders
 * @param {string} instance La instancia para la autenticación (debe existir en `INSTANCES`).
 * @return {Array<Object>} Un arreglo con todas las órdenes recuperadas de la API, o `null` si la instancia no es válida.
 */
function searchOrders(queryParams, instance) {
  // Check if the provided instance is a valid enum value
  if (!Object.values(Instance).includes(instance)) {
    Logger.log(`Error: Invalid instance: ${instance}. Use one of: ${Object.values(Instance).join(', ')}`);
    return null;
  }

  const instanceConfig = INSTANCES[instance];
  const apiUrlBase = 'https://platform.roserocket.com/api/v1/orders';
  const limit = 50;
  let offset = 0;
  let allOrders = [];
  let totalOrders = 0;
  let totalCalls = 0;

  const accessToken = getAccessTokenForInstance(instance);

  do {
   const apiUrl = `${apiUrlBase}?${queryParams}&limit=${limit}&offset=${offset}`;
   Logger.log(`Fetching: ${apiUrl}`);

    // Get the access token using the configuration
    const accessToken = getAccessTokenForInstance(instance);

    const response = UrlFetchApp.fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      muteHttpExceptions: true // Important for handling API errors
    });

    // Check API response status before parsing JSON
    if (response.getResponseCode() !== 200) {
      Logger.log(`API Error: ${response.getResponseCode()} - ${response.getContentText()}`);
      return null;
    }

    totalCalls++;
    Logger.log(`Total API Calls: ${totalCalls}`);

    const jsonResponse = JSON.parse(response.getContentText());

    // Safe check for total orders
    if (!jsonResponse.total || typeof jsonResponse.total !== 'number') {
      Logger.log('Warning: "total" property not found or not a number.');
    } else {
      totalOrders = jsonResponse.total;
    }

    Logger.log('jsonResponse.total: ' + totalOrders)

    // Stop fetching if no orders are found
    if (!jsonResponse.orders || jsonResponse.orders.length === 0) {
      Logger.log('No more orders found, stopping.');
      break;
    }

    // Add retrieved orders to array
    allOrders = allOrders.concat(jsonResponse.orders);

    // Stop fetching if we've retrieved all known orders
    if (allOrders.length >= totalOrders) {
      break;
    }

    // Move to the next batch
    offset += limit;

    // Stop if offset exceeds expected total
    if (offset >= totalOrders) {
      break;
    }

  } while (allOrders.length < totalOrders);

  Logger.log(`Total API Calls Made: ${totalCalls}`);
  Logger.log(`Total Orders Retrieved: ${allOrders.length}`);

  return allOrders;
}


let QUERY = 'created_start_at=2025-02-14%2000%3A00%3A00&in_status_ids=delivered';

function testSearchOrders() {
  var queryParams = QUERY;

  // Call the function and log the result before using forEach
  var orders = searchOrders(queryParams, Instance.AMADO);
  Logger.log('Raw API Response: ' + JSON.stringify(orders, null, 2));

  if (Array.isArray(orders)) {
    Logger.log('Total orders is: ' + orders.length)
    orders.forEach(function(order) {
      Logger.log('Order ID: ' + order.id + 
                 ', Public ID: ' + order.public_id + 
                 ', Status: ' + order.status);
    });
  } else {
    Logger.log('Error: Expected an array, but received a different structure.');
  }
}
