var util = require("../util/util"),
    defautSetting = {
        title: "提示",
        ok: "确定",
        cancel: "取消"
    },
    base = require("./plugin");

exports.messageDefault = function (setting) {
    util.merge(defautSetting, setting);
};

/**
 * 弹出用户提示框
 * @param message 提示信息
 * @param [callback] 回调函数
 * @param [title] 标题
 * @param [buttonLabel] 按钮文字
 */
exports.alert = function (message, callback, title, buttonLabel) {
    var _title = (title || defautSetting.title);
    var _buttonLabel = (buttonLabel || defautSetting.ok);
    base.exec(callback || function(){}, null, "Notification", "alert", [message, _title, _buttonLabel]);
};

/**
 *
 * @param message 提示信息
 * @param callback 回调函数
 * @param [title] 标题
 * @param [buttonLabels] 按钮文字
 */
exports.confirm = function (message, callback, title, buttonLabels) {
    var _title = (title || defautSetting.title);
    var _buttonLabels = (buttonLabels || [ defautSetting.ok, defautSetting.cancel]);
    base.exec(callback, null, "Notification", "confirm", [message, _title, _buttonLabels]);
};

/**
 *
 * @param message 提示信息
 * @param callback 回调函数
 * @param [title] 标题
 * @param [buttonLabels] 按钮文字
 * @param [defaultText] 默认提示文字
 */
exports.prompt = function (message, callback, title, buttonLabels, defaultText) {
    var _title = (title || defautSetting.title);
    var _buttonLabels = (buttonLabels || [ defautSetting.ok, defautSetting.cancel]);
    var _defaultText = (defaultText || "");
    base.exec(callback, null, "Notification", "prompt", [message, _title, _buttonLabels, _defaultText]);
};

/**
 * 播放系统的默认提示声音
 * @param [count] 播放次数
 */
exports.beep = function (count) {
    count = count || 1;
    base.exec(null, null, "Notification", "beep", [count]);
};