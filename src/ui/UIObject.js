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
 * @param html {Element|string|Array|*} 用于创建对象的元素或者HTML字符串
 * @constructor
 */
function UIObject(html) {
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
    this._children = [];//子元素节点
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
    this._children = this._children || [];
    this._children.push(ele);
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
    this._children = this._children || [];
    this._children.push(ele);
    refNode.parentNode.insertBefore(ele._dom, refNode);
};

/**
 * 单纯添加一个元素到子元素数组中
 * @param ele {UIObject}  要追加的元素
 */
UIObject.prototype.add = function (ele) {
    this._children = this._children || [];
    this._children.push(ele);
};

/**
 * 在本对象删除UIObject元素
 * @param ele {UIObject} 要删除的元素
 */
UIObject.prototype.remove = function (ele) {
    var self = this;
    util.each(this._children, function (i, item) {
        if (item === ele) {
            self._children[i] = null;
        }
    });
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
    if (!selector) {
        return [this._dom];
    }
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
    if (!target) {
        target = [this._dom];
    } else if (typeof target === "string") {
        target = this.find(target);
    } else if (!("length" in target)) {
        target = [target];
    }

    util.each(target, function (i, item) {
        dom.event.bind(item, types, listener, selector, data);
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
    if (!target) {
        target = [this._dom];
    } else if (typeof target === "string") {
        target = this.find(target);
    } else if (!("length" in target)) {
        target = [target];
    }

    util.each(target, function (i, item) {
        dom.event.unbind(item, types, listener, selector);
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
    if (type && this._dom) {
        dom.destroy(this._dom);
    }
    this._dom = null;
};

/**
 * 获取子元素的个数
 * @returns {Number}
 */
UIObject.prototype.length = function () {
    return this._children && this._children.length || 0;
};

/**
 * 获取当前元素的子元素
 * @param index
 * @returns {*}
 */
UIObject.prototype.eq = function (index) {
    if (!this._children) {
        return null;
    }
    index = (index + this._children.length ) % this._children.length;
    return this._children[index];
};

exports.UIObject = UIObject;
