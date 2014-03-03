/**
 * Created by 赤菁风铃 on 14-3-1.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 * @note 频道类，一个有状态的事件发生器，如果事件的绑定和回调没有先后顺序，请使用Channel而不是EventEmitter
 */

var nextGuid = 1;
var util = require("./util");

/**
 * 频道信息类
 * @param type 频道名
 * @param sticky 是否单次执行
 * @constructor
 */
function Channel(type, sticky) {
    this.type = type;//频道名
    this.handlers = {};//回调参数
    this.state = sticky ? 1 : 0;//状态
    this.fireArgs = null;//回调参数
    this.numHandlers = 0;//回调数量
    this.onHasSubscribersChange = null;//频道开始或者结束回调
}

exports.Channel = Channel;

/**
 * 将函数添加到频道
 * @param f 要添加的回调函数
 * @param [c] 上下亠对象
 */
Channel.prototype.subscribe = function (f, c) {
    forceFunction(f);
    if (this.state === 2) {//如果频道已经打开，直接执行回调函数
        f.apply(c || this, this.fireArgs);
        return;
    }

    var func = f,
        guid = f.observer_guid;
    if (typeof c === "object") {
        func = close(c, f);
    }
    if (!guid) {
        guid = '' + nextGuid++;
    }
    func.observer_guid = guid;
    f.observer_guid = guid;

    //避免重复绑定
    if (!this.handlers[guid]) {
        this.handlers[guid] = func;
        this.numHandlers++;
        if (this.numHandlers === 1 && this.onHasSubscribersChange) {
            this.onHasSubscribersChange();
        }
    }
};

/**
 * 从频道移除已有的回调
 * @param f
 */
Channel.prototype.unsubscribe = function (f) {
    forceFunction(f);
    var guid = f.observer_guid,
        handler = this.handlers[guid];
    if (handler) {
        delete this.handlers[guid];
        this.numHandlers--;
        if (this.numHandlers === 0 && this.onHasSubscribersChange) {
            this.onHasSubscribersChange();
        }
    }
};

/**
 * 执行所有回调，并初始化频道状态
 * @param e 类型，目前此参数空置
 */
Channel.prototype.fire = function (e) {
    var fireArgs = Array.prototype.slice.call(arguments);
    if (this.state === 1) {
        this.state = 2;
        this.fireArgs = fireArgs;
    }
    if (this.numHandlers) {
        var toCall = [];
        for (var item in this.handlers) {
            if (this.handlers.hasOwnProperty(item)) {
                toCall.push(this.handlers[item]);
            }
        }
        for (var i = 0; i < toCall.length; ++i) {
            toCall[i].apply(this, fireArgs);
        }
        if (this.state === 2 && this.numHandlers) {
            this.numHandlers = 0;
            this.handlers = {};
            if (this.onHasSubscribersChange) {
                this.onHasSubscribersChange();
            }
        }
    }
};

/**
 * 确保参数是函数
 * @param f 检查类型
 */
function forceFunction(f) {
    if (typeof f !== 'function') {
        throw new Error("Function required as first argument!");
    }
}


/**
 * 生成一个函数闭包
 * @param context 上下文对象
 * @param func 封包函数
 * @param [params] 封包参数（如果为空，则会动态反射闭包的参数）
 * @returns {Function}函数闭包
 */
function close(context, func, params) {
    if (typeof params === 'undefined') {
        return function () {
            return func.apply(context, arguments);
        };
    } else {
        return function () {
            return func.apply(context, params);
        };
    }
}
