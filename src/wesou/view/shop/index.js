/**
 * Created by 赤菁风铃 on 14-3-28.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 *
 * @note 商户首页
 */

/**
 * 商户首页
 * @param core 核心工具
 * @param city 上一页面传递来的参数(当前城市信息)
 * @param cb 加载完成的回调函数
 */
module.exports = function (core, city, cb) {
    city = city || core.data.load("city");
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
                                slide.show("shop");
                            }
                        },
                        "ui-header-logo"
                    ]
                },
                {
                    type: core.ui.UIButton,
                    args: "<div class='ui-header-title'>" +
                        "<span class='shop-city-icon' id='fzxx_mc'>" + city.FZXX_MC + "</span>" +
                        "</div>",
                    click: function () {
                        core.href("shop/city", city, {
                            style: "back",
                            transform: "vertical"
                        });
                    }
                },
                {
                    args: "ui-header-right",
                    children: [
                        {
                            type: core.ui.UIButton,
                            args: "ui-header-map",
                            click: function () {
                                core.href("shop/location", {
                                    back: false
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
        search = core.ui.create({
            type: core.ui.UIButton,
            args: "<div class='ui-search'><div class='ui-search-button'>请输入您感兴趣的内容</div></div>",
            click: function () {
                core.href("search/index", {
                    type: "shop",
                    only: false,
                    back: false
                }, {
                    style: "back",
                    transform: "horizontal"
                });
            }
        }),
        advertisement_banner = new core.ui.UIButtonGroup({
            event: true,
            html: "ui-advertisement-banner"
        }),
        advertisement_img = new core.ui.UICarousel({
            event: true,
            html: "ui-advertisement-carousel"
        }),
        shoptype = new core.ui.UIObject("shop-index-type"),
        view = core.ui.create({
            args: "absolute full-screen view",
            back: function (data) {
                if (data && data.FZXX_BH) {
                    city = data;
                    head.find("#fzxx_mc")[0].innerHTML = data.FZXX_MC;
                    shoptype.clear(true);
                    dw_load();
                }
            },
            load: function () {
                setTimeout(function () {
                    core.splash.hide();
                }, 1000);
            },
            listeners: {
                type: "click",
                listener: function () {
                    slide.hide();
                }
            },
            children: [
                head,
                search,
                {
                    args: "shop-index-content",
                    type: core.ui.UIScroll,
                    children: [
                        {
                            args: "shop-index-advertisement",
                            children: [advertisement_img, advertisement_banner]
                        },
                        shoptype
                    ]
                }
            ]
        }),
        advChannel = new core.util.Channel(true),
        shopChannel = new core.util.Channel(true);

    advertisement_img.on("change", function (index) {
        advertisement_banner.active(index.toString());
    });
    core.util.join(function () {
        cb(view);
    }, [shopChannel, advChannel]);

    //获取广告信息
    core.network.protocol("center://YYNBGG_List", {
        YYNBGGFL_BH: "封面广告"
    }, function (d) {
        if (d.success && d.info.length > 0) {
            d.info.forEach(function (info, i) {
                switch (info.YYNBGG_LX) {
                    case "外链广告":
                        advertisement_img.append(core.ui.create({
                            type: core.ui.UIButton,
                            args: "<img src='" + info.YYNBGG_TP + "'/>",
                            click: function () {
                                core.network.protocol("center://YYNBGG_Click", {
                                    YYNBGG_BH: info.YYNBGG_BH
                                }, function () {
                                });
                                if (/^http/i.test(info.YYNBGG_CLJ)) {
                                    core.browser.open(info.YYNBGG_CLJ);
                                } else {
                                    core.browser.action(info.YYNBGG_CLJ);
                                }
                            }
                        }));
                        break;
                    case "超文本广告":
                        advertisement_img.append(core.ui.create({
                            type: core.ui.UIButton,
                            args: "<img src='" + info.YYNBGG_TP + "'/>",
                            click: function () {
                                core.network.protocol("center://YYNBGG_Click", {
                                    YYNBGG_BH: info.YYNBGG_BH
                                }, function () {
                                });
                                core.href("common/content", {
                                    title: "信息推荐",
                                    content: info.YYNBGG_NR
                                }, {
                                    style: "back",
                                    transform: "horizontal"
                                });
                            }
                        }));
                        break;
                    case "APP应用广告":
                        advertisement_img.append(core.ui.create({
                            type: core.ui.UIButton,
                            args: "<img src='" + info.YYNBGG_TP + "'/>",
                            click: function () {
                                core.network.protocol("center://YYNBGG_Click", {
                                    YYNBGG_BH: info.YYNBGG_BH
                                }, function () {
                                });
                                core.href("compass/detail", {
                                    id: info.YYNBGG_CLJ
                                }, {
                                    style: "back",
                                    transform: "horizontal"
                                });
                            }
                        }));
                        break;
                    default :
                        advertisement_img.append(core.ui.create("<img src='" + info.YYNBGG_TP + "'/>"));
                }
                advertisement_banner.append(i.toString(), new core.ui.UIButton({
                    html: "ui-advertisement-banner-item",
                    disabled: true
                }));
            });
            advertisement_img.start();
        } else {
            advertisement_img.append(new core.ui.UIObject("<img src='css/img/no-advertisement.png'/>"));
        }
        advChannel.fire();
    }, function () {
        advertisement_img.append(new core.ui.UIObject("<img src='css/img/no-advertisement.png'/>"));
        advChannel.fire();
    });
    function dw_load() {
        core.network.protocol("site://DWYJFL_List", {}, function (d) {
            if (d.success) {
                d.info.forEach(function (info) {
                    shoptype.append(core.ui.create({
                        type: core.ui.UIButton,
                        args: "shop-index-type-item",
                        click: function () {
                            core.href("shop/list", {
                                type: info.DWYJFL_MC,
                                DWYJFL_BH: info.DWYJFL_BH,
                                DWEJFL_BH: null
                            }, {
                                style: "back",
                                transform: "horizontal"
                            });
                        },
                        children: [
                            "<img src='" + info.DWYJFL_TP + "' />",
                            "<span>" + info.DWYJFL_MC + "</span>"
                        ]
                    }));
                });
            }
            shoptype.append(core.ui.create({
                type: core.ui.UIButton,
                args: "shop-index-type-item",
                click: function () {
                    core.href("shop/type", {
                        back: false
                    }, {
                        style: "back",
                        transform: "horizontal"
                    });
                },
                children: [
                    "<img src='css/img/shop-other.png'/>",
                    "<span>其他</span>"
                ]
            }));
            shopChannel.fire();
        }, function () {
            shoptype.append(core.ui.create({
                type: core.ui.UIButton,
                args: "shop-index-type-item",
                click: function () {
                    core.href("shop/type", {
                        back: false
                    }, {
                        style: "back",
                        transform: "horizontal"
                    });
                },
                children: [
                    "<img src='css/img/shop-other.png'/>",
                    "<span>其他</span>"
                ]
            }));
            shopChannel.fire();
        });
    }

    dw_load();
};