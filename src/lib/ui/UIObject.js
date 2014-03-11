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
    if (typeof options !== "object") {
        options = {
            html: options
        };
    }
    options = options || {};
    EventEmitter.call(this);
    this._dom = dom.createDom(options.html) || null;
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
    ele._dom.parentNode.removeChild(ele._dom);
};

/**
 * 查询元素
 * @param selector  需要查询的元素
 * @returns {*}
 */
UIObject.prototype.find = function (selector) {
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
        return;
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
    if (!this._eventCache) {
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
    if (isSelf && this._parent) {
        this._parent.remove(this);
    }
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
    if (!obj) {
        return new UIObject();
    }
    if (obj instanceof UIObject) {
        return obj;
    }
    if (typeof obj === "string") {
        if (obj.charAt(0) !== "<") {
            obj = '<div class="' + obj + '"></div> ';
        }
        return new UIObject({html: obj});
    }
    var result = null;
    var UIType = obj.type || UIObject;
    if (UIType === UIObject) {
        var content = obj.args;
        if (typeof content === "string") {
            content = content || "";
            if (content.charAt(0) !== "<") {
                content = '<div class="' + content + '"></div>';
            }
            content = {html: content};
        }
        result = new UIObject(content);
    } else {
        result = new UIType(obj.args);
    }
    if (obj.event) {
        for (var x in obj.event) {
            if (obj.event.hasOwnProperty(x)) {
                var item = obj.event[x];
                if (typeof item === "function") {
                    result.on(x, item);
                } else {
                    result.bind(item.target, item.type, item.listener);
                }
            }
        }
    }
    if (!obj.children) {
        return result;
    }
    var children = obj.children;
    if (!util.isArray(children)) {
        children = [children];
    }
    for (var i = 0; i < children.length; i++) {
        result.append(create(children[i]));
    }
    return result;
}

UIObject.create = create;

exports.UIObject = UIObject;