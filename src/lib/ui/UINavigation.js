/**
 * Created by 清月_荷雾 on 14-2-10.
 * author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * 导航条类（导航条）
 */

var util = require("../util/util"),//引入工具类
    dom = require("../util/dom"),//DOM操作类
    UIObject = require('./UIObject').UIObject,//引入UIObject基类
    zindex = 35000;//基础z-index

/**
 * 导航条基类
 * @param style 基础css（此样式会附加到_dom这个DIV上，请注意导航条会强制使用绝对定位）
 * @param root 页面的根元素（这个是所有页面的根元素）
 * @param [html] 内部的html（可以传递也可以不传递通过其它方式更新内部html）
 * @constructor
 */
function UINavigation(style, root, html) {
    UIObject.call(this);
    this._root = root;
    html = html || "";
    this._dom = dom.createDom(
        util.formatString('<div class="absolute hidden %s" style="z-index: %d;">%s</div>',
            style,
            ++zindex,
            html
        )
    );//页面的基础元素
}

util.inherits(UINavigation, UIObject);

/**
 * 隐藏导航条
 */
UINavigation.prototype.hide = function () {
    dom.addClass(this._dom, "hidden");
};

/**
 * 显示导航条
 */
UINavigation.prototype.show = function () {
    dom.removeClass(this._dom, "hidden");
};

/**
 * 显示导航项目，需要重写（可以使用继承或者直接重写的方式来实现）
 * @param name {string} 项目的名字
 */
UINavigation.prototype.active = function (name) {

};


exports.UINavigation = UINavigation;