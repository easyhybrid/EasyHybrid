/**
 * Created by 赤菁风铃 on 14-3-28.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 *
 * @note 注册页面
 */

/**
 * 注册页面
 * @param core 核心工具
 * @param data 上一页面传递来的参数
 * @param cb 加载完成的回调函数
 */
module.exports = function (core, data, cb) {
    var register = new core.ui.create({
        type: core.ui.UIForm,
        args: {
            style: "more-login-form"
        },
        children: [
            "more-index-space",
            "more-index-line",
            "<div class='more-login-item'><span class='more-login'>手机号</span><input name='user' type='number' value='" + (data.YHXX_ZH || "") + "' /></div>",
            "<div class='more-login-item'><span class='more-password'>密　码</span><input name='password' type='text' value='" + (data.YHXX_MM || "") + "' /></div>",
            "<div class='more-login-item'><span class='more-suggest'>昵　称</span><input name='xingming' type='text' value='' /></div>"
        ],
        submit: function (form) {
            if (!/^0?(13[0-9]|15[012356789]|18[0236789]|14[57])[0-9]{8}$/.test(core.dom.val(core.dom.find("[name=user]", form)[0]))) {
                core.message.alert("请输入合法的手机号");
                return;
            }
            core.network.protocol("center://YHXX_Insert", {
                YHXX_ZH: core.dom.val(core.dom.find("[name=user]", form)[0]),
                YHXX_MM: core.dom.val(core.dom.find("[name=password]", form)[0]),
                YHXX_XM: core.dom.val(core.dom.find("[name=xingming]", form)[0])
            }, function (d) {
                if (d.success) {
                    core.message.alert("注册成功");
                    core.back(d.info, {
                        transform: "none"
                    });
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
        args: "<div class='more-login-button'>注册</div>",
        click: function () {
            register.submit();
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
                    "<div class='ui-header-title'>注册</div>"
                ]
            },
            {
                type: core.ui.UIScroll,
                args: "ui-content",
                children: {
                    args: "more-login-area",
                    children: [
                        register,
                        button
                    ]
                }
            }
        ]
    });
    cb(view);
};