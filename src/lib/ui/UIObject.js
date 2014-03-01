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
function UIObject() {
    EventEmitter.call(this);
    this._dom = null;
    this._eventCache = [];
}

util.inherits(UIObject, EventEmitter);

/**
 * 挂接对象到dom树
 * @param parentObject  父对象
 */
UIObject.prototype.attach = function (parentObject) {
    var me = this;
    var parent = getParent(parentObject);
    for (var i = 0; i < parent.length; i++) {
        parent[i].appendChild(me._dom);
    }
};

/**
 * 将对象从dom树上移除
 */
UIObject.prototype.detach = function () {
    if (this._dom) {
        if (this._dom.parentNode) {
            parent.removeChild(this._dom);
        }
    }
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
 * 销毁方法（销毁对象上绑定的所有事件）
 * @param isSelf
 */
UIObject.prototype.destroy = function (isSelf) {
    this.emit('destroy');
    this.removeAllListeners();
    var item;
    for (var i = 0; i < this._eventCache.length; i++) {
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

/**
 * 获取父元素
 * @param parentObject  父元素对象或数组或dom
 * @returns {*}
 * @private
 */
function getParent(parentObject) {
    if (parentObject) {
        //判断是dom还是UIObject
        return parentObject instanceof UIObject
            ? [parentObject._dom]
            : dom.find(parentObject);
    }
    return [];
}

exports.UIObject = UIObject;