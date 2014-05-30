/**
 * Created by 赤菁风铃 on 14-3-28.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 *
 * @note 排序选择页面
 */

/**
 * 排序选择页面
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
            "<div class='ui-header-title'>排序方式</div>"
        ]
    });

    var button = new core.ui.UIButtonGroup();

    var view = core.ui.create({
        args: "absolute full-screen view",
        children: [
            head,
            {
                type: core.ui.UIScroll,
                args: "shop-type-all",
                children: button
            }
        ]
    });

    function create_all(item) {
        return core.ui.create({
            type: core.ui.UIButton,
            args: {
                html: "<div class='shop-type-left-item line'>" +
                    "<span></span>" +
                    "" + item.FZPXFS_MC + "</div>",
                data: {
                    FZPXFS_BH: item.FZPXFS_BH,
                    FZPXFS_TJJL: item.FZPXFS_TJJL,
                    order: item.FZPXFS_MC
                }
            },
            click: action
        });
    }

    core.network.protocol("site://FZPXFS_List", {}, function (d) {
        if (d.success) {
            var current = create_all(d.info[0]);
            button.append("0", current);
            for (var i = 1; i < d.info.length; i++) {
                var item = create_all(d.info[i]);
                button.append(i.toString(), item);
                if (info && d.info[i].FZPXFS_BH === info.FZPXFS_BH) {
                    current = item;
                }
            }
            current.active();
            cb(view);
        } else {
            core.message.alert(d.message);
        }
    }, function () {
        core.message.alert("获取分站相关数据失败");
    });
};