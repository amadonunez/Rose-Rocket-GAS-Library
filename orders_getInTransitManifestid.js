/**
 * Retrieves the manifest ID of an in-transit leg for a given Rose Rocket order.
 *
 * @param {string} instanceName The name of the Rose Rocket instance.
 * @param {string} orderId The Rose Rocket order ID.
 * @returns {string|null} The manifest ID of the in-transit leg, or null if
 *   the order is not in transit, no manifest ID is found, or an error occurs.
 */
function getManifestIdForInTransitOrder(instanceName, orderId) {
    const legs = getLegsForOrder(instanceName, orderId);

    if (!legs) {
        return null; // Error getting legs, already logged in getLegsForOrder
    }

    // Iterate through the legs and check for in-transit statuses
    for (const leg of legs) {
        if (leg.status === "loaded") {
            // "loaded" status takes precedence
            return leg.manifest_id;
        } else if (leg.status === "dispatched" && leg.type === "line_haul") {
            // "dispatched" line haul leg is also considered in transit
            return leg.manifest_id;
        }
    }
    // check to see if there is at least 1 available line_haul
    for(const leg of legs){
      if(leg.type === "line_haul" && leg.status === "available"){
        Logger.log(`getManifestIdForInTransitOrder: Order ${orderId} is in transit (line haul available), but no manifest assigned yet.`);
        return null;
      }
    }


    Logger.log(`getManifestIdForInTransitOrder: Order ${orderId} is not in transit.`);
    return null; // Not in transit (or no legs found, which is handled above)
}

function testgetManifestIdForInTransitOrder() {

  Logger.log(getManifestIdForInTransitOrder(Instance.AMADO, "e2f29b55-9e6a-4883-9c8a-1f1f0d8901a5"))


}