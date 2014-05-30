/**
 * Created by 清月_荷雾 on 14-2-10.
 * author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * 导航项目类
 */

var util = require("../util/util"),//引入工具类
    UIObject = require('./UIObject').UIObject;//UIObject

/**
 * 按钮基类
 * @param options 配置信息
 * @constructor
 */
function UIButtonGroup(options) {
    UIObject.call(this, options);
    this._items = {};
}

util.inherits(UIButtonGroup, UIObject);

/**
 * 添加一个按钮
 * @param name 按钮名字
 * @param item UIButton类型
 */
UIButtonGroup.prototype.append = function (name, item) {
    if (!item) {
        //表示正常追加元素
        UIObject.prototype.append.apply(this, arguments);
        return;
    }
    var self = this;
    item.on("click", function (data) {
        self.active(name);
        self.emit("change", item, data);
    });
    if (name in this._items) {
        throw  new Error("您已经绑定此对象");
    }
    self._items[name] = item;
    UIObject.prototype.append.call(self, item);
};

/**
 * 添加一个按钮
 * @param name 按钮名字
 * @param item UIButton类型
 */
UIButtonGroup.prototype.prepend = function (name, item) {
    if (!item) {
        //表示正常追加元素
        UIObject.prototype.prepend.apply(this, arguments);
        return;
    }
    var self = this;
    item.on("click", function (data) {
        self.active(name);
        self.emit("change", item, data);
    });
    if (name in this._items) {
        throw  new Error("您已经绑定此对象");
    }
    self._items[name] = item;
    UIObject.prototype.prepend.call(self, item);
};

/**
 * 删除一个按钮
 * @param name 按钮名字
 */
UIButtonGroup.prototype.remove = function (name) {
    if (typeof name !== "string") {
        //表示正常追加元素
        UIObject.prototype.remove.apply(this, arguments);
        return;
    }
    if (name in this._items) {
        var item = this._items[name];
        delete  this._items[name];
        UIObject.prototype.remove.call(this, item);
    }
};

/**
 * 清除所有的项目
 */
UIButtonGroup.prototype.clear = function () {
    this._items = {};
    UIObject.prototype.clear.apply(this, arguments);
};

/**
 * 显示导航项目
 * @param name {string} 项目的名字
 */
UIButtonGroup.prototype.active = function (name) {
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

exports.UIButtonGroup = UIButtonGroup;