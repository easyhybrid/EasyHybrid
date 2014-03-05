/**
 * Created by 清月_荷雾 on 14-3-4.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * 一个简单的更多功能，用于进行系统的支持和维护
 */

/**
 * 定义更多功能首页
 * @param core 核心工具
 * @param data 上一页面传递来的参数
 * @param cb 加载完成的回调函数
 */
module.exports = function (core, data, cb) {
    var UIView = core.ui.UIView;
    var view = new UIView({
        style: "none",
        navigation: "default.more",
        transform: "none",
        reverse: false
    });
    view.append('<div class="absolute">页面开发中！</div>');
    view.append('<div id="more-click" style="margin-top: 10px;cursor: pointer;">点击我</div>');
    view.bind("#more-click", "click", function () {
        core.href("more/more-test");
    });
    cb(view);
};