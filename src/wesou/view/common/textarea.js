/**
 * Created by 赤菁风铃 on 14-3-28.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 *
 * @note 大文本输入页面
 */


/**
 * 输入大文本
 * @param core
 * @param data
 * @param cb
 */
module.exports = function (core, data, cb) {
    var area = core.ui.create("<textarea>" + (data.content || "") + "</textarea>");
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
                    "<div class='ui-header-title'>" + (data.name || "信息录入") + "</div>"
                ]
            },
            {
                type: core.ui.UIScroll,
                args: "ui-content",
                children: {
                    args: "content-area",
                    children: [
                        "<p >" + data.placeholder + "</p>",
                        area,
                        {
                            type: core.ui.UIButton,
                            args: "<div>" + (data.ok || "提交") + "</div>",
                            click: function () {
                                data.cb(core.dom.val(area._dom), function (type) {
                                    if (type) {
                                        core.back();
                                    }
                                });
                            }
                        }
                    ]
                }
            }
        ]
    });
    cb(view);
};