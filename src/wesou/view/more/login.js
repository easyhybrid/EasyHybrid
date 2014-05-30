/**
 * Created by 赤菁风铃 on 14-3-28.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 *
 * @note 登录页面
 */

/**
 * 登录页面
 * @param core 核心工具
 * @param data 上一页面传递来的参数
 * @param cb 加载完成的回调函数
 */
module.exports = function (core, data, cb) {
    var login = new core.ui.create({
        type: core.ui.UIForm,
        args: {
            style: "more-login-form"
        },
        children: [
            "more-index-space",
            "more-index-line",
            "<div class='more-login-item'><span class='more-login'>手机号</span><input name='user' type='text' value='' /></div>",
            "<div class='more-login-item'><span class='more-password'>密　码</span><input name='password' type='password' value='' /></div>"
        ],
        submit: function (form) {
            core.network.protocol("center://YHXX_Check", {
                YHXX_ZH: core.dom.val(core.dom.find("[name=user]", form)[0]),
                YHXX_MM: core.dom.val(core.dom.find("[name=password]", form)[0])
            }, function (d) {
                if (d.success) {
                    core.data.save("user", d.info);
                    core.back(d.info);
                } else {
                    core.message.alert(d.message);
                }
            }, function () {
                core.message.alert("出现网络错误");
            });
        }
    });

    var button = core.ui.create({
        type: core.ui.UIButton,
        args: "<div class='more-login-button'>登录</div>",
        click: function () {
            login.submit();
        }
    });

    var view = core.ui.create({
        args: "absolute full-screen view",
        children: [
            {
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
                    "<div class='ui-header-title'>登录</div>",
                    {
                        args: "ui-header-right",
                        children: [
                            {
                                type: core.ui.UIButton,
                                args: "<div class='ui-header-text'>注册</div>",
                                click: function () {
                                    core.href("more/register", {
                                        YHXX_ZH: core.dom.val(login.find("[name=user]")[0]),
                                        YHXX_MM: core.dom.val(login.find("[name=password]")[0])
                                    }, {
                                        style: "back",
                                        transform: "horizontal"
                                    });
                                }
                            }
                        ]
                    }
                ]
            },
            {
                type: core.ui.UIScroll,
                args: "ui-content",
                children: {
                    args: "more-login-area",
                    children: [
                        login,
                        button
                    ]
                }
            }
        ],
        back: function (info) {
            if (info) {
                core.data.save("user", info);
                core.back(info);
            }
        }
    });
    cb(view);
};