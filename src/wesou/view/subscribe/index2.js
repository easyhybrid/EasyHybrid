/**
 * Created by 赤菁风铃 on 14-3-28.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 *
 *
 * 订阅首页
 */

/**
 * 订阅首页
 * @param core 核心工具
 * @param data 上一页面传递来的参数
 * @param cb 加载完成的回调函数
 */
module.exports = function (core, data, cb) {
    var view = core.ui.UIObject.create({
        args: "absolute full-screen view",
        children: [
            {
                args: "ui-header",
                children: [
                    {
                        type: core.ui.UIButton,
                        args: "ui-header-left",
                        children: [
                            "ui-header-menu",
                            "ui-header-logo"
                        ],
                        event: {
                            click: function () {

                            }
                        }
                    },
                    {
                        type: core.ui.UIButton,
                        args: "ui-header-right",
                        children: [
                            "ui-header-add"
                        ],
                        event: {
                            click: function () {
                                core.href("subscribe/type", null, {
                                    transform: "horizontal",
                                    style: "back"
                                });
                            }
                        }
                    },
                    "<div class='ui-header-title'>订阅</div>"
                ]

            }
        ]
    });
    cb(view);
};