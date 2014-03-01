define("cordova/channel", function (require, exports, module) {
    var bridge = require("hybrid/plugin/cordova-base");
    exports.onDestroy = {
        fire: function (type, data, bNoDetach) {
            bridge.events.emit(type, data, bNoDetach);
        }
    }
});