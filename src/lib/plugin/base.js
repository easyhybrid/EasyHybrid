/**
 * Created by 赤菁风铃 on 14-3-1.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 * @note 执行cordova函数必备的工具函数
 * @note 包括exec函数、代理和原生回调初始化函数和原生事件
 */


var util = require("../util/util"),//工具类
    EventEmitter = require("../util/event").EventEmitter,//事件发生器
    native = null ,//原生代码桥
    proxy = {};//代理列表

try {
    native = require("cordova/exec");
} catch (e) {
    console.log("not found cordova support for current paltform");
}

/**
 * 通过代理来执行回调函数
 * @param success 成功函数
 * @param fail 失败函数
 * @param service 服务名
 * @param action 功能名
 * @param args 参数列表
 */
function exec(success, fail, service, action, args) {
    //处理代理功能
    if (service in proxy && action in proxy[service]) {
        var func = proxy[service][action];
        try {
            func(success, fail, args);
            return;
        } catch (e) {
            console.log("proxy error in service:" + service);
            if (fail) {
                fail("proxy error in service:" + service);
            }
        }
    }
    //处理原生代码执行函数
    if (native) {
        native(success, fail, service, action, args);
        return;
    }
    console.log("no proxy found for" + service + "." + action);
    if (fail) {
        fail("no proxy found for" + service + "." + action);
    }
}

exports.exec = exec;

/**
 * 添加代理功能
 * @param service 功能名
 * @param obj 功能对象
 */
function register(service, obj) {
    proxy[service] = proxy[service] || {};
    util.merge(proxy[service], obj);
}
exports.register = register;
