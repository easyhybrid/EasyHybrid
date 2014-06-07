/**
 * Created by 清月_荷雾 on 14-2-8.
 * author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * UI组件基础类库
 */
var util = require("../util/util"),
    dom = require("../util/dom"),
    EventEmitter = util.EventEmitter,
    rhtml = /<|&#?\w+;/;

/**
 * UI对象基类
 * @param html {Element|string|Array} 用于创建对象的元素或者HTML字符串
 * @param [domain] {Domain} 本对象使用的事件池
 * @constructor
 */
function UIObject(html, domain) {
    EventEmitter.call(this);
    if (!html) {
        html = dom.parse("<div></div>");
    } else if (typeof html === "string") {
        if (!rhtml.test(html)) {
            html = '<div class="' + html + '"></div>';
        }
        html = dom.parse(html);
    } else if (html.nodeType) {
        html = [html];
    }
    this._dom = html[0];//仅使用第一个元素的内容作为节点
    this._children = {};//子元素节点
    this._expando = "data" + util.uuid();//本对象中元素事件的标识
    this._relative = !!domain;//是否一个相对节点
    this._domain = domain || new dom.Domain(this._expando, this._dom);//用于事件绑定的节点
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

//noinspection JSUnusedGlobalSymbols
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
 */
UIObject.prototype.remove = function (ele) {
    if (ele._expando in this._children) {
        delete  this._children[ele._expando];
    }
    ele.detach();
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
 * 查询元素
 * @param selector {string}  需要查询的元素
 * @returns {*}
 */
UIObject.prototype.find = function (selector) {
    return dom.find(selector, this._dom);
};


/**
 * 绑定事件或者委托
 * @param target {Array|string|Element|object} 目标对象Dom或者Dom数组
 * @param types {string|object} 事件类型
 * @param [listener] {function} 事件方法
 * @param [selector] {string} 委托选择器
 * @param [data] {*}
 */
UIObject.prototype.bind = function (target, types, listener, selector, data) {
    var me = this;

    if (!target) {
        target = [this._dom];
    } else if (typeof target === "string") {
        target = this.find(target);
    } else if (!"length" in target) {
        target = [target];
    }

    util.each(target, function (i, item) {
        me._domain.bind(item, types, listener, selector, data);
    });
};

/**
 * 解绑事件
 * @param target {Array|string|Element|object} 目标对象Dom或者Dom数组
 * @param types {string|object} 事件类型
 * @param [listener] {function} 事件方法
 * @param [selector] {string} 委托选择器
 */
UIObject.prototype.unbind = function (target, types, listener, selector) {
    var me = this;

    if (!target) {
        target = [this._dom];
    } else if (typeof target === "string") {
        target = this.find(target);
    } else if (!"length" in target) {
        target = [target];
    }

    util.each(target, function (i, item) {
        me._domain.bind(item, types, listener, selector, data);
    });
};

/**
 * 销毁方法（销毁对象上绑定的所有事件）
 * @param type {boolean} 是否销毁Dom元素
 */
UIObject.prototype.destroy = function (type) {
    this.emit('destroy');
    this.clean();
    this.clear(false);
    if (!this._relative) {
        this._domain.destroy();
    }
    this._domain = null;

    if (type && this._dom) {
        dom.destroy(this._dom);
    }
    this._dom = null;
};

exports.UIObject = UIObject;
