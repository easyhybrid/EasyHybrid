/**
 * Created by 赤菁风铃 on 14-3-1.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 * @note 部分在web无法使用的插件的代理函数
 */

var register = require("./../plugin/base").register;
var util = require("../util/util");

/**
 * 返回设备信息
 */
register("Device", {
    getDeviceInfo: function (success) {
        var uuid = util.load("uuid");
        if (!uuid) {
            uuid = util.uuid();
            util.save("uuid", uuid);
        }
        success({
            uuid: uuid,
            platform: "web",
            version: "",
            cordova: "3.0.0",
            model: "model"
        });
    }
});

/**
 * 获取网络信息
 */
register("NetworkStatus", {
    getConnectionInfo: function (success) {
        success("wifi");
    }
});

/**
 * 提示信息框
 */
register("Notification", {
    alert: function (success, fail, args) {
        setTimeout(function () {
            alert(args[0]);
            success();
        }, 0);
    },
    confirm: function (success, fail, args) {
        setTimeout(function () {
            if (confirm(args[0])) {
                success(0);
            } else {
                success(1);
            }
        }, 0);
    },
    prompt: function (success, fail, args) {
        setTimeout(function () {
            var value = prompt(args[0], args[3]);
            if (value === null) {
                success(1, value);
            } else {
                success(0, value);
            }
        }, 0);
    },
    beep: function () {

    }
});

register("InAppBrowser", {
    open: function (success, fail, args) {
        window.open(args[0], "_blank");
        success("loadstart");
    },
    close: function () {
    },
    shop: function () {
    },
    injectScriptFile: function () {
    },
    injectScriptCode: function () {
    },
    injectStyleCode: function () {
    },
    injectStyleFile: function () {
    }
});