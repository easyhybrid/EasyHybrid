/**
 * Created by 赤菁风铃 on 14-3-28.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 *
 * @note 更多首页
 */

/**
 * 更多首页
 * @param core 核心工具
 * @param data 上一页面传递来的参数
 * @param cb 加载完成的回调函数
 */
module.exports = function (core, data, cb) {
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
                                slide.show("more");
                            }
                        },
                        "ui-header-logo"
                    ]
                },
                "<div class='ui-header-title' id='head-title'>更多</div>"
            ]
        }),
        scroll = new core.ui.UIScroll("more-index"),
        user = core.data.load("user"),
        userbar = core.ui.create({
            type: core.ui.UIButton,
            args: "<div class='more-index-item'><span class='more-login'></span></a>",
            click: function () {
                if (user) {
                    user = null;
                    core.data.save("user", null);
                    core.dom.text(userbar.find("span")[0], "用户登录");
                } else {
                    core.href("more/login", {
                    }, {
                        style: "back",
                        transform: "vertical"
                    });
                }
            }
        }),
        view = core.ui.create({
            args: "<div class='absolute full-screen view' style='background-color: #f5f4f3'></div>",
            listeners: {
                type: "click",
                listener: function () {
                    slide.hide();
                }
            },
            back: function (data) {
                if (data && data.YHXX_BH) {
                    user = data;
                    core.dom.html(userbar.find("span")[0], "安全退出&nbsp;<span style='font-size: 12px;color: #999999'>" + user.YHXX_XM + "</span>");
                }
            },
            children: [head, scroll]
        });

    function load_item(app) {
        scroll.append(core.ui.create("more-index-line"));
        if (user) {
            core.dom.html(userbar.find("span")[0], "安全退出&nbsp;<span style='font-size: 12px;color: #999999'>" + user.YHXX_XM + "</span>");
        } else {
            core.dom.text(userbar.find("span")[0], "用户登录");
        }
        scroll.append(userbar);
        scroll.append(core.ui.create("more-index-space"));
        scroll.append(core.ui.create("more-index-line"));
        scroll.append(core.ui.create({
            type: core.ui.UIButton,
            args: "<a class='more-index-item' target='_blank' href='tel:" + app.KFDH + "'><span class='more-phone'>联系客服&nbsp;<span style='font-size: 12px;color: #999999'>" + app.KFDH + "</span></a>"
        }));
        scroll.append(core.ui.create({
            type: core.ui.UIButton,
            args: "<div class='more-index-item'><span class='more-suggest'>意见反馈</span></a>",
            click: function () {
                core.href("common/textarea", {
                    name: "意见反馈",
                    placeholder: "欢迎您提出宝贵的意见，您的关注是我们前进的唯一动力",
                    cb: function (content, finish) {
                        core.network.protocol("center://YJFK_Insert", {
                            YJFK_FKYJ: content
                        }, function () {
                            core.message.alert("反馈成功，我们会尽快解决您的问题！");
                            finish(true);
                        }, function (msg) {
                            core.message.alert(msg);
                            finish(false);
                        });
                    }
                }, {
                    style: "back",
                    transform: "horizontal"
                });
            }
        }));
        scroll.append(core.ui.create({
            type: core.ui.UIButton,
            args: "<div class='more-index-item'><span class='more-new'>检查更新&nbsp;<span style='font-size: 12px;color: #999999'>v" + app.BBH + "</span></span></div>",
            click: function () {
                if (core.config.version.replace(".", "") < app.BBH.replace(".", "")) {
                    if (core.os.ios) {
                        core.browser.action(core.config.download.ios);
                    } else if (core.os.android) {
                        core.browser.action(core.config.download.android);
                    } else {
                        core.browser.action(core.config.download.url);
                    }
                } else {
                    core.message.alert("当前已经是最新版！");
                }
            }
        }));
        scroll.append(core.ui.create({
            type: core.ui.UIButton,
            args: "<div class='more-index-item'><span class='more-introduce'>新手引导</span></span></div>",
            click: function () {
                core.href("more/welcome-start", null, {
                    style: "back",
                    transform: "horizontal"
                });
            }
        }));
        if (app.GYWM.length > 0) {
            scroll.append(core.ui.create("more-index-space"));
            scroll.append(core.ui.create("more-index-line"));
            app.GYWM.forEach(function (item) {
                scroll.append(core.ui.create({
                    type: core.ui.UIButton,
                    args: "<div class='more-index-item'><span class='more-us' style='background-image: url(\"" + item.GYWM_TP + "\")'>" + item.GYWM_BT + "</span></div>",
                    click: function () {
                        core.href("common/content", {
                            title: item.GYWM_BT,
                            content: item.GYWM_NR
                        }, {
                            style: "back",
                            transform: "horizontal"
                        });
                    }
                }));
            });
        }
        cb(view);
    }

    core.network.protocol("center://APP_Detail", {}, function (d) {
        if (d.success) {
            load_item(d.info);
        } else {
            load_item(core.config.app);
        }
    }, function () {
        load_item(core.config.app);
    });
};