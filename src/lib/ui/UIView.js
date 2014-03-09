/**
 * Created by 清月_荷雾 on 14-2-10.
 * author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * UI页面基础类
 * @note defaultOption.style
 *     none      ：表示页面是初始页面，系统清空回退栈，隐藏背景页面
 *     frame     ：浮出页面，不隐藏背景页面
 *     switch    ：导航到页面，并且回退页面到最近的一个switch,如果没有switch则进行一次普通back导航
 *     back      ：压栈正在显示的页面，隐藏背景页面。
 *
 * @note defaultOption.navigation
 *     hide      ：表示不显示任何导航条
 *     common    ：不切换导航条保持当前状态
 *     bar.item   ：导航到bar导航条的item项目
 *
 * @note defaultOption.transform
 *     none      ：无切换特效
 *     horizontal：水平切换进入和退出（默认从右到左进入）
 *     vertical  ：竖直切换进入和退出（默认从上到上进入）
 *     pop       ：弹出（从中心放大之后出现）
 *     fade      ：浮出（透明度从0到1）
 * @note defaultOption.reverse
 *     false     ：表示正常显示特效
 *     true      ：horizontal和vertical的特效会反方向，比较适合电子书或者阿拉伯语地区的网页
 */

var util = require("../util/util"),//引入工具类
    dom = require("../util/dom"),//DOM操作类
    UIObject = require('./UIObject').UIObject,//引入UIObject基类
    zindex = 10000,//基础z-index
    transformStyles = ["horizontal-in", "vertical-in", "pop-in", "fade-in", "horizontal-out", "vertical-out", "pop-out", "fade-out"].join(" "),//所有需要在重新加载时移除的样式
    safeTimeout = 400,//播放动画的安全延时
    defaultOption = {//关于此参数请参照文件头部的note
        style: "none",
        navigation: "hide",
        transform: "none",
        reverse: false
    };

/**
 * 页面基础类
 * @param option 基础构造信息
 * @constructor
 */
function UIView(option) {
    UIObject.call(this);
    this._option = util.merge(util.clone(defaultOption), option);
    this._dom = dom.createDom(
        util.format('<div class="absolute full-screen %s" style="z-index: %d;background: %s"></div>',
            this._option.reverse ? ' reverse' : '',
            ++zindex,
            this._option.style === "frame" ? "" : "#fffffff")
    );//页面的基础元素
}

util.inherits(UIView, UIObject);

/**
 * 获取页面样式
 * @returns {string}
 */
UIView.prototype.style = function () {
    return this._option.style;
};

/**
 * 获取导航条信息
 * @returns {string}
 */
UIView.prototype.navigation = function () {
    return this._option.navigation;
};

/**
 * 加载页面
 * @param root
 * @param cb
 */
UIView.prototype.load = function (root, cb) {
    var me = this;
    dom.removeClass(me._dom, transformStyles);//移除已经加载的动画样式
    if (me._option.transform !== "none") {
        //加载动画并延时执行
        dom.addClass(me._dom, me._option.transform + "-in");
        setTimeout(function () {
            me.emitAll("load");
            cb();
        }, safeTimeout);
        me.attach(root);
    } else {
        //直接加载完毕
        me.attach(root);
        me.emitAll("load");
        cb();
    }
};

/**
 * 删除页面
 * @param cb
 */
UIView.prototype.unload = function (cb) {
    var me = this;
    dom.removeClass(me._dom, transformStyles);//移除已经加载的动画样式
    if (me._option.transform !== "none") {
        //加载动画并延时执行
        dom.addClass(me._dom, me._option.transform + "-out");
        setTimeout(function () {
            me.emitAll("unload");
            cb();
        }, safeTimeout);
    } else {
        //直接加载完毕
        me.emitAll("unload");
        cb();
    }
};

exports.UIView = UIView;

