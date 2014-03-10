/**
 * Created by 清月_荷雾 on 14-3-4.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * 项目的配置信息（index会在core中附加这些参数）
 * @note 以下所有参数都不是必须的，您可以按照自己喜欢的方式把需要的常量放置进来
 */

module.exports = {
    name: "96368统一订单平台",
    navigation: [
        {
            name: "cigarette",
            style: "ui-nav-default-cigarette",
            text: "定烟",
            view: "cigarette/index"
        },
        {
            name: "free",
            style: "ui-nav-default-free",
            text: "非烟",
            view: "free/index"
        },
        {
            name: "message",
            style: "ui-nav-default-message",
            text: "消息",
            view: "message/index"
        },
        {
            name: "user",
            style: "ui-nav-default-user",
            text: "个人",
            view: "user/index"
        },
        {
            name: "more",
            style: "ui-nav-default-more",
            text: "更多",
            view: "more/index"
        }
    ],
    xsm: "http://122.228.226.25/pm2",
    balance: "http://soft.hnu.edu.cn/phone/",
    version: "0.1.1"
};