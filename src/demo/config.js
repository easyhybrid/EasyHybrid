/**
 * Created by 清月_荷雾 on 14-3-4.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * 项目的配置信息（index会在core中附加这些参数）
 * @note 以下所有参数都不是必须的，您可以按照自己喜欢的方式把需要的常量放置进来
 */

module.exports = {
    name: "EasyHybrid演示项目",
    navigation: [
        {
            name: "introduce",
            style: "ui-nav-default-introduce",
            text: "介绍",
            view: "introduce/index"
        },
        {
            name: "util",
            style: "ui-nav-default-util",
            text: "工具",
            view: "util/index"
        },
        {
            name: "plugin",
            style: "ui-nav-default-plugin",
            text: "插件",
            view: "plugin/index"
        },
        {
            name: "more",
            style: "ui-nav-default-more",
            text: "更多",
            view: "more/index"
        }
    ]
};