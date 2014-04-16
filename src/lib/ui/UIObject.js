/**
 * Created by 清月_荷雾 on 14-2-8.
 * author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * UI组件基础类库
 */
var util = require("../util/util");
var dom = require("../util/dom");
var EventEmitter = require("../util/event").EventEmitter;

/**
 * UI对象基类
 * @param options 配置参数
 * @constructor
 */
function UIObject(options) {
    EventEmitter.call(this);
    options = options || {
        html: "<div></div>"
    };
    var html = options.html || options;
    if (!/^ *</.test(html)) {
        html = '<div class="' + html + '"></div>';
    }
    var doms = dom.createDom(html);
    if (util.isArray(doms)) {
        this._dom = dom.createDom("<div></div>");
        for (var i = 0; i < doms.length; i++) {
            this._dom.appendChild(doms[i]);
        }
    } else {
        this._dom = doms || null;
    }
    this._children = [];
    this._eventCache = [];
}

util.inherits(UIObject, EventEmitter);

/**
 * 挂接对象到dom树
 * @param parent {Node}
 */
UIObject.prototype.attach = function (parent) {
    var me = this;
    parent = dom.find(parent);
    for (var i = 0; i < parent.length; i++) {
        parent[i].appendChild(me._dom);
    }
};

/**
 * 显示元素
 */
UIObject.prototype.show = function () {
    dom.removeClass(this._dom, "hidden");
};

/**
 * 隐藏元素
 */
UIObject.prototype.hide = function () {
    dom.addClass(this._dom, "hidden");
};

/**
 * 将对象从dom树上移除
 */
UIObject.prototype.detach = function () {
    if (this._dom && this._dom.parentNode) {
        this._dom.parentNode.removeChild(this._dom);
    }
};

/**
 * 在本对象中追加元素
 * @param ele 要追加的元素
 */
UIObject.prototype.append = function (ele) {
    this._children.push(ele);
    if (ele._dom) {
        this._dom.appendChild(ele._dom);
    }
};

/**
 * 在本对象中追加元素
 * @param ele 要追加的元素
 */
UIObject.prototype.prepend = function (ele) {
    this._children.unshift(ele);
    if (this._dom.firstChild) {
        this._dom.insertBefore(ele._dom, this._dom.firstChild);
    } else {
        this._dom.appendChild(ele._dom);
    }
};


/**
 * 在本对象删除UIObject元素
 * @param ele 要删除的元素
 */
UIObject.prototype.remove = function (ele) {
    if (!(ele instanceof UIObject)) {
        throw  new Error("只能移除UIObject元素");
    }
    var index = -1;
    for (var i = 0; i < this._children.length; i++) {
        if (this._children[i] === ele) {
            index = i;
        }
    }
    if (index >= 0) {
        this._children.splice(index, 1);
    }
    if (ele._dom && ele._dom.parentNode) {
        ele._dom.parentNode.removeChild(ele._dom);
    }
};

/**
 * 清空内部元素
 * @param type
 */
UIObject.prototype.clear = function (type) {
    for (var i = 0; i < this._children.length; i++) {
        var item = this._children[i];
        if (item._dom && item._dom.parentNode) {
            item._dom.parentNode.removeChild(item._dom);
        }
        if (type) {
            item.destroy(true);
        }
    }
    this._children = [];
};

/**
 * 查询元素
 * @param selector  需要查询的元素
 * @returns {*}
 */
UIObject.prototype.find = function (selector) {
    selector = selector || this._dom;
    return dom.find(selector, this._dom);
};

/**
 * 绑定事件
 * @param target    目标对象Dom或者Dom数组
 * @param type      事件类型
 * @param listener  事件方法
 */
UIObject.prototype.bind = function (target, type, listener) {
    var me = this;
    var item;
    if (!util.isArray(target)) {
        target = me.find(target);
    }
    if (!target) {
        target = [this._dom];
    }
    for (var i = 0; i < target.length; i++) {
        item = target[i];
        item.addEventListener(type, listener, false);
        me._eventCache.push({
            target: item,
            type: type,
            listener: listener
        });
    }
};

/**
 * 解绑定事件
 * @param target    目标对象Dom或者Dom数组
 * @param type      事件类型
 * @param listener  事件方法
 */
UIObject.prototype.unbind = function (target, type, listener) {
    var me = this;
    var item, cache;
    if (!util.isArray(target)) {
        target = me.find(target);
    }
    for (var i = 0; i < target.length; i++) {
        item = target[i];
        for (var j = 0; j < this._eventCache.length; j++) {
            cache = this._eventCache[j];
            if (type === cache.type && item === cache.target && listener === cache.listener) {
                item.removeEventListener(type, listener, false);
            }
        }
    }
};

/**
 * 对此对象和其所有的子级对象触发事件
 */
function emitAll() {
    for (var i = 0; i < this._children.length; i++) {
        emitAll.apply(this._children[i], arguments);
    }
    EventEmitter.prototype.emit.apply(this, arguments);
}

UIObject.prototype.emitAll = emitAll;


/**
 * 销毁方法（销毁对象上绑定的所有事件）
 * @param isSelf
 */
UIObject.prototype.destroy = function (isSelf) {
    if (!this._eventCache && !this._children && !this._dom && !this._events) {
        return;
    }
    this.emit('destroy');
    for (var i = 0; i < this._children.length; i++) {
        this._children[i].destroy(false);
    }
    this._children = null;
    this.removeAllListeners();
    this._events = null;
    var item;
    for (i = 0; i < this._eventCache.length; i++) {
        item = this._eventCache[i];
        item.target.removeEventListener(item.target, item.listener, false);
    }
    this._eventCache = null;
    if (isSelf && this._dom) {
        var garbageBin = document.getElementById('IELeakGarbageBin');
        if (!garbageBin) {
            garbageBin = document.createElement('div');
            garbageBin.id = 'IELeakGarbageBin';
            garbageBin.style.display = 'none';
            document.body.appendChild(garbageBin);
        }
        garbageBin.appendChild(this._dom);
        garbageBin.innerHTML = '';
        this._dom = null;
    }
};

function create(obj) {
    obj = obj || "<div></div>";
    if (obj instanceof UIObject) {
        return obj;
    }
    if (typeof obj === "string") {
        return new UIObject(obj);
    }
    var UIType = obj.type || UIObject;
    var result = new UIType(obj.args);

    for (var x in obj) {
        if (x !== "children" && x !== "args" && x !== "type" && x !== "listeners" && obj.hasOwnProperty(x)) {
            result.on(x, obj[x]);
        }
    }
    if (obj.listeners) {
        var listeners = obj.listeners;
        if (!util.isArray(listeners)) {
            listeners = [listeners];
        }
        for (var j = 0; j < listeners.length; j++) {
            result.bind(listeners[j].target ? listeners[j].target : result._dom, listeners[j].type, listeners[j].listener);
        }
    }
    if (obj.children) {
        var children = obj.children;
        if (!util.isArray(children)) {
            children = [children];
        }
        for (var i = 0; i < children.length; i++) {
            result.append(create(children[i]));
        }
    }
    return result;
}

exports.create = create;

exports.UIObject = UIObject;