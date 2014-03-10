define("cordova", function (require, exports, module) {
    var bridge = require("hybrid/plugin/cordova-base");
    var cordova = {
        define: define,
        require: require,
        fireDocumentEvent: function (type, data, bNoDetach) {
            bridge.events.emit(type, data, bNoDetach);
        },
        callbackId: Math.floor(Math.random() * 2000000000),
        callbacks: {},
        callbackStatus: {
            NO_RESULT: 0,
            OK: 1,
            CLASS_NOT_FOUND_EXCEPTION: 2,
            ILLEGAL_ACCESS_EXCEPTION: 3,
            INSTANTIATION_EXCEPTION: 4,
            MALFORMED_URL_EXCEPTION: 5,
            IO_EXCEPTION: 6,
            INVALID_ACTION: 7,
            JSON_EXCEPTION: 8,
            ERROR: 9
        },
        callbackSuccess: function (callbackId, args) {
            try {
                cordova.callbackFromNative(callbackId, true, args.status, [args.message], args.keepCallback);
            } catch (e) {
                console.log("Error in error callback: " + callbackId + " = " + e);
            }
        },
        callbackError: function (callbackId, args) {
            try {
                cordova.callbackFromNative(callbackId, false, args.status, [args.message], args.keepCallback);
            } catch (e) {
                console.log("Error in error callback: " + callbackId + " = " + e);
            }
        },
        callbackFromNative: function (callbackId, success, status, args, keepCallback) {
            var callback = cordova.callbacks[callbackId];
            if (callback) {
                if (success && status == cordova.callbackStatus.OK) {
                    callback.success && callback.success.apply(null, args);
                } else if (!success) {
                    callback.fail && callback.fail.apply(null, args);
                }
                if (!keepCallback) {
                    delete cordova.callbacks[callbackId];
                }
            }
        }
    };
    module.exports = cordova;
});