/**
 * Created by 赤菁风铃 on 14-3-28.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 *
 * @note 众筹页面
 */

/**
 * 众筹页面
 * @param core 核心工具
 * @param data 上一页面传递来的参数
 * @param cb 加载完成的回调函数
 */
module.exports = function (core, data, cb) {
    var slide = core.widget.slide;//左边导航栏目
    var user = core.data.load("user");
    var button = core.ui.create({
        type: core.ui.UIButton,
        args: "<div class='more-login-button'>我要提意见</div>",
        click: function () {
            if (user) {
                core.href("common/textarea", {
                    name: data.type,
                    placeholder: data.type + "板块正在众筹中，欢迎您提出您宝贵的意见，建议您留下您的联系方式，如果您的建议被采纳，我们会有礼品送出",
                    cb: function (content, finish) {
                        core.network.protocol("center://YJFK_Insert", {
                            YJFK_FKYJ: content
                        }, function () {
                            core.message.alert("感谢提交，我们会认真阅读每一条建议");
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
                return;
            }
            core.href("more/login", {
            }, {
                style: "back",
                transform: "vertical"
            });
        }
    });

    var view = core.ui.create({
        args: "absolute full-screen view",
        back: function (d) {
            if (d && d.YHXX_BH) {
                user = d;
                setTimeout(function () {
                    core.href("common/textarea", {
                        name: data.type,
                        placeholder: data.type + "板块正在众筹中，欢迎您提出您宝贵的意见，建议您留下您的联系方式，如果您的建议被采纳，我们会有礼品送出",
                        cb: function (content, finish) {
                            core.network.protocol("center://YJFK_Insert", {
                                YJFK_FKYJ: content
                            }, function () {
                                core.message.alert("感谢提交，我们会认真阅读每一条建议");
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
                }, 300);
            }
        },
        children: [
            {
                args: "ui-header",
                children: [
                    {
                        args: "ui-header-left",
                        children: [
                            {
                                type: core.ui.UIButton,
                                args: "ui-header-menu",
                                click: function () {
                                    slide.show(data.current);
                                }
                            },
                            "ui-header-logo"
                        ]
                    },
                    "<div class='ui-header-title'>" + data.type + "</div>"
                ]
            },
            {
                type: core.ui.UIScroll,
                args: "ui-content",
                children: [
                    "<img class='more-suggest-img' src='css/img/more-suggest-img.png'/>",
                    "<div class='more-suggest-title'>活动内容</div>",
                    "<div class='more-suggest-content'>" +
                        "<p>位搜众筹，重奖及规则如下:</p>" +
                        "<p>A、参与众筹者需先用手机注册为位搜注册用户，所有奖品最终将以手机号为准进行颁发。</p>" +
                        "<p>B、每周在所有参与众筹的注册用户中抽取一个一等奖，奖励苹果5S手机一部。</p>" +
                        "<p>C、所提意见非常有价值并被直接采用的用户可成为位搜终身荣誉会员，享受最高级别的会员权益并赠送10000积分。</p>" +
                        "<p>D、所提意见被广泛讨论并被部分采用的用户可成为位搜索高级会员，享受高级别的会员权益并赠送3000积分。</p>" +
                        "<p>E、老用户可登录多次提出不同意见，按次参与抽奖，按意见数量及意见质量获取奖品。</p>" +
                        "</div>",
                    button
                ]
            }
        ]
    });
    cb(view);
};