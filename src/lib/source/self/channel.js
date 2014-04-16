define("cordova/channel", function (require, exports, module) {
    var bridge = require("hybrid/plugin/base");
    exports.onDestroy = {
        fire: function () {
            bridge.events.emit("destroy", false, null);
        }
    }
});