/**
 * Created by 赤菁风铃 on 14-3-1.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 * @note 这里是所有android系统与其它平台的差异化功能，请根据需要进行修改
 */
var plugin = require("../plugin/plugin"),
    register = plugin.register,
    core = require("../core"),
    cordova = require("cordova");//确保在ANDROID项目中引用了cordova

plugin.exec(null, null, 'PluginManager', 'startup', []);

var backButtonChannel = cordova.addDocumentEventHandler('backbutton');
backButtonChannel.onHasSubscribersChange = function () {
    plugin.exec(null, null, "App", "overrideBackbutton", [this.numHandlers === 1]);
};
cordova.addDocumentEventHandler('menubutton');
cordova.addDocumentEventHandler('searchbutton');
plugin.exec(null, null, "App", "show", []);

var flag = false;
document.addEventListener("backbutton", function () {
    if (!core.back(null)) {
        if (flag) {
            plugin.exec(null, null, "App", "exitApp", []);
        }
        flag = true;
        setTimeout(function () {
            flag = false;
        }, 1000);//确保连续退出的按键在1S内按下，防止用户误操作
    } else {
        flag = false;
    }
});

/**
 * 在android下可以直接使用浏览器内置的功能
 */
register("Geolocation", {
    getLocation: function (success, fail, args) {
        navigator.geolocation.getCurrentPosition(function (result) {
            var pos = result.coords;
            pos.timestamp = result.timestamp;
            if (success) {
                success(pos);
            }
        }, fail, {
            enableHighAccuracy: args[0],
            maximumAge: args[1]
        });
    }
});

/**
 * 由于在android下，webview的呈现会比页面加载慢，此函数没有意义
 */
register("SplashScreen", {
    show: function () {
    },
    hide: function () {

    }
});



