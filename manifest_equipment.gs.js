// --- CONFIGURACIÓN DE INSTANCIAS Y ACCESO ---



// NOMBRE CORREGIDO: Vuelve a ser 'instanceManager'
const instanceManager2 = {
  config: {
    Amado: {
      subdomain: "athn",
      // Es posible que tu función 'getAccessTokenForInstance' necesite más datos aquí,
      // como USERNAME, PASSWORD, o la API KEY directamente.
    },
    Sonot: {
      subdomain: "tdcs"
    }
  },
  getConfig: function(instanceName) {
    return this.config[instanceName];
  }
};




/**
 * Encuentra órdenes utilizando un número de contenedor.
 * Incluye un mecanismo de 3 reintentos con espera exponencial para errores del servidor (código 5xx).
 *
 * @param {string} instanceName El nombre de la instancia de Rose Rocket.
 * @param {string} containerId El número de contenedor a usar como término de búsqueda.
 * @returns {Array|null} Un array de objetos de orden si se encuentran, o null si hay un error.
 */
function findOrdersByContainerId(instanceName, containerId) {
    const accessToken = getAccessTokenForInstance(instanceName);
    if (!accessToken) {
        Logger.log(`findOrdersByContainerId: No se pudo obtener el token de acceso para ${instanceName}.`);
        return null;
    }

    const config = instanceManager2.getConfig(instanceName);
    if (!config || !config.subdomain) {
        Logger.log(`Error: No se pudo obtener el subdominio para la instancia: ${instanceName}`);
        return null;
    }

    const baseUrl = `https://${config.subdomain}.roserocket.com`;
    const searchUrl = `${baseUrl}/api/v1/orders/two_stage?search_term=${encodeURIComponent(containerId)}`;

    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        muteHttpExceptions: true,
    };

    const maxRetries = 3; // Intentar un máximo de 3 veces

    // --- LÓGICA DE REINTENTOS ---
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = UrlFetchApp.fetch(searchUrl, options);
            const responseCode = response.getResponseCode();

            if (responseCode >= 200 && responseCode < 300) {
                // Éxito: procesa y devuelve la respuesta.
                const result = JSON.parse(response.getContentText());
                if (result.data && result.data.total > 0) {
                    return result.data.orders || [];
                } else {
                    return [];
                }
            } else if (responseCode >= 500 && attempt < maxRetries) {
                // Error del servidor: espera y reintenta.
                Logger.log(`Attempt ${attempt}: Server error (${responseCode}). Retrying in a few seconds...`);
                Utilities.sleep(Math.pow(2, attempt) * 1000 + Math.random() * 1000); // Pausa de ~2s, 4s, 8s
            } else {
                // Error del cliente (4xx) o último intento fallido: no reintentar.
                Logger.log(`findOrdersByContainerId: Final error. Code: ${responseCode}. URL: ${searchUrl}`);
                Logger.log(response.getContentText());
                return null; // Salir de la función.
            }
        } catch (error) {
            Logger.log(`findOrdersByContainerId: Exception on attempt ${attempt}: ${error}`);
            if (attempt < maxRetries) {
                Utilities.sleep(Math.pow(2, attempt) * 1000 + Math.random() * 1000);
            }
        }
    }

    // Si todos los reintentos fallan, se llega a este punto.
    Logger.log(`All ${maxRetries} retries failed for container ${containerId}.`);
    return null;
}

// // --- FUNCIÓN DE BÚSQUEDA ---

// function findOrdersByContainerId(instanceName, containerId) {
   
//     const accessToken = getAccessTokenForInstance(instanceName);
//     if (!accessToken) {
//         Logger.log(`findOrdersByContainerId: No se pudo obtener el token de acceso para ${instanceName}.`);
//         return null;
//     }

//     const config = instanceManager2.getConfig(instanceName);
//     if (!config || !config.subdomain) {
//         Logger.log(`Error: No se pudo obtener el subdominio para la instancia: ${instanceName}`);
//         return null;
//     }

//     const baseUrl = `https://${config.subdomain}.roserocket.com`;
//     const searchUrl = `${baseUrl}/api/v1/orders/two_stage?search_term=${encodeURIComponent(containerId)}`;

//     const options = {
//         method: 'GET',
//         headers: {
//             'Authorization': `Bearer ${accessToken}`,
//             'Content-Type': 'application/json',
//         },
//         muteHttpExceptions: true,
//     };

//     try {
//         const response = UrlFetchApp.fetch(searchUrl, options);
//         const responseCode = response.getResponseCode();

//         if (responseCode >= 200 && responseCode < 300) {
//             const result = JSON.parse(response.getContentText());
//             if (result.data && result.data.total > 0) {
//                 return result.data.orders || [];
//             } else {
//                 return [];
//             }
//         } else {
//             Logger.log(`findOrdersByContainerId: Error searching. Code: ${responseCode}. URL: ${searchUrl}`);
//             Logger.log(response.getContentText());
//             return null;
//         }
//     } catch (error) {
//         Logger.log(`findOrdersByContainerId: Error: ${error}`);
//         return null;
//     }
// }




function testFindOrdersByContainerId_Amado() {

    const instanceName = Instance.AMADO;
    const containerId = 'CAAU5142250';

    const orders = findOrdersByContainerId(instanceName, containerId);

    if (orders) {
        Logger.log(`Órdenes encontradas para el contenedor '${containerId}': ${orders.length}`);
    } else {
        Logger.log(`La búsqueda falló para el término: ${containerId}.`);
    }
}