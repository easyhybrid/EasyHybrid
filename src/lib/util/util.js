/**
 * Created by 清月_荷雾 on 14-2-8.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 * @note 基础工具函数和工具组件类，用于存在不归类或者零散的功能函数
 */

/**
 * 判断对象是不是数组
 * @param obj 要判断的对象
 * @returns {boolean}
 */
function isArray(obj) {
    return typeof obj === "object" && typeName(obj) === 'Array';
}
exports.isArray = isArray;

/**
 * 判断对象是不是正则表达式
 * @param obj 要判断的对象
 * @returns {boolean}
 */
function isRegExp(obj) {
    return typeof obj === "object" && typeName(obj) === 'RegExp';
}
exports.isRegExp = isRegExp;

/**
 * 判断对象是不是异常类型
 * @param obj 要判断的对象
 * @returns {boolean}
 */
function isError(obj) {
    return typeof obj === 'object' && typeName(obj) === 'Error';
}
exports.isError = isError;


/**
 * 判断对象是不是日期类型
 * @param obj 要判断的对象
 * @returns {boolean}
 */
function isDate(obj) {
    return typeof obj === 'object' && typeName(obj) === 'Date';
}
exports.isDate = isDate;

/**
 * 获取对象类型
 * @param val 对象
 * @returns {string} 类型名
 */
function typeName(val) {
    return Object.prototype.toString.call(val).slice(8, -1);
}
exports.typeName = typeName;

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
 * @param [deep]      是否深度合并
 * @returns {*}
 */
function merge(first, second, deep) {
    if (!second || typeof second === 'function' || isDate(second) || typeof second !== 'object') {
        first = second;
        return first;
    }
    //对数组进行push操作
    if (isArray(first) && isArray(second)) {
        for (var i = 0; i < second.length; i++) {
            if (deep) {
                first.push(clone(second[i]));
            } else {
                first.push(second[i]);
            }
        }
    } else {
        for (var key in second) {
            if (second.hasOwnProperty(key) && second[key] !== undefined) {
                if (!deep || !second[key] || typeof second[key] === 'function' || isDate(second[key]) || typeof second[key] !== 'object') {
                    first[key] = second[key];
                } else if (isArray(second[key])) {
                    first[key] = merge(first[key] || [], second[key], true);
                } else {
                    first[key] = merge(first[key] || {}, second[key], true);
                }
            }
        }
    }
    return first;
}
exports.merge = merge;

var formatRegExp = /%[sdj%]/g;
/**
 * 格式化字符串
 * @param {...|string} [str] 要格式化的字符串
 */
function formatString(str) {
    var i = 1;
    var args = arguments;
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
exports.format = formatString;

/**
 * 递归复制对象（非循环引用安全版）
 * @param obj 要复制的对象
 * @returns {*}
 */
function clone(obj) {
    if (!obj || typeof obj === 'function' || isDate(obj) || typeof obj !== 'object') {
        return obj;
    }
    var retVal;
    if (isArray(obj)) {
        retVal = [];
        for (var i = 0; i < obj.length; ++i) {
            retVal.push(clone(obj[i]));
        }
        return retVal;
    }

    retVal = {};
    for (var x in obj) {
        if (!obj.hasOwnProperty(x)) {
            continue;
        }
        if (!(x in retVal) || retVal[x] !== obj[x]) {
            retVal[x] = clone(obj[x]);
        }
    }
    return retVal;
}
exports.clone = clone;

/**
 * 生成一个uuid
 * @returns {string}
 */
function uuid() {
    return create_uuid_part(4) + '-' +
        create_uuid_part(2) + '-' +
        create_uuid_part(2) + '-' +
        create_uuid_part(2) + '-' +
        create_uuid_part(6);
}
exports.uuid = uuid;

function create_uuid_part(length) {
    var uuidpart = "";
    for (var i = 0; i < length; i++) {
        var uuidchar = parseInt((Math.random() * 256), 10).toString(16);
        if (uuidchar.length === 1) {
            uuidchar = "0" + uuidchar;
        }
        uuidpart += uuidchar;
    }
    return uuidpart;
}

/**
 * 获取当前时间
 * @type {Function}
 */
exports.now = Date.now || function () {
    return new Date().getTime();
};


var lo = window.localStorage;

/**
 * 保存数据（请注意本地存储只能存储少于2.5M的数据）
 * @param key 项目名称
 * @param item 数据项目
 */
function save(key, item) {
    lo.setItem(key, JSON.stringify({
        content: item
    }));
}
exports.save = save;

/**
 * 读取数据（请注意本地存储只能存储少于2.5M的数据）
 * @param key 要获取的键
 * @returns {*}
 */
function load(key) {
    var data = lo.getItem(key);
    if (!data) {
        return null;
    }
    return JSON.parse(data).content;
}
exports.load = load;

/**
 * 清理本地缓存
 */
exports.clear = function () {
    lo.clear();
};