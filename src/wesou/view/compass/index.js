/**
 * Created by 赤菁风铃 on 14-3-28.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 *
 * @note 深入首页
 */

/**
 * 深入首页
 * @param core 核心工具
 * @param info 上一页面传递来的参数(当前城市信息)
 * @param cb 加载完成的回调函数
 */
module.exports = function (core, info, cb) {
    info = info || {
        MHCX: ""
    };
    var slide = core.widget.slide,//左边导航栏目
        head = core.ui.create({
            args: "ui-header",
            children: [
                {
                    args: "ui-header-left",
                    children: [
                        {
                            type: core.ui.UIButton,
                            args: "ui-header-menu",
                            click: function () {
                                slide.show("compass");
                            }
                        },
                        "ui-header-logo"
                    ]
                },
                "<div class='ui-header-title' id='head-title'>深入</div>",
                {
                    args: "ui-header-right",
                    children: [
                        {
                            type: core.ui.UIButton,
                            args: "ui-header-search",
                            click: function () {
                                core.href("search/index", {
                                    type: "compass",
                                    only: false,
                                    back: true,
                                    content: info.MHCX
                                }, {
                                    style: "back",
                                    transform: "horizontal"
                                });
                            }
                        }
                    ]
                }
            ]
        }),
        scroll = new core.ui.UIScroll("compass-index-content"),
        view = core.ui.create({
            args: "absolute full-screen view",
            listeners: {
                type: "click",
                listener: function () {
                    slide.hide();
                }
            },
            back: function (d) {
                if (d === undefined) {
                    return;
                }
                if (d.MHCX) {
                    info.MHCX = d.MHCX;
                    head.find("#head-title")[0].innerHTML = "搜索：" + info.MHCX;
                } else {
                    info.MHCX = "";
                    head.find("#head-title")[0].innerHTML = "深入";
                }
                load_list();
            },
            children: [head, scroll]
        }),
        city = core.data.load("city"),
        tpl = require("./tpl/index.html"),
        geo = null;

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

    function create_list(list) {
        list.forEach(function (item) {
            item.longitude = geo.longitude || city.FZXX_JD;
            item.latitude = geo.latitude || city.FZXX_WD;
            scroll.append(core.ui.create({
                type: core.ui.UIButton,
                args: {
                    html: tpl.render({
                        YYTJ_MC: item.YYTJ_MC,
                        YYTJ_QYMC: item.YYTJ_QYMC,
                        YYTJ_DZ: item.YYTJ_DZ || "",
                        YYTJ_TP: item.YYTJ_TP,
                        YYTJ_XJ: item.YYTJ_XJ * 10 || 0,
                        YYTJ_JL: distance(item.YYTJ_JL)
                    }),
                    data: item
                },
                click: function (d) {
                    core.href("compass/detail", d, {
                        style: "back",
                        transform: "horizontal"
                    });
                }
            }));
        });
    }

    function load_list(first) {
        core.network.protocol("center://YYTJ_List", {
            FZXX_BH: city.FZXX_BH,
            YYTJ_JD: geo.longitude || city.FZXX_JD,
            YYTJ_WD: geo.latitude || city.FZXX_WD,
            MHCX: info.MHCX || ""
        }, function (d) {
            scroll.clear(true);
            if (d.success) {
                create_list(d.info);
                if (first) {
                    cb(view);
                }
            } else {
                scroll.append(new core.ui.UIObject("<div class='shop-list-content hidden'><span class='shop-nodata'>当前没有数据，换个条件试试手气</span></div>"));
                if (first) {
                    cb(view);
                }
            }
        }, function () {
            scroll.clear(true);
            scroll.append(new core.ui.UIObject("<div class='shop-list-content hidden'><span class='shop-nodata'>当前没有数据，换个条件试试手气</span></div>"));
            if (first) {
                cb(view);
            }
        });
    }

    core.geolocation.position(function (d) {
        geo = d.coords;
        load_list(true);
    }, function () {
        geo = {};
        load_list(true);
    }, {
        maximumAge: 10 * 60 * 1000,
        timeout: 1000
    });
};