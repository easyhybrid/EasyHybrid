/**
 * Created by 赤菁风铃 on 14-3-28.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 *
 * @note 城市选择
 */

/**
 * 城市选择
 * @param core 核心工具
 * @param city 上一页面传递来的参数(当前选择的城市)
 * @param cb 加载完成的回调函数
 */
module.exports = function (core, city, cb) {
    //变量定义
    var geo = null,//当前位置坐标（如果不存在不会显示GPS定位位置）
        city_group = null,//城市按分类整理后的快捷方式（此处开发引用了私有api UIObject._children）
        head = new core.ui.UIObject("ui-header"),
        scroll = new core.ui.UIScroll({
            event: true,
            style: "shop-index-content"
        }),
        search = core.ui.create({
            type: core.ui.UIInput,
            args: {
                style: "ui-search-button",
                placeholder: "请输入城市名或者城市拼音缩写查询"
            },
            change: function (val) {
                if (!city_group) {
                    return;
                }
                var reg = new RegExp(val, "ig");
                city_group.forEach(function (citys) {
                    var matched = 0;
                    var index = citys.index;
                    if (citys.children.length <= 0) {
                        return;
                    }
                    citys.children.forEach(function (d, j) {
                        if (reg.test(d.FZXX_MC) || reg.test(d.FZXX_PYZJF)) {
                            matched++;
                            scroll._children[index + j + 1].show();
                        } else {
                            scroll._children[index + j + 1].hide();
                        }
                    });
                    if (matched) {
                        scroll._children[index].show();
                    } else {
                        scroll._children[index].hide();
                    }
                });
                scroll.refresh();
            }
        }),
        nav = new core.ui.UIObject("shop-search-fastbar"),//快速选择条
        view = core.ui.create({
            args: "absolute full-screen view",
            unload: function () {
                city_group = null;
            },
            children: [
                head,
                {
                    args: "ui-search",
                    children: search
                },
                scroll,
                nav
            ]
        });

    if (city) {
        head.append(core.ui.create({
            type: core.ui.UIButton,
            args: "ui-header-left",
            click: function () {
                core.back();
            },
            children: {
                args: "ui-header-back"
            }
        }));
    }
    head.append(new core.ui.UIObject("<div class='ui-header-title'>城市选择</div>"));

    function create_city(list) {
        city_group = [];
        city_group.push({
            name: "GPS定位城市",
            children: []
        });
        city_group.push({
            name: "热门城市",
            children: []
        });
        for (var i = 0; i < 26; i++) {
            city_group.push({
                name: String.fromCharCode(i + 65),
                children: []
            });
        }
        var min_dis = false;
        list.forEach(function (item) {
            if (item.FZXX_SFRM === "是") {
                city_group[1].children.push(item);
            }
            if (geo) {
                var dis = core.geolocation.distance(geo, {
                    longitude: item.FZXX_JD,
                    latitude: item.FZXX_WD
                });
                if (!min_dis) {
                    min_dis = {
                        dis: dis,
                        data: item
                    };
                } else if (min_dis.dis > dis) {
                    min_dis = {
                        dis: dis,
                        data: item
                    };
                }
            }
            city_group[item.FZXX_PYSZM.charCodeAt(0) - 65 + 2].children.push(item);
        });
        if (min_dis) {
            city_group[0].children.push(min_dis.data);
            min_dis = null;
        }
        var index = 0;
        nav.append(core.ui.create({
            type: core.ui.UIButton,
            args: "<div class='citys-search-fastbar-item'>热</div>",
            click: function () {
                scroll.scrollTo(0, 0);
            }
        }));
        city_group.forEach(function (citys, k) {
            if (citys.children.length === 0) {
                return;
            }
            if (k > 1) {
                nav.append(core.ui.create({
                    type: core.ui.UIButton,
                    args: {
                        html: "<div class='citys-search-fastbar-item'>" + citys.name + "</div>",
                        data: index
                    },
                    click: function (i) {
                        scroll.scrollToElement(scroll._children[i]);
                    }
                }));
            }
            citys.index = index++;
            scroll.append(new core.ui.UIObject("<div class='shop-city-title'>" + citys.name + "</div>"));
            citys.children.forEach(function (item) {
                index++;
                scroll.append(core.ui.create({
                    type: core.ui.UIButton,
                    args: {
                        html: "<div class='shop-city-content'>" + item.FZXX_MC + "</div>",
                        data: item
                    },
                    click: function action(data) {
                        core.network.setProtocol("site", {
                            url: data.FZXX_FWQ + "/CommonApi",
                            data: {
                                FZXX_BH: data.FZXX_BH
                            },
                            options: {
                                responseType: "json",
                                type: "post"
                            }
                        });
                        core.data.save("city", data);
                        if (city) {
                            core.back(data);
                        } else {
                            core.href("shop/index", data);
                        }
                    }
                }));
            });
        });
        cb(view);
    }

    core.geolocation.position(function (d) {
        geo = d.coords;
        core.network.protocol("center://FZXX_LIST", {}, function (d) {
            if (d.success) {
                create_city(d.info);
            } else {
                create_city(core.config.city);
            }
        }, function () {
            create_city(core.config.city);
        });
    }, function () {
        geo = null;
        core.network.protocol("center://FZXX_LIST", {}, function (d) {
            if (d.success) {
                create_city(d.info);
            } else {
                create_city(core.config.city);
            }
        }, function () {
            create_city(core.config.city);
        });
    }, {
        maximumAge: 10 * 60 * 1000,
        timeout: 1000
    });
};