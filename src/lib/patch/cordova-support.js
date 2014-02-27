/**
 * Created by 赤菁风铃 on 14-2-25.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * 本文件代码用于生成一个window.cordova对象给原生代码使用
 */

var cordova = {};
cordova.require = function (id) {
    return require(id.replace(new RegExp("^cordova/"), "hybrid/plugin/cordova-"));
};

cordova.exec = function () {
    var exec = require("hybrid/plugin/cordova-exec").exec;
    exec.apply(cordova, arguments);
};


window.cordova = cordova;
window.Cordova = cordova;
