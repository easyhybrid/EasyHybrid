/**
 * Created by 清月_荷雾 on 14-2-10.
 * author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * 通过添加项目的简单导航条类
 */

var util = require("../util/util"),//引入工具类
    UINavigation = require('./UINavigation').UINavigation, //引入UINavigation基类
    UIObject = require("./UIObject").UIObject;

/**
 * 一个只有添加项目的简单导航条
 * @param style 基础css（此样式会附加到_dom这个DIV上，请注意导航条会强制使用绝对定位）
 * @param root 页面的根元素
 * @constructor
 */
function UISimpleNavigation(style, root) {
    UINavigation.call(this, style, root);
    this._items = {};
}

util.inherits(UISimpleNavigation, UINavigation);


/**
 * 显示导航项目
 * @param name {string} 项目的名字
 */
UISimpleNavigation.prototype.active = function (name) {
    var items = this._items;
    for (var x in items) {
        if (items.hasOwnProperty(x)) {
            if (x === name) {
                items[x].active();
            }
            else {
                items[x].passive();
            }
        }
    }
};

/**
 * 添加一个导航项目
 * @param name 导航项目名字
 * @param item UIStateItem类型
 */
UISimpleNavigation.prototype.append = function (name, item) {
    if (name in this._items) {
        throw  new Error("您已经绑定此对象");
    }
    this._items[name] = item;
    UIObject.prototype.append.call(this, item);
};

/**
 * 删除一个导航项目（请注意如果）
 * @param name 导航项目名字
 */
UISimpleNavigation.prototype.remove = function (name) {
    if (name in this._items) {
        var item = this._items[name];
        delete  this._items[name];
        UIObject.prototype.remove.call(this, item);
    }
};
exports.UISimpleNavigation = UISimpleNavigation;