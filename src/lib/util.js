/**
 * Created by 清月_荷雾 on 14-2-8.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 * @note 工具函数和工具组件类
 */

//region 数据类型判断函数
/**
 * 判断对象是不是数组
 * @param obj 要判断的对象
 * @returns {boolean}
 */
function isArray(obj) {
    return typeof obj === "object" && Object.prototype.toString.call(obj).slice(8, -1) === "[object Array]";
}
exports.isArray = isArray;

/**
 * 判断对象是不是正则表达式
 * @param obj 要判断的对象
 * @returns {boolean}
 */
function isRegExp(obj) {
    return typeof obj === "object" && Object.prototype.toString.call(obj).slice(8, -1) === "[object RegExp]";
}
exports.isRegExp = isRegExp;

/**
 * 判断对象是不是异常类型
 * @param obj 要判断的对象
 * @returns {boolean}
 */
function isError(obj) {
    return typeof obj === 'object' && Object.prototype.toString.call(obj) === '[object Error]';
}
exports.isError = isError;


/**
 * 判断对象是不是日期类型
 * @param obj 要判断的对象
 * @returns {boolean}
 */
function isDate(obj) {
    return typeof obj === 'object' && Object.prototype.toString.call(obj) === '[object Date]';
}
exports.isDate = isDate;

//endregion 数据类型判断函数

//region DOM操作相关函数

/**
 * 查询元素
 * @param selector  需要查询的元素
 * @param [context]   上下文
 * @returns {*}
 */
function find(selector, context) {
    context = context || document;
    var result = [];
    if (selector) {
        if (typeof selector === 'string') {
            var nodeList = context.querySelectorAll(selector);
            result = nodeToArray(nodeList);
        }
        else if (selector.nodeType === 1 || selector.nodeType === 9) {
            result = [selector];
        }
        else if (isArray(selector)) {
            result = selector;
        }
    }
    return result.length ? result : null;
}
exports.find = find;

/**
 * 将nodeList转成数组
 * @param nodeList
 * @returns {Array}
 */
function nodeToArray(nodeList) {
    var result = [];
    for (var i = 0; i < nodeList.length; i++) {
        result.push(nodeList[i]);
    }
    return result;
}

/**
 * 创建Dom节点（不支持IE10以下浏览器）
 * @param html  html片段
 * @returns {*}  Dom节点或数组
 */
function createDom(html) {
    if (!html) {
        return null;
    }
    var dom = document.createElement('div');
    dom.innerHTML = html;
    var list = nodeToArray(dom.childNodes);
    return list.length === 1 ? list[0] : list;
}
exports.createDom = createDom;

/**
 * 为元素添加class
 * @param dom dom或者dom数组
 * @param classname 样式名称字符串，多个样式用空格隔开
 */
function addClass(dom, classname) {
    if (!isArray(dom)) {
        dom = [dom];
    }
    var classes = ( classname || "" ).match(/\S+/g) || [];
    for (var i = 0; i < dom.length; i++) {
        var elem = dom[i];
        var cur = elem.nodeType === 1 && ( elem.className ? ( " " + elem.className + " " ).replace(/[\t\r\n\f]/g, " ") : " ");
        if (cur) {
            for (var j = 0; j < classes.length; j++) {
                var clazz = classes[j];
                if (cur.indexOf(" " + clazz + " ") < 0) {
                    cur += clazz + " ";
                }
            }
            elem.className = cur.trim();
        }
    }
}
exports.addClass = addClass;

/**
 * 为元素移除样式
 * @param dom
 * @param classname
 */
function removeClass(dom, classname) {
    if (!isArray(dom)) {
        dom = [dom];
    }
    var classes = ( classname || "" ).match(/\S+/g) || [];
    for (var i = 0; i < dom.length; i++) {
        var elem = dom[i];
        var cur = elem.nodeType === 1 && ( elem.className ? ( " " + elem.className + " " ).replace(/[\t\r\n\f]/g, " ") : " ");
        if (cur) {
            for (var j = 0; j < classes.length; j++) {
                var clazz = classes[j];
                while (cur.indexOf(" " + clazz + " ") >= 0) {
                    cur = cur.replace(" " + clazz + " ", " ");
                }
            }
            elem.className = cur.trim();
        }
    }
}
exports.removeClass = removeClass;
//endregion DOM操作相关函数

//region 相关操作函数

/**
 * 继承函数
 * @param  {function} subClass    子类
 * @param  {function} superClass  父类
 */
function inherits(subClass, superClass) {
    var F = function () {
    };
    F.prototype = superClass.prototype;

    subClass.prototype = new F();
    subClass.prototype.constructor = {
        value: 'subClass',
        enumerable: false,
        writable: true,
        configurable: true
    }
}

exports.inherits = inherits;

/**
 * 如果是数组则进行追加合并，如果是对象则进行归并
 * @param first     目标对象
 * @param second    待合并对象
 * @returns {*}
 */
function merge(first, second) {
    //对数组进行push操作
    if (isArray(first) && isArray(second)) {
        for (var i = 0; i < second.length; i++) {
            first.push(second[i]);
        }
    } else {
        for (var key in second) {
            if (second.hasOwnProperty(key) && second[key] != undefined) {
                first[key] = second[key];
            }
        }
    }
}
exports.merge = merge;

var formatRegExp = /%[sdj%]/g;
/**
 * 格式化字符串
 * @param {...*} [args] 要格式化的字符串
 */
function formatString(args) {
    var i = 1;
    args = arguments;
    var str = arguments[0];
    var len = args.length;
    return str.replace(formatRegExp, function (x) {
        if (x === '%%') return '%';
        if (i >= len) return x;
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
exports.formatString = formatString;
//endregion 相关操作函数

//region EventEmitter

/**
 * EventEmitter事件操作类
 * @constructor
 */
function EventEmitter() {
    this._events = this._events || {};
    this._maxListeners = this._maxListeners || 10;
}

EventEmitter.prototype.setMaxListeners = function (n) {
    if (typeof n !== 'number' || n < 0) {
        throw new TypeError('n must be a positive number');
    }
    this._maxListeners = n;
};
EventEmitter.prototype.emit = function (type) {
    var er, handler, len, args, i, listeners;
    if (!this._events) {
        this._events = {};
    }
    // If there is no 'error' event listener then throw.
    if (type === 'error') {
        if (!this._events.error || (typeof this._events.error === 'object' && !this._events.error.length)) {
            er = arguments[1];
            if (er instanceof Error) {
                throw er; // Unhandled 'error' event
            } else {
                throw new TypeError('Uncaught, unspecified "error" event.');
            }
        }
    }

    handler = this._events[type];
    if (typeof handler === 'undefined') {
        return false;
    }
    if (typeof handler === 'function') {
        // if argument is less than 3,user fast case
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
            default://the slower one
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
// emits a 'removeListener' event iff the listener was removed
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
EventEmitter.prototype.removeAllListeners = function (type) {
    var key, listeners;
    if (!this._events) {
        return this;
    }
    // not listening for removeListener, no need to emit
    if (!this._events.removeListener) {
        if (arguments.length === 0) {
            this._events = {};
        } else if (this._events[type]) {
            delete this._events[type];
        }
        return this;
    }
    // emit removeListener for all listeners on all events
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
EventEmitter.listenerCount = function (emitter, type) {
    var ret;
    if (!emitter._events || !emitter._events[type]) {
        ret = 0;
    } else if (typeof emitter._events[type] === 'function') {
        ret = 1;
    } else {
        ret = emitter._events[type].length;
    }
    return ret;
};

exports.EventEmitter = EventEmitter;
//endregion EventEmitter

//region 系统信息
/**
 * 根据userAgent对系统进行设置
 * @param userAgent 用户代理信息
 * @constructor
 */
function OS(userAgent) {
    this.webkit = userAgent.match(/WebKit\/([\d.]+)/) ? true : false;
    this.android = userAgent.match(/(Android)\s+([\d.]+)/) || userAgent.match(/Silk-Accelerated/) ? true : false;
    this.androidICS = this.android && userAgent.match(/(Android)\s4/) ? true : false;
    this.ipad = userAgent.match(/(iPad).*OS\s([\d_]+)/) ? true : false;
    this.iphone = !this.ipad && userAgent.match(/(iPhone\sOS)\s([\d_]+)/) ? true : false;
    this.webos = userAgent.match(/(webOS|hpwOS)[\s\/]([\d.]+)/) ? true : false;
    this.touchpad = this.webos && userAgent.match(/TouchPad/) ? true : false;
    this.ios = this.ipad || this.iphone;
    this.playbook = userAgent.match(/PlayBook/) ? true : false;
    this.blackberry = this.playbook || userAgent.match(/BlackBerry/) ? true : false;
    this.blackberry10 = this.blackberry && userAgent.match(/Safari\/536/) ? true : false;
    this.chrome = userAgent.match(/Chrome/) ? true : false;
    this.opera = userAgent.match(/Opera/) ? true : false;
    this.fennec = userAgent.match(/fennec/i) ? true : userAgent.match(/Firefox/) ? true : false;
    this.ie = userAgent.match(/MSIE 10.0/i) ? true : false;
    this.ieTouch = this.ie && userAgent.toLowerCase().match(/touch/i) ? true : false;
    this.supportsTouch = ((window.DocumentTouch && document instanceof window.DocumentTouch) || 'ontouchstart' in window);
    var head = document.documentElement.getElementsByTagName("head")[0];
    this.nativeTouchScroll = typeof (head.style["-webkit-overflow-scrolling"]) !== "undefined" && this.ios;
    if (this.android && !this.webkit) {
        this.android = false;
    }
}
exports.os = new OS(window.navigator.userAgent);
//endregion 系统信息

//region 数据库方法
var lo = localStorage;

/**
 * 保存本地数据到localStorage中
 * @param key 保存的键
 * @param value 要保存的对象
 */
function setStorageItem(key, value) {
    lo.setItem(key, JSON.stringify({
        content: value
    }));
}
exports.setStorageItem = setStorageItem;

/**
 * 从本地localStorage中获取数据
 * @param key 要获取的键
 * @returns {*}
 */
function getStorageItem(key) {
    var data = lo.getItem(key);
    if (!data) {
        return null;
    }
    return JSON.parse(data).content;
}
exports.getStorageItem = getStorageItem;

/**
 * 清空本地localStorage
 */
function clearStorage() {
    lo.clear();
}
exports.clearStorage = clearStorage;

//endregion 数据库方法
