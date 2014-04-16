/**
 * Created by 清月_荷雾 on 14-2-8.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 * @note Dom操作相关函数
 */

var util = require("./util");

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
        else if (util.isArray(selector)) {
            result = selector;
        }
    }
    return result.length ? result : null;
}
exports.find = find;

/**
 * 将nodeList转成数组
 * @param nodeList 节点对象
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
    if (!util.isArray(dom)) {
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
 * @param dom DOM元素或者数组
 * @param classname 类名
 */
function removeClass(dom, classname) {
    if (!util.isArray(dom)) {
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

function offset(el) {
    var left = -el.offsetLeft,
        top = -el.offsetTop;

    while (el = el.offsetParent) {
        left -= el.offsetLeft;
        top -= el.offsetTop;
    }
    return {
        left: left,
        top: top
    };
}

exports.offset = offset;

var _elementStyle = document.createElement('div').style,
    _vendor = (function () {
        var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
            transform,
            i = 0,
            l = vendors.length;

        for (; i < l; i++) {
            transform = vendors[i] + 'ransform';
            if (transform in _elementStyle) {
                return vendors[i].substr(0, vendors[i].length - 1);
            }
        }

        return false;
    })();

/**
 * 根据平台获取平台对应的CSS字符串
 * @param style {string} 样式
 * @returns {*}
 */
exports.prefixStyle = function (style) {
    if (_vendor === false) {
        return false;
    }
    if (_vendor === '') {
        return style;
    }
    return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
};

