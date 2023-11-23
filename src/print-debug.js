/**
 * Prints shared, transient state, object attributes and Cookies
 */

/**
 * Node imports
 */
var javaImports = JavaImporter(
    org.forgerock.openam.auth.node.api.Action,
    org.forgerock.openam.authentication.callbacks.StringAttributeInputCallback
);

/**
 * Node outcomes
 */

var nodeOutcomes = {
    NEXT: "next"
};

/**
 * Node config
 */

var nodeConfig = {
    nodeName: "***DebugNode"
};

/**
 * Node logger
 */

var nodeLogger = {
    debug: function(message) {
        logger.message("***" + nodeConfig.nodeName + " " + message);
    },
    warning: function(message) {
        logger.warning("***" + nodeConfig.nodeName + " " + message);
    },
    error: function(message) {
        logger.error("***" + nodeConfig.nodeName + " " + message);
    }
};

/**
 * Main
 */

(function() {
    nodeLogger.debug("node executing");
    var callbacksToSend = [];
    // shared State
    sharedState.keySet().toArray().forEach(
        function(key) {
            var value = sharedState.get(key);
            callbacksToSend.push(javaImports.StringAttributeInputCallback(key, "sharedState.".concat(key), value, false));
        }
    );
    // transient State
    transientState.keySet().toArray().forEach(
        function(key) {
            var value = transientState.get(key);
            callbacksToSend.push(javaImports.StringAttributeInputCallback(key, "transientState.".concat(key), value, false));
        }
    );
    // objectAttributes
    var oa = sharedState.get("objectAttributes");
    if (!!oa) {
        oa.keySet().toArray().forEach(
            function(key) {
                callbacksToSend.push(javaImports.StringAttributeInputCallback(key, "objectAttributes.".concat(key), oa.get(key), false));
            }
        );

    } else {
        nodeLogger.debug("OA is empt");
    }
    // Cookies
    var cookieHeader = requestHeaders.get("cookie");
    var cookies = cookieHeader.get(0).split(";");
    cookies.forEach(
        function(key) {
            var cookieSpec = key.split("=");
            callbacksToSend.push(javaImports.StringAttributeInputCallback(cookieSpec[0].trim(), "Cookies.".concat(cookieSpec[0].trim()), cookieSpec[1].trim(), false));
        }
    );
    // requestParameters 
    var requestParamKeys = Object.keys(requestParameters);
    requestParamKeys.forEach(
        function(key) {
            var value = requestParameters.get(key).get(0);
            callbacksToSend.push(javaImports.StringAttributeInputCallback(key, "requestParameters.".concat(key), value, false));
        }
    );

    // requestHeaders
    var requestHeaderKeys = Object.keys(requestHeaders);
    requestHeaderKeys.forEach(
        function(key) {
            var value = requestHeaders.get(key).get(0);
            callbacksToSend.push(javaImports.StringAttributeInputCallback(key, "requestHeaders.".concat(key), value, false));
        }
    );
    if (callbacks.isEmpty()) {
        action = javaImports.Action.send.apply(
            null,
            callbacksToSend
        ).build()
    } else {
        action = javaImports.Action.goTo(nodeOutcomes.NEXT).build()
    }
})();