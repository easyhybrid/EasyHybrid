/**
 * Created by 赤菁风铃 on 14-3-1.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 * @note android精简版cordova
 */


var cordova = window.cordova = {},//cordova对象
    exec = require("../plugin/cordova-android-exec"), //执行对象
    cordova_event = require("../plugin/cordova-event"), //执行对象
    channel = {

    },//频道对象
    callbacks = {},//回调函数列表
    callbackStatus = {//回调状态
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
    };

/**
 * 简单引用函数
 * @param type
 * @returns {*}
 */
function cordova_require(type) {
    switch (type) {
        case "cordova":
            return cordova;
        case  "cordova/exec":
            return exec;
        case "cordova/channel":
            return channel;
        default:
            return {};
    }
}

cordova.require = cordova_require;

/**
 * 用于从原生代码激活事件
 */
function fireDocumentEvent() {
    cordova_event.emit(arguments);
}

cordova.fireDocumentEvent = fireDocumentEvent;

/**
 * 执行成功函数
 * @param callbackId 函数ID
 * @param args 参数
 */
function callbackSuccess(callbackId, args) {
    try {
        callbackFromNative(callbackId, true, args.status, [args.message], args.keepCallback);
    } catch (e) {
        console.log("Error in error callback: " + callbackId + " = " + e);
    }
}

cordova.callbackSuccess = callbackSuccess;
/**
 * 执行失败函数
 * @param callbackId 函数ID
 * @param args 参数
 */
function callbackError(callbackId, args) {
    try {
        callbackFromNative(callbackId, false, args.status, [args.message], args.keepCallback);
    } catch (e) {
        console.log("Error in error callback: " + callbackId + " = " + e);
    }
}

cordova.callbackError = callbackError;


/**
 * 原生回调函数
 * @param callbackId
 * @param success
 * @param status
 * @param args
 * @param keepCallback
 */
function callbackFromNative(callbackId, success, status, args, keepCallback) {
    var callback = callbacks[callbackId];
    if (callback) {
        if (success && status === callbackStatus.OK && callback.success) {
            callback.success.apply(null, args);
        } else if (!success && callback.fail) {
            callback.fail.apply(null, args);
        }
        if (!keepCallback) {
            delete callbacks[callbackId];
        }
    }
}

cordova.callbackFromNative = callbackFromNative;
