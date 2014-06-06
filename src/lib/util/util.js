/**
 * Created by 清月_荷雾 on 14-2-8.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 * @note 本文件为与运行环境无关的Javascript工具函数
 */

var class2type = {},
    formatRegExp = /%[sdj%]/g,
    nextGuid = 1,
    defaultorder = function (a, b) {
        if (a === b) {
            return 0;
        }
        return a - b;
    },
    F = function () {
    },
    rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;

each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function (i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

/*region types*/
/**
 * 获取对象类型
 * @param obj 对象
 * @returns {string} 类型名
 */
function typeName(obj) {
    if (obj == null) {
        return obj + "";
    }
    return typeof obj === "object" || typeof obj === "function" ?
        class2type[ Object.prototype.toString.call(obj) ] || "object" :
        typeof obj;
}
exports.type = typeName;

/**
 * 判断对象是不是数组
 * @param obj 要判断的对象
 * @returns {boolean}
 */
function isArray(obj) {
    return typeof obj === "object" && typeName(obj) === 'array';
}
exports.isArray = isArray;

/**
 * 判断对象是不是正则表达式
 * @param obj 要判断的对象
 * @returns {boolean}
 */
function isRegExp(obj) {
    return typeof obj === "object" && typeName(obj) === 'regexp';
}
exports.isRegExp = isRegExp;

/**
 * 判断对象是不是日期类型
 * @param obj 要判断的对象
 * @returns {boolean}
 */
function isDate(obj) {
    return typeof obj === 'object' && typeName(obj) === 'date';
}
exports.isDate = isDate;

/**
 * 判断对象是不是异常类型
 * @param obj 要判断的对象
 * @returns {boolean}
 */
function isError(obj) {
    return typeof obj === 'object' && typeName(obj) === 'error';
}
exports.isError = isError;

/**
 * 判断元素是不是有效的数字（排除NaN和infinity）
 * @param obj
 * @returns {boolean}
 */
function isNumeric(obj) {
    return !isArray(obj) && obj - parseFloat(obj) >= 0;
}
exports.isNumeric = isNumeric;

/**
 * 判断对象是否函数
 * @param obj
 * @returns {boolean}
 */
function isFunction(obj) {
    return typeName(obj) === 'function' && typeName(obj) === 'function';
}
exports.isFunction = isFunction;
/*endregion types*/

/*region tools*/
/**
 * 原型继承函数
 * @param  {function} subClass    子类
 * @param  {function|object} superClass  父类
 */
function inherits(subClass, superClass) {
    F.prototype = isFunction(superClass) ? superClass.prototype : superClass;
    subClass.prototype = new F();
    subClass.prototype.constructor = subClass;
}
exports.inherits = inherits;

/**
 * 生成一个uuid
 * @returns {string}
 */
function uuid() {
    return create_uuid_part(4) + '-' +
        create_uuid_part(2) + '-' +
        create_uuid_part(2) + '-' +
        create_uuid_part(2) + '-' +
        create_uuid_part(6);
}

function create_uuid_part(length) {
    var uuidpart = "",
        i, uuidchar;
    for (i = 0; i < length; i++) {
        uuidchar = parseInt((Math.random() * 256), 10).toString(16);
        if (uuidchar.length === 1) {
            uuidchar = "0" + uuidchar;
        }
        uuidpart += uuidchar;
    }
    return uuidpart;
}
exports.uuid = uuid;

/**
 * 获取当前时间
 * @type {Function}
 */
exports.now = Date.now || function () {
    return new Date().getTime();
};

/**
 * 对数组进行去重
 * @param results {Array} 要操作的数组
 * @param [isClone] {boolean} 是否返回副本（返回副本不会改变原来数组的内容，但会影响效率）
 * @param [compare] {Function} 比较方式
 */
function unique(results, isClone, compare) {
    var i;
    if (isClone) {
        results = merge([], results);
    }
    results.sort(compare || defaultorder);
    for (i = 1; i < results.length; i++) {
        if (!compare(results[i], results[ i - 1 ])) {
            results.splice(i--, 1);
        }
    }
    return results;
}
exports.unique = unique;

/**
 * 格式化字符串
 * @param {...|string} [str] 要格式化的字符串
 */
function formatString(str) {
    var i = 1,
        args = arguments,
        len = args.length;
    return str.replace(formatRegExp, function (x) {
        if (x === '%%') {
            return '%';
        }
        if (i >= len) {
            return x;
        }
        switch (x) {
            case '%s':
                return String(args[i++]);
            case '%d':
                return Number(args[i++]);
            case '%j':
                return JSON.stringify(args[i++]);
            default:
                return x;
        }
    });
}
exports.format = formatString;

/**
 * 丢出一个错误
 * @param msg 错误的信息
 */
function error(msg) {
    throw new Error(msg);
}
exports.error = error;

/**
 * 空操作
 */
function noop() {
}
exports.noop = noop;

/**
 * 去除字符串中的空白字符（同时删除bom）
 * @param str
 */
function trim(str) {
    return str == null ? "" : ( str + "" ).replace(rtrim, "");
}
exports.trim = trim;

/**
 * 为函数绑定上下文
 * @param fn 函数名
 * @param context 上下文对象
 */
function proxy(fn, context) {
    var args, proxyfn;
    if (!isFunction(fn)) {
        return;
    }
    args = Array.prototype.slice.call(arguments, 2);
    proxyfn = function () {
        return fn.apply(context || this, args.concat(Array.prototype.slice.call(arguments)));
    };
    proxyfn.guid = fn.guid = fn.guid || uuid();
    return proxyfn;
}
exports.proxy = proxy;
/*endregion tools*/

/*region objects*/
/**
 * 如果是数组则进行追加合并，如果是对象则进行归并
 * @param first     目标对象
 * @param second    待合并对象
 * @param [deep]      是否深度合并
 * @returns {*}
 */
function merge(first, second, deep) {
    var i, key;
    if (!second || typeof second === 'function' || isDate(second) || typeof second !== 'object') {
        first = second;
        return first;
    }
    if (isArray(first) && isArray(second)) {
        for (i = 0; i < second.length; i++) {
            if (deep) {
                if (isArray(second[i])) {
                    first.push(merge([], second[i], true));
                } else {
                    first.push(merge({}, second[i], true));
                }
            } else {
                first.push(second[i]);
            }
        }
    } else {
        for (key in second) {
            if (second.hasOwnProperty(key) && second[key] !== undefined) {
                if (!deep || !second[key] || typeof second[key] === 'function' || isDate(second[key]) || typeof second[key] !== 'object') {
                    first[key] = second[key];
                } else if (isArray(second[key])) {
                    first[key] = merge(first[key] || [], second[key], true);
                } else {
                    first[key] = merge(first[key] || {}, second[key], true);
                }
            }
        }
    }
    return first;
}
exports.merge = merge;

/**
 * 递归复制对象（非循环引用安全版）
 * @param obj 要复制的对象
 * @returns {*}
 */
function clone(obj) {
    var retVal, i, x;
    if (!obj || typeof obj === 'function' || isDate(obj) || typeof obj !== 'object') {
        return obj;
    }
    if (isArray(obj)) {
        retVal = [];
        for (i = 0; i < obj.length; ++i) {
            retVal.push(clone(obj[i]));
        }
        return retVal;
    }
    retVal = {};
    for (x in obj) {
        if (obj.hasOwnProperty(x)) {
            retVal[x] = clone(obj[x]);
        }

    }
    return retVal;
}
exports.clone = clone;

/**
 * 遍历对象
 * @param obj 对象
 * @param callback {Function} 回调函数
 * @param [args] 其它参数
 */
function each(obj, callback, args) {
    var value,
        i = 0,
        length = obj.length;
    if (isArray(obj)) {
        if (args) {
            for (; i < length; i++) {
                value = callback.apply(obj[ i ], args);
                if (value === false) {
                    break;
                }
            }
        } else {
            for (; i < length; i++) {
                value = callback.call(obj[ i ], i, obj[ i ]);
                if (value === false) {
                    break;
                }
            }
        }
    } else {
        if (args) {
            for (i in obj) {
                if (obj.hasOwnProperty(i)) {
                    value = callback.apply(obj[ i ], args);
                    if (value === false) {
                        break;
                    }
                }
            }
        } else {
            for (i in obj) {
                if (obj.hasOwnProperty(i)) {
                    value = callback.call(obj[ i ], i, obj[ i ]);
                    if (value === false) {
                        break;
                    }
                }
            }
        }
    }
    return obj;
}
exports.each = each;

/**
 * 异步调用数组中的每一个元素并执行回调
 * @param arr 数组
 * @param fn 调用的函数
 * @param cb 完成时的回调
 */
function async(arr, fn, cb) {
    var total = arr.length,
        i = 0;

    function done() {
        if (i >= total) {
            cb();
            return;
        }
        fn.call(arr[i], self[i], i, self, done);
        i++;
    }

    done();
}
exports.async = async;

/**
 * 过滤数组
 * @param elems {Array} 要过滤的数组元素
 * @param callback {Function} 过滤函数
 * @param invert {boolean} 为true时返回不匹配元素
 */
function grep(elems, callback, invert) {
    var callbackInverse,
        matches = [],
        i = 0,
        length = elems.length,
        callbackExpect = !invert;
    for (; i < length; i++) {
        callbackInverse = !callback(elems[ i ], i);
        if (callbackInverse !== callbackExpect) {
            matches.push(elems[ i ]);
        }
    }
    return matches;
}
exports.grep = grep;

/**
 * 遍历数组或者对象并将函数的执行结果变成新数组返回
 * @param elems 要遍历的元素
 * @param callback {Function} 过滤函数
 * @param arg 调用参数
 */
function map(elems, callback, arg) {
    var value,
        i = 0,
        length = elems.length,
        ret = [];

    if (isArray(elems)) {
        for (; i < length; i++) {
            value = callback(elems[ i ], i, arg);
            if (value != null) {
                ret.push(value);
            }
        }
    } else {
        for (i in elems) {
            if (elems.hasOwnProperty(i)) {
                value = callback(elems[ i ], i, arg);
                if (value != null) {
                    ret.push(value);
                }
            }
        }
    }
    return [].concat(ret);
}
exports.map = map;

/**
 * 将对象转换成数组
 * @param obj 类数组对象
 * @return {Array}
 */
function toArray(obj) {
    var length = obj.length,
        ret = [];
    if (typeName(obj) === "array" || length === 0 || typeof length === "number" && length > 0 && ( length - 1 ) in obj) {
        ret = merge(ret, Array.prototype.slice.call(obj, 0));
    }
    return ret;
}
exports.toArray = toArray;
/*endregion objects*/

/*region EventEmitter*/
/**
 * EventEmitter事件操作类
 * @constructor
 */
function EventEmitter() {
    this._events = this._events || {};
    this._maxListeners = this._maxListeners || 10;
}

/**
 * 触发事件
 * @param type 事件名
 * @returns {boolean}
 */
EventEmitter.prototype.emit = function (type) {
    var handler, len, args, i, listeners;
    if (!this._events) {
        this._events = {};
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
EventEmitter.prototype.on = function (type, listener) {
    if (typeof listener !== 'function') {
        throw new TypeError('listener must be a function');
    }
    if (!this._events) {
        this._events = {};
    }
    if (!this._events[type]) {
        this._events[type] = listener;
    } else if (typeof this._events[type] === 'object') {
        this._events[type].push(listener);
    } else {
        this._events[type] = [this._events[type], listener];
    }
    return this;
};

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
        self.off(type, g);
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
EventEmitter.prototype.off = function (type, listener) {
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
    }
    return this;
};

/**
 * 清空所有事件
 * @param [type] 事件名
 * @returns {EventEmitter}
 */
EventEmitter.prototype.clean = function (type) {
    if (!this._events) {
        return this;
    }
    if (arguments.length === 0) {
        this._events = null;
    } else if (this._events[type]) {
        delete this._events[type];
    }
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
/*endregion EventEmitter*/

/*region Channel*/
/**
 * 频道信息类
 * @param type 频道类型
 * @param [sticky] 是否单次执行
 * @constructor
 */
function Channel(type, sticky) {
    if (arguments.length === 1) {
        sticky = type;
        type = "Normal";
    }
    this.type = type;
    this.handlers = {};
    this.state = sticky ? 1 : 0;
    this.fireArgs = null;
    this.numHandlers = 0;
    this.onHasSubscribersChange = null;
}


/**
 * 将函数添加到频道
 * @param f 要添加的回调函数
 * @param [c] 上下文对象
 */
Channel.prototype.subscribe = function (f, c) {
    if (typeof f !== 'function') {
        error("Function required as first argument!");
    }
    if (this.state === 2) {
        f.apply(c || this, this.fireArgs);
        return;
    }

    var func = f,
        guid = f.observer_guid;
    if (typeof c === "object") {
        func = proxy(f, c);
    }
    if (!guid) {
        guid = '' + nextGuid++;
    }
    func.observer_guid = guid;
    f.observer_guid = guid;

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
 * @param f 回调函数
 */
Channel.prototype.unsubscribe = function (f) {
    if (typeof f !== 'function') {
        error("Function required as first argument!");
    }
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
 */
Channel.prototype.fire = function () {
    var fireArgs = Array.prototype.slice.call(arguments),
        i, toCall, item;
    if (this.state === 1) {
        this.state = 2;
        this.fireArgs = fireArgs;
    }
    if (this.numHandlers) {
        toCall = [];
        for (item in this.handlers) {
            if (this.handlers.hasOwnProperty(item)) {
                toCall.push(this.handlers[item]);
            }
        }
        for (i = 0; i < toCall.length; ++i) {
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

exports.Channel = Channel;

/**
 * 联合频道
 * @param h 要触发的函数
 * @param c 前置频道组
 */
exports.join = function (h, c) {
    var len = c.length,
        i = len,
        f = function () {
            if (!(--i)) {
                for (var j = 0; j < len; j++) {
                    c[j].unsubscribe(f);
                }
                f = null;
                h();
            }
        },
        j;
    for (j = 0; j < len; j++) {
        if (c[j].state === 0) {
            throw new Error('只能添加一次性频道.');
        }
        c[j].subscribe(f);
    }
    if (!len) {
        h();
    }
};
/*endregion Channel*/
