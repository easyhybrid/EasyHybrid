/**
 * Created by 赤菁风铃 on 14-3-28.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 *
 * @note 搜索首页
 */

/**
 * 搜索首页
 * @param core 核心工具
 * @param condition 上一页面传递来的参数(搜索条件)
 * @param cb 加载完成的回调函数
 */
module.exports = function (core, condition, cb) {
    condition = condition || {
        type: "shop",
        only: false,
        back: false
    };
    condition.type = condition.type || "shop";
    var supported = {//支持的平台
        shop: "单位",
        subscribe: "订阅",
        compass: "深入"
    };
    var history_search = core.data.load("history") || {};
    var hlist = history_search[condition.type] = history_search[condition.type] || {};

    function action(result) {
        if (!(result in hlist) && result) {
            hlist[result] = true;
            core.data.save("history", history_search);
        }
        if (condition.back) {
            core.back({
                MHCX: result
            });
        } else {
            core.href(condition.type + "/list", {
                MHCX: result
            }, {
                style: "back",
                transform: "horizontal"
            });
        }
    }

    var search = new core.ui.UIInput({
        style: "search-input",
        placeholder: "请输入搜索关键词"
    });
    search.on("submit", function (val) {
        action(val);
    });
    var select = new core.ui.UIButton(core.util.format(
        "<div class='%s'>%s</div>",
        condition.only ? "search-select" : "search-select-active",
        supported[condition.type]
    ));
//    if (!condition.only) {
//        //添加类型选择功能
//    }
    var list = new core.ui.UIScroll("search-list");

    function create_list(text) {
        return core.ui.create({
            type: core.ui.UIButton,
            args: {
                html: "<div class='search-item'>" + text + "</div>",
                data: text
            },
            click: function (t) {
                action(t);
            }
        });
    }

    for (var x in hlist) {
        if (hlist.hasOwnProperty(x)) {
            list.append(create_list(x));
        }
    }
    var view = core.ui.create({
        args: "absolute full-screen view",
        children: [
            {
                args: "ui-header",
                children: [
                    {
                        args: "<div class='search-cancel'>取消</div>",
                        type: core.ui.UIButton,
                        click: function () {
                            core.back();
                        }
                    },
                    {
                        args: "search-block",
                        children: [
                            select,
                            {
                                args: "search-submit",
                                type: core.ui.UIButton,
                                click: function () {
                                    search.submit();
                                }
                            },
                            search
                        ]
                    }
                ]
            },
            list,
            {
                args: "<div class='search-clear'>清除搜索记录</div>",
                type: core.ui.UIButton,
                click: function () {
                    list.clear(true);
                    hlist = history_search[condition.type] = {};
                    core.data.save("history", history_search);
                }
            }
        ]
    });
    cb(view);
};