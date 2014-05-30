/**
 * Created by 赤菁风铃 on 14-3-28.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 *
 * @note 超文本显示
 */


/**
 * 显示超文本
 * @param core
 * @param data
 * @param cb
 */
module.exports = function (core, data, cb) {
    var view = core.ui.create({
        args: "absolute full-screen view",
        children: [
            {
                args: "ui-header",
                children: [
                    {
                        args: "ui-header-left",
                        children: {
                            type: core.ui.UIButton,
                            args: "ui-header-back",
                            click: function () {
                                core.back();
                            }
                        }
                    },
                    "<div class='ui-header-title'>" + (data.title || "内容详情") + "</div>"
                ]
            },
            {
                type: core.ui.UIScroll,
                args: "ui-content",
                children: {
                    args: "<div class='content-content'>" + data.content + "</div>",
                    listeners: {
                        target: "a",
                        type: "click",
                        listener: function (e) {
                            e.preventDefault();
                            core.browser.open(this.href);
                        }
                    }
                }
            }
        ]
    });
    cb(view);
};