/**
 * Created by 赤菁风铃 on 14-3-28.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 *
 * @note 欢迎页面
 */

/**
 * 欢迎页面
 * @param core 核心工具
 * @param data 上一页面传递来的参数
 * @param cb 加载完成的回调函数
 */
module.exports = function (core, data, cb) {
    data = data || core.util.clone(core.config.welcome);
    data.index = data.index || 0;
    var page = data.pages[data.index];
    var lines = page.title.split("\n");
    var banners = "<div class='more-welcome-content-status'>";
    for (var i = 0; i <= data.pages.length; i++) {
        if (i === data.index) {
            banners += "<span class='active'></span>";
        } else {
            banners += "<span></span>";
        }
    }
    banners += "</div>";
    var view = new core.ui.create({
        args: "<div class='absolute full-screen' style='background-color:#eaeaea'></div>",
        children: [
            "<div class='more-welcome-img'><img src='" + page.image + "'/></div>",
            {
                args: "more-welcome-content",
                children: [
                    "<div class='more-welcome-content-title' style='line-height:" + (50 / lines.length) + "px'>" + lines.join("<br/>") + "</div>",
                    "<div class='more-welcome-content-message'>" + page.message + "</div>",
                    banners
                ]
            }
        ],
        load: function () {
            setTimeout(function () {
                core.splash.hide();
            }, 1000);
        },
        listeners: [
            {
                type: "swipeRight",
                listener: function () {
                    core.back();
                }
            },
            {
                type: "swipeLeft",
                listener: function () {
                    if (data.index >= data.pages.length - 1) {
                        core.href("more/welcome-end", null, {
                            style: "back",
                            transform: "horizontal"
                        });
                        return;
                    }
                    var d = core.util.clone(data);
                    d.index++;
                    core.href("more/welcome-start", d, {
                        style: "back",
                        transform: "horizontal"
                    });
                }
            }
        ]
    });
    cb(view);
};
