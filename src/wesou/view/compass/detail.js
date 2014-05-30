/**
 * Created by 赤菁风铃 on 14-3-28.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 *
 * @note 深入详情
 */

var maps = null;

/**
 * 深入详情
 * @param core 核心工具
 * @param info 上一页面传递来的参数(当前城市信息)
 * @param cb 加载完成的回调函数
 */
module.exports = function (core, info, cb) {
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
                "<div class='ui-header-title'>" + info.YYTJ_MC + "</div>",
                {
                    args: "ui-header-right",
                    children: [
                        {
                            type: core.ui.UIButton,
                            args: "ui-header-share",
                            click: function () {
                            }
                        }
                    ]
                }
            ]
        }),
        content = new core.ui.UIScroll("compass-detail"),
        tpl = require("./tpl/detail.html"),
        view = core.ui.create({
            args: "<div class='absolute full-screen view' style='background-color: #f5f4f3'></div>",
            children: [head, content]
        });

    function distance(dis) {
        if (dis <= 100) {
            return "小于 100米";
        }
        else if (dis <= 1000) {
            return Math.floor(dis) + "米";
        } else if (dis <= 100000) {
            return Math.floor(dis / 1000) + "公里";
        } else {
            return "大于100公里";
        }
    }

    var basic = new core.ui.UIObject(tpl.render({
        YYTJ_MC: info.YYTJ_MC,
        YYTJ_XJ: info.YYTJ_XJ * 10,
        YYTJ_TP: info.YYTJ_TP,
        YYTJ_QYMC: info.YYTJ_QYMC || "",
        YYTJ_DZ: info.YYTJ_DZ || "",
        YYTJ_LXDH: info.YYTJ_LXDH || "",
        YYTJ_JJ: info.YYTJ_JJ || "",
        YYTJ_JL: distance(info.YYTJ_JL || 0)
    }));

    basic.bind("#yytj_address", "click", function () {
        if (!maps) {
            maps = [];
            for (var i = 0; i < core.config.maps.length; i++) {
                var item = core.config.maps[i];
                maps.push({
                    ios: item.ios.uri,
                    android: item.android.id
                });
            }
        }
        core.browser.exists(maps, function (i) {
            var map = core.config.maps[i];
            var ora_url = map.format({
                origin: {
                    name: "我的位置",
                    latitude: info.latitude,
                    longitude: info.longitude
                },
                destination: {
                    name: info.DWXX_DZ,
                    latitude: info.DWXX_WD,
                    longitude: info.DWXX_JD
                }
            });
            if (core.os.ios) {
                core.browser.action(map.ios.uri + ora_url);
            } else if (core.os.android) {
                core.browser.action(map.android.uri + ora_url);
            } else {
                core.browser.action(map.web.uri + ora_url);
            }
        }, function () {
            var map = core.config.maps[0];
            core.message.confirm("检测到您没有安装任何地图，向您推荐" + map.chn + "，是否立即安装", function (index) {
                if (index === 2) {
                    return;
                }
                if (core.os.ios) {
                    core.browser.action(map.ios.market);
                } else if (core.os.android) {
                    core.browser.action(map.android.market);
                } else {
                    core.browser.action(map.web.market);
                }
            });
        });
    });

    basic.bind("#yytj_dowmload", "click", function () {
        if (core.os.ios) {
            core.browser.action(info.YYTJ_IOSLJ);
        } else if (core.os.android) {
            core.browser.action(info.YYTJ_ANDROIDLJ);
        } else {
            core.browser.action(info.YYTJ_CLJ);
        }
    });
    content.append(basic);

    function create_item(item) {
        return core.ui.create({
            type: core.ui.UIButton,
            args: {
                html: "compass-detail-item compass-next",
                data: item
            },
            click: function (dd) {
                core.network.protocol("center://YYTJZL_Detail", {
                    YYTJZL_BH: dd.YYTJZL_BH
                }, function (d) {
                    if (d.success) {
                        core.href("common/content", {
                            title: d.info.YYTJZL_MC,
                            content: d.info.YYTJZL_NR
                        }, {
                            style: "back",
                            transform: "horizontal"
                        });
                    } else {
                        core.href("common/content", {
                            title: dd.YYTJZL_MC,
                            content: dd.YYTJZL_JJ
                        }, {
                            style: "back",
                            transform: "horizontal"
                        });
                    }
                }, function () {
                    core.href("common/content", {
                        title: dd.YYTJZL_MC,
                        content: dd.YYTJZL_JJ
                    }, {
                        style: "back",
                        transform: "horizontal"
                    });
                });
            },
            children: [
                "<span class='compass-detail-item-title'>" + item.YYTJZL_MC + "：</span>",
                "<span>" + item.YYTJZL_JJ + "</span>"
            ]
        });
    }

    core.network.protocol("center://YYTJ_Detail", {
        YYTJ_BH: info.YYTJ_BH
    }, function (d) {
        if (d.success) {
            d = d.info;
            if (d.YYTJXCLIST.length > 0) {
                var obj = new core.ui.UIButton("compass-detail-item compass-other-img");
                for (var i = 0; i < d.YYTJXCLIST.length; i++) {
                    obj.append(new core.ui.UIObject("<div><img src='" + d.YYTJXCLIST[i].YYTJXC_TP + "'/></div>"));
                }
                obj.on("click", function () {
                    //补充点击事件
                });
                content.append(obj);
            }
            if (d.YYTJZLLIST.length > 0) {
                for (var j = 0; j < d.YYTJZLLIST.length; j++) {
                    content.append(create_item(d.YYTJZLLIST[j]));
                }
            }
        }
    }, function () {

    });
    cb(view);
};