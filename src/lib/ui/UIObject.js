/**
 * Created by 清月_荷雾 on 14-2-8.
 * author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * UI组件基础类库
 */
var util = require("../util/util");
var dom = require("../util/dom");
var EventEmitter = require("../util/EventEmitter").EventEmitter;

/**
 * UI对象基类
 * @constructor
 */
function UIObject(dom) {
    EventEmitter.call(this);
    this._dom = dom || null;
    this._parent = null;
    this._children = [];
    this._eventCache = [];
}

util.inherits(UIObject, EventEmitter);

/**
 * 挂接对象到dom树
 * @param parentObject  父对象
 */
UIObject.prototype.attach = function (parentObject) {
    var me = this;
    var parent = dom.find(parentObject);

    if (parentObject instanceof UIObject) {
        parentObject.append(me);
    }

    for (var i = 0; i < parent.length; i++) {
        parent[i].appendChild(me._dom);
    }
};

/**
 * 将对象从dom树上移除
 */
UIObject.prototype.detach = function () {
    var me = this;
    if (me._parent) {
        me._parent.remove(me);
        return;
    }
    if (this._dom && this._dom.parentNode) {
        this._dom.parentNode.removeChild(this._dom);
    }
};

/**
 * 在本对象中追加元素（可以对DOM元素进行追加，但是无法使用remove函数对追加的元素进行移除）
 * @param ele 要追加的元素
 */
UIObject.prototype.append = function (ele) {
    if (typeof ele === "string") {
        ele = dom.createDom(ele);
    }
    if (!this._dom) {
        this._dom = dom.createDom("<div></div>");
    }
    if (!(ele instanceof UIObject)) {
        if (!util.isArray(ele)) {
            ele = [ele];
        }
        for (var i = 0; i < ele.length; i++) {
            this._dom.appendChild(ele[i]);
        }
        return;
    }
    this._children.push(ele);
    ele._parent = this;
    this._dom.appendChild(ele._dom);
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
    ele._parent = null;
    ele._dom.parent.removeChild(ele._dom);
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
    this.emit('destroy');
    for (var i = 0; i < this._children.length; i++) {
        this._children[i].destroy(false);
    }
    this._children = null;
    this.removeAllListeners();
    var item;
    for (i = 0; i < this._eventCache.length; i++) {
        item = this._eventCache[i];
        item.target.removeEventListener(item.target, item.listener, false);
    }
    this._eventCache = null;
    if (isSelf && this._parent) {
        this._parent.remove(this);
    }
    this._parent = null;
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

exports.UIObject = UIObject;