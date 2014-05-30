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
                    name: "发布",
                    placeholder: "发布板块正在众筹中，欢迎您提出您宝贵的意见，建议您留下您的联系方式，如果您的建议被采纳，我们会有礼品送出",
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
                        name: "发布",
                        placeholder: "发布板块正在众筹中，欢迎您提出您宝贵的意见，建议您留下您的联系方式，如果您的建议被采纳，我们会有礼品送出",
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
                                    slide.show("notice");
                                }
                            },
                            "ui-header-logo"
                        ]
                    },
                    "<div class='ui-header-title'>发布</div>"
                ]
            },
            {
                type: core.ui.UIScroll,
                args: "ui-content",
                children: [
                    "<img class='more-suggest-img' src='css/img/more-suggest-notice.png'/>",
                    "<div class='more-suggest-title'>发布众筹活动简介</div>",
                    "<div class='more-suggest-content'>" +
                        "<p>发布是为广大有“位觉”的“位粉”们特别打造的个性化位置信息发布平台，在这里各位“位粉”可以随心所欲以自己为中心创建自己感兴趣的任何类型的位置信息或话题，并且这些位置信息或话题马上就能被周边及同城与自己有同样兴趣的人发现，从而为你提供专属的位置信息创建服务，让你过有“位觉”的“爵士生活”。</p>" +
                        "<p>发布属于位搜的三期工程，为更好的为“位粉”们服务，现向所有用户征集大家期望发布的信息类型，你的意见就是未来的发布，我们的位搜我们自己做主。并且位搜官方提供丰厚奖品，每周根据注册手机号抽出一台苹果5S，具体奖品及奖励规则请登录www.wesou.cn官网查看。</p>" +
                        "</div>",
                    button
                ]
            }
        ]
    });
    cb(view);
};