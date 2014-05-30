/**
 * Created by 赤菁风铃 on 14-3-28.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 *
 *
 * 订阅分类选择及订阅和取消功能
 */

/**
 * 订阅添加和删除页面
 * @param core 核心工具
 * @param data 上一页面传递来的参数
 * @param cb 加载完成的回调函数
 */
module.exports = function (core, data, cb) {
    var sidebar_data = ["财经", "体育", "科技", "娱乐", "推介"];
    var result = [];
    var iii = 0;

    function get_sidebar_item() {
        for (var i = 0; i < sidebar_data.length; i++) {
            var item = core.ui.UIObject.create({
                type: core.ui.UIButton,
                args: {
                    html: '<div class="subscribe-sidebar-item">' + sidebar_data[i] + '</div>'
                },
                event: {
                    tap: side_active

                }
            });
            if (i === 0) {
                item.active();
            }
            result.push(item);
        }
        return result;
    }

    function side_active() {
        iii++;
        this._dom.innerHTML = iii;
        for (var j = 0; j < result.length; j++) {
            result[j].passive();
        }
        this.active();
    }

    var view = core.ui.UIObject.create({
        args: "absolute full-screen view",
        children: [
            {
                args: "ui-header",
                children: [
                    '<div class="ui-header-title">订阅</div>',
                    {
                        type: core.ui.UIButton,
                        args: {
                            html: '<div class="ui-header-left"></div>'
                        },
                        children: ["ui-header-back"],
                        event: {
                            click: function () {
                                core.back();
                            }
                        }
                    }
                ]
            },
            {
                args: 'ui-content',
                children: [
                    {
                        type: core.ui.UIScroll,
                        args: {
                            style: 'subscribe-sidebar'
                        },
                        children: {
                            args: 'sidebar-menu',
                            children: get_sidebar_item()
                        }
                    },
                    {
                        type: core.ui.UIScroll,
                        args: {
                            html: "<div class='subscribe-list'></div>"
                        }
                    }

                ]
            }
        ]
    });
    cb(view);
};