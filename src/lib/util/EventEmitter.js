/**
 * Created by 赤菁风铃 on 14-2-24.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 * @note 工具函数和工具组件类
 */

/**
 * EventEmitter事件操作类
 * @constructor
 */
function EventEmitter() {
    this._events = this._events || {};
    this._maxListeners = this._maxListeners || 10;
}
/**
 * 设置最大监听数量
 * @param n  数量
 */
EventEmitter.prototype.setMaxListeners = function (n) {
    if (typeof n !== 'number' || n < 0) {
        throw new TypeError('参数n必须大于0');
    }
    this._maxListeners = n;
};

/**
 * 触发事件
 * @param type 事件名
 * @returns {boolean}
 */
EventEmitter.prototype.emit = function (type) {
    var er, handler, len, args, i, listeners;
    if (!this._events) {
        this._events = {};
    }
    if (type === 'error') {
        if (!this._events.error || (typeof this._events.error === 'object' && !this._events.error.length)) {
            er = arguments[1];
            if (er instanceof Error) {
                throw er;
            } else {
                throw new TypeError('发现没捕获的未知异常');
            }
        }
    }

    handler = this._events[type];
    if (typeof handler === 'undefined') {
        return false;
    }
    if (typeof handler === 'function') {
        switch (arguments.length) {
            case 1:
                handler.call(this);
                break;
            case 2:
                handler.call(this, arguments[1]);
                break;
            case 3:
                handler.call(this, arguments[1], arguments[2]);
                break;
            default:
                len = arguments.length;
                args = new Array(len - 1);
                for (i = 1; i < len; i++) {
                    args[i - 1] = arguments[i];
                }
                handler.apply(this, args);
        }
    } else if (typeof handler === 'object') {
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++) {
            args[i - 1] = arguments[i];
        }
        listeners = handler.slice();
        len = listeners.length;
        for (i = 0; i < len; i++) {
            listeners[i].apply(this, args);
        }
    }
    return true;
};

/**
 * 添加监听
 * @param type 事件名
 * @param listener 监听函数
 * @returns {EventEmitter}
 */
EventEmitter.prototype.addListener = function (type, listener) {
    var m;
    if (typeof listener !== 'function') {
        throw new TypeError('listener must be a function');
    }
    if (!this._events) {
        this._events = {};
    }
    if (this._events.newListener) {// To avoid recursion in the case that type === "newListener"! Before adding it to the listeners, first emit "newListener".
        this.emit('newListener', type, typeof listener.listener === 'function' ? listener.listener : listener);
    }
    if (!this._events[type]) {
        this._events[type] = listener;// Optimize the case of one listener. Don't need the extra array object.
    } else if (typeof this._events[type] === 'object') {
        this._events[type].push(listener);// If we've already got an array, just append.
    } else {
        this._events[type] = [this._events[type], listener];// Adding the second element, need to change to array.
    }
    // Check for listener leak
    if (typeof this._events[type] === 'object' && !this._events[type].warned) {
        m = this._maxListeners;
        if (m && m > 0 && this._events[type].length > m) {
            this._events[type].warned = true;
            console.error('warning: possible EventEmitter memory leak detected. ' + this._events[type].length + ' listeners added. Use emitter.setMaxListeners() to increase limit.');
            console.trace();
        }
    }
    return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

/**
 * 添加单次监听
 * @param type 事件名
 * @param listener 监听函数
 * @returns {EventEmitter}
 */
EventEmitter.prototype.once = function (type, listener) {
    if (typeof listener !== 'function') {
        throw new TypeError('listener must be a function');
    }
    var self = this;

    function g() {
        self.removeListener(type, g);
        listener.apply(this, arguments);
    }

    g.listener = listener;
    this.on(type, g);
    return this;
};

/**
 * 移除监听函数
 * @param type 事件名
 * @param listener 函数
 * @returns {EventEmitter}
 */
EventEmitter.prototype.removeListener = function (type, listener) {
    var list, position, length, i;
    if (typeof listener !== 'function') {
        throw new TypeError('listener must be a function');
    }
    if (!this._events || !this._events[type]) {
        return this;
    }
    list = this._events[type];
    length = list.length;
    position = -1;
    if (list === listener || (typeof list.listener === 'function' && list.listener === listener)) {
        delete this._events[type];
        if (this._events.removeListener) {
            this.emit('removeListener', type, listener);
        }
    } else if (typeof list === 'object') {
        for (i = length; i-- > 0;) {
            if (list[i] === listener || (list[i].listener && list[i].listener === listener)) {
                position = i;
                break;
            }
        }
        if (position < 0) {
            return this;
        }
        if (list.length === 1) {
            list.length = 0;
            delete this._events[type];
        } else {
            list.splice(position, 1);
        }
        if (this._events.removeListener) {
            this.emit('removeListener', type, listener);
        }
    }
    return this;
};

/**
 * 清空所有事件
 * @param [type] 事件名
 * @returns {EventEmitter}
 */
EventEmitter.prototype.removeAllListeners = function (type) {
    var key, listeners;
    if (!this._events) {
        return this;
    }
    if (!this._events.removeListener) {
        if (arguments.length === 0) {
            this._events = {};
        } else if (this._events[type]) {
            delete this._events[type];
        }
        return this;
    }

    if (arguments.length === 0) {
        for (key in this._events) {
            if (key === 'removeListener') {
                continue;
            }
            if (this._events.hasOwnProperty(key)) {
                this.removeAllListeners(key);
            }
        }
        this.removeAllListeners('removeListener');
        this._events = {};
        return this;
    }
    listeners = this._events[type];
    if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
    } else {
        while (listeners.length) {
            this.removeListener(type, listeners[listeners.length - 1]);
        }
    }
    delete this._events[type];
    return this;
};

/**
 * 获取全部监听函数
 * @param type 事件名
 * @returns {*}
 */
EventEmitter.prototype.listeners = function (type) {
    var ret;
    if (!this._events || !this._events[type]) {
        ret = [];
    } else if (typeof this._events[type] === 'function') {
        ret = [this._events[type]];
    } else {
        ret = this._events[type].slice();
    }
    return ret;
};

exports.EventEmitter = EventEmitter;
