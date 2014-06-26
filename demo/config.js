/**
 * Created by 清月_荷雾 on 14-3-4.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * 项目的配置信息（index会在core中附加这些参数）
 * @note 以下所有参数都不是必须的，您可以按照自己喜欢的方式把需要的常量放置进来
 */

module.exports = window.EASYHYBRID_CONFIG || {
    //应用基本信息
    name: "位搜",
    download: {
        ios: "itms-apps://itunes.apple.com/cn/app/wei-sou/id554117019",
        android: "market://details?id=com.fengling.wesou",
        url: "http://www.wesou.cn"
    },

    //组件配置
    skin: "orange",//换肤请修改
    widget: {
        slide: {
            url: "www.wesou.cn",
            load: "shop"
        }
    },

    //企业搜索模块信息
    shop: {
        enable: true,
        name: "搜索",
        server: "http://soft.hnu.edu.cn/wszxfw/public/api.php",
        city: false
    },

    //订阅模块信息
    subscribe: {
        enable: true,
        name: "订阅",
        book: true,
        server: "http://soft.hnu.edu.cn/wsdyfw/public/api.php"
    },

    //发布模块信息
    notice: {
        enable: true,
        name: "发布",
        server: "http://soft.hnu.edu.cn/wszxfw/public/api.php"
    },

    //深入模块信息
    compass: {
        enable: true,
        name: "深入",
        latitude: 27,
        longitude: 112,
        server: "http://soft.hnu.edu.cn/wszxfw/public/api.php"
    },

    //产品模块信息
    product: {
        enable: false,
        name: "产品",
        server: "http://soft.hnu.edu.cn/wszxfw/public/api.php"
    },

    //更多模块信息
    more: {
        enable: true,//禁用此模块将导致所有依赖用户的模块不可用
        name: "更多",
        server: "http://soft.hnu.edu.cn/wszxfw/public/api.php",
        version: "1.0.0",
        phone: "18688886665"
    },

    //欢迎模块
    welcome: {
        enable: true,
        pages: [
            {
                title: "让你轻松找到身边的所有位置信息",
                message: "在位搜，每一条信息都在等你出现",
                image: "css/img/welcome0.png"
            },
            {
                title: "让你所需要的精准位置信息找到你",
                message: "在位搜，每一条信息都是灵性生命",
                image: "css/img/welcome1.png"
            },
            {
                title: "让你快速创建你要发布的位置信息",
                message: "在位搜，每一条信息都有一个位置",
                image: "css/img/welcome2.png"
            },
            {
                title: "让你深入位置信息享受更多的服务",
                message: "在位搜，每一个位置都有很多故事",
                image: "css/img/welcome3.png"
            }
        ],
        end: "位搜，帮你找到属于自己的位置和故事\n开启你有位置有故事的生活"//换行请使用\n，两行
    }
};