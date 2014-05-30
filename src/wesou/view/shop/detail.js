/**
 * Created by 赤菁风铃 on 14-3-28.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 *
 * @note 搜索首页
 */

var maps = null;
/**
 * 搜索首页
 * @param core 核心工具
 * @param dwxx 上一页面传递来的参数(商户基本信息)
 * @param cb 加载完成的回调函数
 */
module.exports = function (core, dwxx, cb) {
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
            "<div class='ui-header-title'>" + dwxx.DWXX_MC + "</div>",
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

    var tpl = require("./tpl/shop-detail.html");
    var content = new core.ui.UIScroll("shop-detail");
    var phone = (((/[0-9-]+/.exec(dwxx.DWXX_LXDH || "")) || [])[0] || "").trim();
    var basic = new core.ui.UIObject(tpl.render({
        DWXX_BH: dwxx.DWXX_BH,
        DWXX_MC: dwxx.DWXX_MC,
        DWXX_XJ: dwxx.DWXX_XJ * 10,
        DWXX_TP: dwxx.DWXX_TP,
        DWXX_GZSJ: dwxx.DWXX_GZSJ || "",
        DWXX_FY: dwxx.DWXX_FY || "0",
        DWXX_DZ: dwxx.DWXX_DZ || "",
        DWXX_JL: distance(dwxx.DWXX_JL || 0),
        DWXX_LXDH: dwxx.DWXX_LXDH || "",
        DWXX_Phone: phone
    }));
    basic.bind("#dwxx_address", "click", function () {
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
                    latitude: dwxx.latitude,
                    longitude: dwxx.longitude
                },
                destination: {
                    name: dwxx.DWXX_DZ,
                    latitude: dwxx.DWXX_WD,
                    longitude: dwxx.DWXX_JD
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
    content.append(basic);
    var view = core.ui.create({
        args: "<div class='absolute full-screen view' style='background-color: #f5f4f3'></div>",
        children: [head, content]
    });
    cb(view);
    function create_item(item) {
        return core.ui.create({
            type: core.ui.UIButton,
            args: {
                html: "shop-detail-item shop-next",
                data: item
            },
            click: function (dd) {
                core.network.protocol("site://DWZL_Detail", {
                    DWZL_BH: dd.DWZL_BH
                }, function (d) {
                    if (d.success) {
                        core.href("common/content", {
                            title: d.info.DWZL_MC,
                            content: d.info.DWZL_NR
                        }, {
                            style: "back",
                            transform: "horizontal"
                        });
                    } else {
                        core.href("common/content", {
                            title: dd.DWZL_MC,
                            content: dd.DWZL_JJ
                        }, {
                            style: "back",
                            transform: "horizontal"
                        });
                    }
                }, function () {
                    core.href("common/content", {
                        title: dd.DWZL_MC,
                        content: dd.DWZL_JJ
                    }, {
                        style: "back",
                        transform: "horizontal"
                    });
                });
            },
            children: [
                "<span class='shop-detail-item-title'>" + item.DWZL_MC + "：</span>",
                "<span>" + item.DWZL_JJ + "</span>"
            ]
        });
    }

    core.network.protocol("site://DWXX_Detail", {
        DWXX_BH: dwxx.DWXX_BH
    }, function (d) {
        if (d.success) {
            d.info.latitude = dwxx.latitude;
            d.info.longitude = dwxx.longitude;
            dwxx = d.info;
            if (dwxx.DWXX_GZSJ) {
                content.append(new core.ui.UIObject(
                    "<div class='shop-detail-item'>" +
                        "<span class='shop-detail-item-title'>工作时间：</span>" +
                        "<span>" + dwxx.DWXX_GZSJ + "</span>" +
                        "</div>"
                ));
            }
            if (dwxx.DWXX_JJ) {
                content.append(new core.ui.UIObject(
                    "<div class='shop-detail-item'>" +
                        "<span class='shop-detail-item-title'>简介：</span>" +
                        "<span>" + dwxx.DWXX_JJ + "</span>" +
                        "</div>"
                ));
            }
            if (dwxx.DWTPXXList.length > 0) {
                var obj = new core.ui.UIButton("shop-detail-item shop-other-img");
                for (var i = 0; i < dwxx.DWTPXXList.length; i++) {
                    obj.append(new core.ui.UIObject("<div><img src='" + dwxx.DWTPXXList[i].DWTPXX_TP + "'/></div>"));
                }
                obj.on("click", function () {
                    //补充点击事件
                });
                content.append(obj);
            }
            if (dwxx.DWZLList.length > 0) {
                for (var j = 0; j < dwxx.DWZLList.length; j++) {
                    content.append(create_item(dwxx.DWZLList[j]));
                }
            }
        }
    }, function () {

    });
};