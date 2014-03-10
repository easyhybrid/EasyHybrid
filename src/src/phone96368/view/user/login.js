/**
 * Created by 清月_荷雾 on 14-3-4.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * 用户登录页面
 */


/**
 * 定义用户登录功能
 * @param core 核心工具
 * @param data 上一页面传递来的参数
 * @param cb 加载完成的回调函数
 */
module.exports = function (core, data, cb) {
    var util = core.util;
    var UIView = core.ui.UIView;
    var UIObject = core.ui.UIObject;
    var UIScroll = core.ui.UIScroll;
    var tpl = require("./tpl/login.html");
    var view = new UIView({
        style: "none",
        navigation: "default.more",
        transform: "none",
        reverse: false
    });
    //以下方式为dom嵌套式开发方式（这种方式更适合没有很多前端技术的程序员）
    var head = new UIObject('<div class="ui-header"></div>');
    head.append(new UIObject(util.format('<div class="ui-header-title">%s</div>', "更多")));
    view.append(head);
    var content = new UIObject("<div class='ui-content'></div>");
    content.append(new UIScroll(tpl.render(), "full-screen"));
    view.append(content);
    cb(view);
};