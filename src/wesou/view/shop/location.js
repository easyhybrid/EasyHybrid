/**
 * Created by 赤菁风铃 on 14-3-28.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 *
 * @note 地标选择页面
 */

/**
 * 地标选择页面
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
            "<div class='ui-header-title'>搜地标</div>"
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
                    "<span></span>" +
                    "" + item.DLQY_MC + "</div>",
                data: item
            },
            click: function (d) {
                right.clear(true);
                for (var j = 0; j < d.DBXXList.length; j++) {
                    right.append(create_right(d.DBXXList[j].DBXX_MC, {
                        DBXX_JD: d.DBXXList[j].DBXX_JD,
                        DBXX_WD: d.DBXXList[j].DBXX_WD,
                        location: d.DBXXList[j].DBXX_MC,
                        DLQY_BH: d.DLQY_BH
                    }));
                }
            }
        });
    }

    core.network.protocol("site://DLQY_DBXX_List", {}, function (d) {
        if (d.success) {
            left.append(core.ui.create({
                type: core.ui.UIButton,
                args: {
                    html: "<div class='shop-type-left-item line'>" +
                        "<span></span>" +
                        "" + "附近" + "</div>",
                    data: {
                        DBXX_JD: null,
                        DBXX_WD: null,
                        location: "附近",
                        DLQY_BH: null
                    }
                },
                click: action
            }));
            var current = create_left(d.info[0]);
            left.append("0", current);
            for (var i = 1; i < d.info.length; i++) {
                var item = create_left(d.info[i]);
                left.append(i.toString(), item);
                if (info && d.info[i].DLQY_BH === info.DLQY_BH) {
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