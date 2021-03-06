/**
 * Created by 清月_荷雾 on 14-2-10.
 * author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * 一个有两个状态和点击事件的HTML控件（默认为passive）
 */

var util = require("../util/util"),//引入工具类
    dom = require("../util/dom"),//DOM操作类
    UIObject = require('./UIObject').UIObject;//引入UIObject基类

/**
 * 导航项目
 * @param options
 * @constructor
 */
function UIButton(options) {
    if (!options || typeof options === "string" || options.nodeType) {
        options = {
            html: options
        };
    }
    UIObject.call(this, options.html);
    var me = this;
    me._data = options.data === undefined ? {} : options.data;//数据
    me._disabled = options.disabled || false;//当按钮处于passive状态时，是否触发点击事件
    me._active = false;
    me._style = options.style || "active";//激活时添加的样式
    me.bind(null, "click", function (e) {
        if (me._disabled && !me._active) {
            return false;
        }
        me.emit("click", me._data, e);
    });
    me.bind(null, "tap", function (e) {
        if (me._disabled && !me._active) {
            return false;
        }
        me.emit("tap", me._data, e);
    });
}

util.inherits(UIButton, UIObject);

/**
 * 隐藏导航条
 */
UIButton.prototype.active = function () {
    this._active = true;
    this.emit("change", this._data, true);
    dom.addClass(this._dom, this._style);
};

/**
 * 显示导航条
 */
UIButton.prototype.passive = function () {
    this._active = false;
    this.emit("change", this._data, false);
    dom.removeClass(this._dom, this._style);
};

UIButton.prototype.tap = UIButton.prototype.click = function () {
    this.emit("click", this._data);
};

exports.UIButton = UIButton;