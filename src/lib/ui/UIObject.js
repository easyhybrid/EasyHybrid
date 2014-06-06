/**
 * Created by 清月_荷雾 on 14-2-8.
 * author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * UI组件基础类库
 */
var util = require("../util/util"),
    dom = require("../util/dom"),
    EventEmitter = util.EventEmitter,
    rhtml = /<|&#?\w+;/,
    noData = {
        "applet ": true,
        "embed ": true,
        "object ": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
    };

/**
 * UI对象基类
 * @param html 用于创建对象的元素或者HTML字符串
 * @constructor
 */
function UIObject(html) {
    EventEmitter.call(this);
    html = html || "<div></div>";
    //处理html为css字符串
    if (!rhtml.test(html)) {
        html = '<div class="' + html + '"></div>';
    }
    this._dom = dom.parse(html)[0];//仅使用第一个元素的内容作为节点
    this._children = {};//子元素节点
    this._handles = {};//DOM事件缓存
    this._expando = "data" + util.uuid();//本对象中元素事件的标识
}

util.inherits(UIObject, EventEmitter);

/**
 * 将本对象挂接到dom树
 * @param parent {Element|string}
 */
UIObject.prototype.attach = function (parent) {
    if (typeof parent === "string") {
        if (rhtml.test(parent)) {
            parent = dom.parse(parent);
        } else {
            parent = dom.find(parent);
        }
    }
    if (parent.length) {
        parent = parent[0];
    }
    //不能将节点挂接在非HTML元素上
    if (parent.nodeType !== 1) {
        return false;
    }
    return parent.appendChild(this._dom);
};

/**
 * 将本对象从dom树上移除
 */
UIObject.prototype.detach = function () {
    if (this._dom && this._dom.parentNode) {
        this._dom.parentNode.removeChild(this._dom);
    }
    return this._dom;
};

/**
 * 在某DOM元素中追加一个UIObject子元素
 * @param ele {UIObject}  要追加的元素
 * @param [refNode] {Element|string|undefined} 参考节点，如果不传，表示使用当前元素的根节点
 */
UIObject.prototype.append = function (ele, refNode) {
    refNode = refNode || this._dom;
    if (typeof refNode === "string") {
        refNode = dom.find(refNode, this._dom);
    }
    if (refNode.length) {
        refNode = refNode[0];
    }
    if (!refNode) {
        util.error("参考节点不存在");
    }
    this._children = this._children || {};
    this._children[ele._expando] = ele;
    refNode.appendChild(ele._dom);
};

/**
 * 在某DOM元素前插入一个UIObject
 * @param ele {UIObject}  要追加的元素
 * @param refNode {Element|string|undefined} 参考节点
 */
UIObject.prototype.insert = function (ele, refNode) {
    if (typeof refNode === "string") {
        refNode = dom.find(parent);
    }
    if (refNode.length) {
        refNode = refNode[0];
    }
    if (!refNode || !refNode.parentNode) {
        util.error("参考节点不存在");
    }
    this._children = this._children || {};
    this._children[ele._expando] = ele;
    refNode.parentNode.insertBefore(ele._dom, refNode);
};

/**
 * 单纯添加一个元素到子元素数组中
 * @param ele {UIObject}  要追加的元素
 */
UIObject.prototype.add = function (ele) {
    this._children = this._children || {};
    this._children[ele._expando] = ele;
};

/**
 * 在本对象删除UIObject元素
 * @param ele {UIObject} 要删除的元素
 * @param fouce {boolean} 是否直接销毁元素
 */
UIObject.prototype.remove = function (ele, fouce) {
    if (ele._expando in this._children) {
        delete  this._children[ele._expando];
    }
    if (fouce) {
        ele.destroy(true);
    } else {
        ele.detach();
    }
};

/**
 * 清空内部元素
 * @param type {boolean} 是否清理元素的DOM
 */
UIObject.prototype.clear = function (type) {
    if (this._children === null) {
        return;
    }
    util.each(this._children, function (i, item) {
        item.destroy(type);
    });
    this._children = null;
};


/**
 * 销毁方法（销毁对象上绑定的所有事件）
 * @param type {boolean} 是否销毁Dom元素
 */
UIObject.prototype.destroy = function (type) {
    this.emit('destroy');
    this.clean(false);
    //    for (i = 0; i < this._handles.length; i++) {
    //        item = this._handles[i];
    //        item.target.removeEventListener(item.target, item.listener, false);
    //    }
    this._handles = null;
    if (type && this._dom) {
        dom.destroy(this._dom);
    }
    this._dom = null;
};

/**
 * 查询元素
 * @param selector {string}  需要查询的元素
 * @returns {*}
 */
UIObject.prototype.find = function (selector) {
    return dom.find(selector, this._dom);
};

/**
 * 为元素绑定数据，内部使用
 * @param elem {HTMLElement}
 * @param name {string} 属性名
 * @param data {string} 属性值
 * @private
 */
UIObject.prototype._data = function (elem, name, data) {
    if (!elem || !elem.nodeType || elem.nodeType !== 1 && elem.nodeType !== 9) {
        return;
    }
    var ndata = noData[elem.nodeName.toLowerCase()],
        id, cache;
    if (ndata === true || elem.getAttribute("classid") === noData) {
        return;
    }
    id = elem[ this._expando ];
    if (!id) {
        id = util.uuid();
        dom.attr(elem, this._expando, id);
    }
    cache = this._handles[id] = this._handles[id] || {};
    if (arguments.length < 2) {
        return cache[name];
    }
    if (value === null) {
        delete cache[name];
    } else {
        cache[name] = value;
    }
};

/**
 * 绑定事件或者委托
 * @param target {Array|string|Element|object} 目标对象Dom或者Dom数组
 * @param types {string|object} 事件类型
 * @param [listener] {function} 事件方法
 * @param [selector] {string} 委托选择器
 * @param [data] {*}
 */
UIObject.prototype.on = function (target, types, listener,selector) {
    var me = this;
    if (!target) {
        target = [this._dom];
    }
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
 * 绑定事件或者委托
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
UIObject.prototype.emitAll = function emitAll() {
    for (var i = 0; i < this._children.length; i++) {
        emitAll.apply(this._children[i], arguments);
    }
    EventEmitter.prototype.emit.apply(this, arguments);
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