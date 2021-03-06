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
function UIGroup(options) {
    if (!options || typeof options === "string" || options.nodeType) {
        options = {
            html: options
        };
    }
    UIObject.call(this, options.html);
    this._items = {};
}

util.inherits(UIGroup, UIObject);

/**
 * 添加一个按钮
 * @param name 按钮名字
 * @param item UIButton类型
 */
UIGroup.prototype.append = function (name, item) {
    var start = +( typeof name === "string");
    var args = Array.prototype.slice.call(arguments, start);
    if (start) {
        var self = this;
        if (name in this._items) {
            util.error("您已经绑定此对象");
        }
        item.on("click", function (data) {
            self.active(name);
            self.emit("change", item, data);
        });
        self._items[name] = item;
    }
    UIObject.prototype.append.apply(this, args);
};

UIGroup.prototype.insert = function (name, item) {
    var start = +( typeof name === "string");
    var args = Array.prototype.slice.call(arguments, start);
    if (start) {
        var self = this;
        if (name in this._items) {
            util.error("您已经绑定此对象");
        }
        item.on("click", function (data) {
            self.active(name);
            self.emit("change", item, data);
        });
        self._items[name] = item;
    }
    UIObject.prototype.insert.apply(this, args);
};

UIGroup.prototype.add = function (name, item) {
    var start = +( typeof name === "string");
    var args = Array.prototype.slice.call(arguments, start);
    if (start) {
        var self = this;
        if (name in this._items) {
            util.error("您已经绑定此对象");
        }
        item.on("click", function (data) {
            self.active(name);
            self.emit("change", item, data);
        });
        self._items[name] = item;
    }
    UIObject.prototype.add.apply(this, args);
};

/**
 * 删除一个按钮
 * @param name 按钮名字
 */
UIGroup.prototype.remove = function (name) {
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
UIGroup.prototype.clear = function () {
    this._items = {};
    UIObject.prototype.clear.apply(this, arguments);
};

/**
 * 显示导航项目
 * @param name {string} 项目的名字
 */
UIGroup.prototype.active = function (name) {
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

exports.UIGroup = UIGroup;