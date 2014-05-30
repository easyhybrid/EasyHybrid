/**
 * Created by 赤菁风铃 on 14-3-28.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 *
 * @note 欢迎页面(确认)
 */

/**
 * 欢迎页面(确认)
 * @param core 核心工具
 * @param data 上一页面传递来的参数
 * @param cb 加载完成的回调函数
 */
module.exports = function (core, data, cb) {
    data = data || core.config.welcome;
    var lines = data.end.split("\n");
    var banners = "<div class='more-welcome-end-status'>";
    for (var i = 0; i <= data.pages.length; i++) {
        if (i === data.pages.length) {
            banners += "<span class='active'></span>";
        } else {
            banners += "<span></span>";
        }
    }
    banners += "</div>";

    var view = new core.ui.create({
        args: "<div class='absolute full-screen more-welcome-end'></div>",
        children: [
            {
                type: core.ui.UIButton,
                args: "more-end-content",
                children: [
                    "<div class='more-welcome-end-title' style='line-height:" + (70 / lines.length) + "px'>" + lines.join("<br/>") + "</div>",
                    "more-welcome-end-button"
                ]
            },
            "more-end-bottom",
            banners
        ],
        listeners: [
            {
                type: "swipeRight",
                listener: function () {
                    core.back();
                }
            },
            {
                type: "click",
                listener: function () {
                    core.href("shop/city");
                }
            },
            {
                type: "swipeLeft",
                listener: function () {
                    core.href("shop/city");
                }
            }
        ]
    });
    cb(view);
};
