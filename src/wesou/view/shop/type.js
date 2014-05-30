/**
 * Created by 赤菁风铃 on 14-3-28.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 *
 * @note 分类选择页面
 */

/**
 * 分类选择页
 * @param core 核心工具
 * @param info 上一页面传递来的参数（页面跳转相关信息）
 * @param cb 加载完成的回调函数
 */
module.exports = function (core, info, cb) {
    function action(d) {
        if (info.back) {
            core.back(d);
        }
        else {
            core.href("shop/list", d, {
                style: "back",
                transform: "horizontal"
            });
        }
    }

    var head = core.ui.create({
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
            "<div class='ui-header-title'>选择分类</div>"
        ]
    });

    var left = new core.ui.UIButtonGroup();
    var right = new core.ui.UIScroll("shop-type-right");

    var view = core.ui.create({
        args: "absolute full-screen view",
        children: [
            head,
            {
                type: core.ui.UIScroll,
                args: {
                    style: "shop-type-left",
                    event: true
                },
                children: left
            },
            right
        ]
    });

    function create_right(content, item) {
        return core.ui.create({
            type: core.ui.UIButton,
            args: {
                html: "<div class='shop-type-right-item line'>" + content + "</div>",
                data: item
            },
            click: action
        });
    }

    function create_left(item) {
        return core.ui.create({
            type: core.ui.UIButton,
            args: {
                html: "<div class='shop-type-left-item line'>" +
                    "<img src='" + item.DWYJFL_TP + "'/>" +
                    "" + item.DWYJFL_MC + "</div>",
                data: item
            },
            click: function (d) {
                right.clear(true);
                right.append(create_right("全部" + d.DWYJFL_MC, {
                    type: d.DWYJFL_MC,
                    DWYJFL_BH: d.DWYJFL_BH,
                    DWEJFL_BH: null
                }));
                for (var j = 0; j < d.DWEJFLList.length; j++) {
                    right.append(create_right(d.DWEJFLList[j].DWEJFL_MC, {
                        type: d.DWEJFLList[j].DWEJFL_MC,
                        DWYJFL_BH: d.DWYJFL_BH,
                        DWEJFL_BH: d.DWEJFLList[j].DWEJFL_BH
                    }));
                }
            }
        });
    }

    core.network.protocol("site://DWYJFL_DWEJFL_List", {}, function (d) {
        if (d.success) {
            var current = create_left(d.info[0]);
            left.append("0", current);
            for (var i = 1; i < d.info.length; i++) {
                var item = create_left(d.info[i]);
                left.append(i.toString(), item);
                if (info && d.info[i].DWYJFL_BH === info.DWYJFL_BH) {
                    current = item;
                }
            }
            current.active();
            current.emit("click", current._data);
            cb(view);
        } else {
            core.message.alert(d.message);
        }
    }, function () {
        core.message.alert("获取分站相关数据失败");
    });
};