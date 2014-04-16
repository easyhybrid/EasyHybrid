/**
 * Created by 赤菁风铃 on 14-3-1.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 * @note 设备相关函数
 */

var device = null,
    base = require("./base"),
    EventEmmiter = require("../util/event").EventEmitter,
    network = exports.network = new EventEmmiter(),
    timerId = null;

exports.device = function (successCallback, errorCallback) {
    if (device) {
        successCallback(device);
        return;
    }
    base.exec(function (info) {
        device = {};
        device.platform = info.platform;
        device.version = info.version;
        device.uuid = info.uuid;
        device.cordova = info.cordova || "3.0.0";
        device.model = info.model;
        successCallback(device);
    }, errorCallback, "Device", "getDeviceInfo", []);
};

network.on("data", function (info) {
    network.state = info;
    var me = this;
    if (info === "none") {
        timerId = setTimeout(function () {
            me.emit("offline");
            timerId = null;
        }, 500);
    } else {
        if (timerId !== null) {
            clearTimeout(timerId);
            timerId = null;
        }
        me.emit("online");
    }
});

base.exec(function (info) {
    network.emit("data", info);
}, function () {
    network.state = "none";
}, "NetworkStatus", "getConnectionInfo", []);

