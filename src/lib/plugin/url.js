/**
 * Created by 赤菁风铃 on 14-3-1.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 * @note 其它工具函数
 */
var EventEmmiter = require("../util/event").EventEmitter,
    base = require("./base");

/**
 * 在内置浏览器中打开对应的url（对应的url将会被打开在一个应用内置的浏览器中）
 * @param url 要打开的地址
 */
exports.open = function (url) {
    var event = new EventEmmiter();
    event.close = function () {
        base.exec(null, null, "InAppBrowser", "close", []);
    };
    event.show = function () {
        base.exec(null, null, "InAppBrowser", "show", []);
    };
    event.executeScript = function (content, cb, isfile) {
        if (isfile) {
            base.exec(cb, null, "InAppBrowser", "injectScriptFile", [content, !!cb]);
        } else {
            base.exec(cb, null, "InAppBrowser", "injectScriptCode", [content, !!cb]);
        }
    };
    event.insertCSS = function (content, cb, isfile) {
        if (isfile) {
            base.exec(cb, null, "InAppBrowser", "injectStyleFile", [content, !!cb]);
        } else {
            base.exec(cb, null, "InAppBrowser", "injectStyleCode", [content, !!cb]);
        }
    };
    var cb = function (eventname) {
        event.emit(eventname);
    };
    base.exec(cb, cb, "InAppBrowser", "open", [url, "_blank", null ]);
    return event;
};

/**
 * 未完成
 * 在系统的浏览器中打开url（拨打电话，使用地图）
 * @param url 要打开的地址
 */
exports.action = function (url) {
    base.exec(null, null, "InAppBrowser", "open", [url, "_system", null ]);
};