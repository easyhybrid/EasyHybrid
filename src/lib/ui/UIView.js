/**
 * Created by 清月_荷雾 on 14-2-10.
 * author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * UI页面基础类
 */

var util = require("../util"),//引入工具类
    UIObject = require('./UIObject').UIObject,//引入UIObject基类
    zindex = 10000,//基础z-index
    transformStyles = ["horizontal-in", "vertical-in", "pop-in", "fade-in", "horizontal-out", "vertical-out", "pop-out", "fade-out"].join(" "),//所有需要在重新加载时移除的样式
    safeTimeout = 400,//播放动画的安全延时
    defaultOption = {
        back: false,//是否回退
        transform: "none",//切换动画样式
        reverse: false//是否反向（对于部分特殊功能或者阿拉伯语的应用需要反向加载页面）
    };

/**
 * 页面基础类
 * @param option 基础构造信息
 * @constructor
 */
function UIView(option) {
    UIObject.call(this);
    this._option = util.merge(option, defaultOption);
    this._dom = util.createDom(
        util.formatString('<div class="absolute full-screen %s" style="z-index: %d;"></div>',
            this._option.reverse ? ' reverse' : '',
            ++zindex)
    );//页面的基础元素
}

util.inherits(UIView, UIObject);

UIView.prototype.hasBack = function () {
    return this._option.back;
};

UIView.prototype.load = function (cb) {
    var me = this;
    util.removeClass(me._dom, transformStyles);//移除已经加载的动画样式
    if (me._option.transform !== "none") {
        //加载动画并延时执行
        util.addClass(me._dom, me._option.transform + "-in");
        setTimeout(function () {
            cb();
            me.emit("load");
        }, safeTimeout);
    } else {
        //直接加载完毕
        cb();
        me.emit("load");
    }
};

UIView.prototype.unload = function (cb) {
    var me = this;
    me._option = null;
    util.removeClass(me._dom, transformStyles);//移除已经加载的动画样式
    if (me._option.transform !== "none") {
        //加载动画并延时执行
        util.addClass(me._dom, me._option.transform + "-out");
        setTimeout(function () {
            cb();
            me.emit("unload");
        }, safeTimeout);
    } else {
        //直接加载完毕
        cb();
        me.emit("unload");
    }
};

exports.UIView = UIView;