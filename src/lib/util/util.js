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
    };
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
            if (second.hasOwnProperty(key) && second[key] !== undefined) {
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
exports.formatString = formatString;
//endregion 相关操作函数


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
