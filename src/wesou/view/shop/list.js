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
    var loaded = false;//页面是否加载完成
    info = core.util.merge({
        uuid: core.util.uuid(),//当前执行的状态码，如果这个值发生变化，上一次的请求结果会被抛弃
        back: true,//公供子页面使用
        index: 1,//当前页码
        loading: false,//是否正在加载数据
        geo: null//当前所在位置
    }, info);
    var cache = null;
    var title_text = "单位列表";
    if (info.MHCX && info.MHCX.length > 5) {
        title_text = "搜索：" + info.MHCX.slice(0, 4) + "...";
    } else if (info.MHCX) {
        title_text = "搜索：" + info.MHCX;
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
            "<div class='ui-header-title' style='margin: 0 100px;'>" + title_text + "</div>",
            {
                args: "ui-header-right",
                children: [
                    {
                        type: core.ui.UIButton,
                        args: "ui-header-search",
                        click: function () {
                            core.href("search/index", {
                                type: "shop",
                                only: true,
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
    });

    var location = new core.ui.UIButton({
        html: "<div><span class='line shop-list-location'>" + (info.location || "附近") + "<b></b></span></div>"
    });
    location.on("click", function () {
        core.href("shop/location", info, {
            style: "back",
            transform: "horizontal"
        });
    });

    var type = new core.ui.UIButton({
        html: "<div><span  class='line shop-list-type'>" + (info.type || "全部") + "<b></b></span></div>"
    });
    type.on("click", function () {
        core.href("shop/type", info, {
            style: "back",
            transform: "horizontal"
        });
    });

    var order = new core.ui.UIButton({
        html: "<div><span  class='line shop-list-order'>" + (info.order || "默认排序") + "<b></b></span></div>"
    });
    order.on("click", function () {
        core.href("shop/order", info, {
            style: "back",
            transform: "horizontal"
        });
    });

    var list = new core.ui.UIScroll({
        style: "shop-list-content",
        event: true
    });
    var list_loading = new core.ui.UIObject("<div class='shop-list-content hidden'><span class='shop-loading'>努力加载中...</span></div>");
    var list_nodata = new core.ui.UIObject("<div class='shop-list-content hidden'><span class='shop-nodata'>当前没有数据，换个条件试试手气</span></div>");

    var view = core.ui.create({
        args: "absolute full-screen view",
        children: [
            head,
            {
                args: "shop-list-banner",
                children: [location, type, order]
            },
            list,
            list_loading,
            list_nodata
        ],
        unload: function () {
            for (var x in info) {
                if (info.hasOwnProperty(x)) {
                    delete info[x];
                }
            }
            info = null;
        },
        back: function (d) {
            if (!d) {
                return;
            }
            if (d.location) {
                info.DBXX_JD = d.DBXX_JD;
                info.DBXX_WD = d.DBXX_WD;
                info.DLQY_BH = d.DLQY_BH;
                info.location = d.location;
                location.find("span")[0].innerHTML = d.location + "<b></b>";
            }
            if (d.order) {
                info.FZPXFS_BH = d.FZPXFS_BH;
                info.FZPXFS_TJJL = d.FZPXFS_TJJL;
                info.order = d.order;
                order.find("span")[0].innerHTML = d.order + "<b></b>";
            }
            if (d.type) {
                info.DWYJFL_BH = d.DWYJFL_BH;
                info.DWEJFL_BH = d.DWEJFL_BH;
                info.type = d.type;
                type.find("span")[0].innerHTML = d.type + "<b></b>";
            }
            if (d.MHCX || d.MHCX === "") {
                info.MHCX = d.MHCX;
                if (d.MHCX === "") {
                    head.find(".ui-header-title")[0].innerHTML = "单位列表";
                } else {
                    if (d.MHCX.length > 5) {
                        d.MHCX = d.MHCX.slice(0, 4) + "...";
                    }
                    head.find(".ui-header-title")[0].innerHTML = "搜索：" + d.MHCX;
                }
            }
            info.ads = false;
            info.finish = false;
            info.index = 1;
            list.clear(true);
            list_loading.show();
            info.uuid = core.util.uuid();
            info.loading = false;
            load_data();
        }
    });
    var tpl = require("./tpl/shop-list.html");

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

    function create_item(d) {
        d.latitude = info.geo.latitude;
        d.longitude = info.geo.longitude;
        return core.ui.create({
            type: core.ui.UIButton,
            args: {
                html: tpl.render({
                    DWXX_MC: d.DWXX_MC || "",
                    DWXX_XJ: d.DWXX_XJ * 10 || "0",
                    DWXX_JL: distance(d.DWXX_JL || 0),
                    DWXX_DZ: d.DWXX_DZ || "",
                    DWXX_TP: d.DWXX_TP || ""
                }),
                data: d
            },
            click: function (d) {
                if (d.DWTJGG_BH) {
                    core.network.protocol("site://DWTJGG_Click", {
                        DWTJGG_BH: d.DWTJGG_BH
                    }, function () {
                    });
                }
                core.href("shop/detail", d, {
                    style: "back",
                    transform: "horizontal"
                });
            }
        });
    }

    function create_advertisement(info) {
        var html = "<img src='" + info.SSGJCGG_TP + "'/>";
        var type = info.SSGJCGG_LX;
        switch (type) {
            case "外链广告":
                return core.ui.create({
                    type: core.ui.UIButton,
                    args: {
                        html: html,
                        data: info
                    },
                    click: function (info) {
                        core.network.protocol("site://SSGJCGG_Click", {
                            SSGJCGG_BH: info.SSGJCGG_BH
                        }, function () {
                        });
                        if (/^http/i.test(info.SSGJCGG_CLJ)) {
                            core.browser.open(info.SSGJCGG_CLJ);
                        } else {
                            core.browser.action(info.SSGJCGG_CLJ);
                        }
                    }
                });
            case "超文本广告":
                return core.ui.create({
                    type: core.ui.UIButton,
                    args: {
                        html: html,
                        data: info
                    },
                    click: function () {
                        core.network.protocol("site://SSGJCGG_Click", {
                            SSGJCGG_BH: info.SSGJCGG_BH
                        }, function () {
                        });
                        core.href("common/content", {
                            title: "信息推荐",
                            content: info.SSGJCGG_NR
                        }, {
                            style: "back",
                            transform: "horizontal"
                        });
                    }
                });
            case "单位广告":
                return core.ui.create({
                    type: core.ui.UIButton,
                    args: {
                        html: html,
                        data: info
                    },
                    click: function () {
                        core.network.protocol("site://SSGJCGG_Click", {
                            SSGJCGG_BH: info.SSGJCGG_BH
                        }, function () {
                        });
                        core.network.protocol("site://DWXX_Detail", {
                            DWXX_BH: info.SSGJCGG_CLJ
                        }, function (d) {
                            if (d.success) {
                                d.latitude = info.geo.latitude;
                                d.longitude = info.geo.longitude;
                                core.href("shop/detail", d.info, {
                                    style: "back",
                                    transform: "horizontal"
                                });
                            }
                        });
                    }
                });
            case "图片广告":
                return core.ui.create(html);
            default :
                return core.ui.create(html);
        }
    }


    function load_data() {
        if (info.loading || info.index > 15) {
            return;
        }
        info.loading = true;
        var uuid = info.uuid;
        if (list._children.length === 0) {
            list_loading.show();
        }
        if (info.MHCX && info.index === 1 && !info.ads) {
            //添加广告
            info.ads = {};
            core.network.protocol("site://DWXX_TJ_List", {
                DWXX_JD: info.DBXX_JD || info.geo.longitude || null,
                DWXX_WD: info.DBXX_WD || info.geo.latitude || null,
                DWXX_JL: info.FZPXFS_TJJL || 5000,
                MHCX: info.MHCX
            }, function (d) {
                if (info.uuid !== uuid) {
                    return;
                }
                info.loading = false;
                if (d.success) {
                    if (d.info.SSGJCGGLIST && d.info.SSGJCGGLIST.length > 0) {
                        var ads = new core.ui.UICarousel("shop-list-ads");
                        for (var i = 0; i < d.info.SSGJCGGLIST.length; i++) {
                            ads.append(create_advertisement(d.info.SSGJCGGLIST[i]));
                        }
                        list.append(ads);
                        if (d.info.SSGJCGGLIST.length > 1) {
                            ads.start();
                        }
                    }
                    if (d.info.DWTJLIST && d.info.DWTJLIST.length > 0) {
                        var wrapper = new core.ui.UIObject("<div></div>");
                        for (var j = 0; j < d.info.DWTJLIST.length; j++) {
                            info.ads[d.info.DWTJLIST[j].DWXX_BH] = true;
                            wrapper.append(create_item(d.info.DWTJLIST[j]));
                        }
                        list.append(wrapper);
                    }
                }
                load_data();
            }, function () {
                if (info.uuid !== uuid) {
                    return;
                }
                info.loading = false;
                load_data();
            }, {
                cache: false
            });
            return;
        } else if (!info.ads) {
            info.ads = {};
        }
        if (cache && info.index !== 1) {
            var wrapper = new core.ui.UIObject("<div></div>");
            for (var k = 0; k < cache.length; k++) {
                if (cache[k].DWXX_BH in info.ads) {
                    continue;
                }
                wrapper.append(create_item(cache[k]));
            }
            list.append(wrapper);
            info.index++;
            if (info.index === 16) {
                return;
            }
        } else {
            cache = null;
        }
        core.network.protocol("site://DWXX_List", {
                DWYJFL_BH: info.DWYJFL_BH || null,
                DWEJFL_BH: info.DWEJFL_BH || null,
                MHCX: info.MHCX || null,
                DWXX_JD: info.DBXX_JD || info.geo.longitude || null,
                DWXX_WD: info.DBXX_WD || info.geo.latitude || null,
                DWXX_JL: info.FZPXFS_TJJL || 5000,
                PageSize: info.index === 1 ? 40 : 20,
                PageIndex: info.index
            }, function (d) {
                if (info.uuid !== uuid) {
                    return;
                }
                list_loading.hide();
                if (d.success && d.info.length > 0) {
                    if (info.index === 1 && d.info.length > 20) {
                        var wrapper = new core.ui.UIObject("<div></div>");
                        for (var i = 0; i < 20; i++) {
                            if (d.info[i].DWXX_BH in info.ads) {
                                continue;
                            }
                            wrapper.append(create_item(d.info[i]));
                        }
                        list.append(wrapper);
                        cache = d.info.slice(20);
                    } else if (cache) {
                        cache = d.info;
                    } else {
                        var wrapper1 = new core.ui.UIObject("<div></div>");
                        for (var j = 0; j < d.info.length; j++) {
                            if (d.info[j].DWXX_BH in info.ads) {
                                continue;
                            }
                            wrapper1.append(create_item(d.info[j]));
                        }
                        list.append(wrapper1);
                    }
                    info.index++;
                } else {
                    cache = null;
                    info.index = 16;
                }
                if (list._children.length === 0) {
                    list_nodata.show();
                } else {
                    list_nodata.hide();
                }
                info.loading = false;
            },
            function () {
                if (info.uuid !== uuid) {
                    return;
                }
                cache = null;
                info.index = 16;
                list_loading.hide();
                if (list._children.length === 0) {
                    list_nodata.show();
                } else {
                    list_nodata.hide();
                }
                info.loading = false;
            });
        if (!loaded) {
            loaded = true;
            cb(view);
        }
    }

    list.on("bottom", load_data);

    core.geolocation.position(function (d) {
        info.geo = d.coords;
        load_data();
    }, function () {
        var city = core.data.load("city") || {};
        info.geo = {
            longitude: city.FZXX_JD,
            latitude: city.FZXX_WD
        };
        load_data();
    }, {
        maximumAge: 10 * 60 * 1000,
        timeout: 1000
    });
};