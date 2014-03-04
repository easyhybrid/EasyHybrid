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
 * @param style 激活时添加的样式
 * @param html 内部的html
 * @param disabled 当按钮处于passive状态时，是否触发点击事件
 * @constructor
 */
function UIStateItem(style, html, disabled) {
    UIObject.call(this);
    this._disabled = disabled;
    this._active = false;
    this._style = style;
    this._dom = dom.createDom(html);//页面的基础元素
    this.bind(this._dom, "click", function () {
        if (this._disabled && this._active) {
            return false;
        }
        this.emit("click", this._dom, this._active);
        return true;
    });
}

util.inherits(UIStateItem, UIObject);

/**
 * 隐藏导航条
 */
UIStateItem.prototype.active = function () {
    this._active = true;
    dom.addClass(this._dom, this._style);
};

/**
 * 显示导航条
 */
UIStateItem.prototype.passive = function () {
    this._active = false;
    dom.removeClass(this._dom, this._style);
};


exports.UIStateItem = UIStateItem;