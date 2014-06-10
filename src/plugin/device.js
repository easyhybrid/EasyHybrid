/**
 * Created by 赤菁风铃 on 14-3-1.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 * @note 设备相关函数
 */

var base = require("./plugin"),//基础函数
    EventEmmiter = require("../util/util").EventEmitter,//事件发生器
    Channel = require("../util/util").Channel,//频道
    deviceReady = new Channel(true),//设备信息获取完成事件
    device = exports.device = {//设备信息
        loaded: false
    },
    network = exports.network = new EventEmmiter(),
    networkReady = new Channel(true),//网络信息获取完成事件
    timerId = null;

base.wait(deviceReady);
base.wait(networkReady);

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
    device.platform = info.platform;
    device.version = info.version;
    device.uuid = info.uuid;
    device.cordova = info.cordova || "3.0.0";
    device.model = info.model;
    device.loaded = true;
    deviceReady.fire();
}, null, "Device", "getDeviceInfo", []);


base.exec(function (info) {
    if (!network.state) {
        networkReady.fire();
    }
    network.emit("data", info);
}, function () {
    if (!network.state) {
        networkReady.fire();
    }
    network.emit("data", "none");
}, "NetworkStatus", "getConnectionInfo", []);

