/**
 * Created by 清月_荷雾 on 14-3-4.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * 项目的配置信息（index会在core中附加这些参数）
 * @note 以下所有参数都不是必须的，您可以按照自己喜欢的方式把需要的常量放置进来
 */

module.exports = {
    name: "位搜",
    center: "http://soft.hnu.edu.cn/wszxfw/public/api.php",
    city: [
        {
            "FZXX_BH": "344",
            "FZXX_MC": "长沙",
            "FZXX_PYSZM": "C",
            "FZXX_PYZJF": "CS",
            "FZXX_SFRM": "是",
            "FZXX_JD": "112.942637",
            "FZXX_WD": "28.179953",
            "FZXX_FWQ": "http://soft.hnu.edu.cn/wszxfw/public/api.php"
        }
    ],
    version: "1.0.0",
    app: {
        BBH: "1.0.0",
        KFDH: "18974870906",
        GYWM: []
    },
    download: {
        ios: "itms-apps://itunes.apple.com/cn/app/wei-sou/id554117019?mt=8",
        android: "market://details?id=com.fengling.wesou",
        url: "http://www.wesou.com"
    },
    welcome: {
        end: "位搜，帮你找到属于自己的位置和故事\n开启你有位置有故事的生活",
        pages: [
            {
                title: "让你轻松找到身边的所有位置信息",
                message: "在位搜，每一条信息都在等你出现",
                image: "css/img/more-welcome0.png"
            },
            {
                title: "让你所需要的精准位置信息找到你",
                message: "在位搜，每一条信息都是灵性生命",
                image: "css/img/more-welcome1.png"
            },
            {
                title: "让你快速创建你要发布的位置信息",
                message: "在位搜，每一条信息都有一个位置",
                image: "css/img/more-welcome2.png"
            },
            {
                title: "让你深入位置信息享受更多的服务",
                message: "在位搜，每一个位置都有很多故事",
                image: "css/img/more-welcome3.png"
            }
        ]
    },
    maps: [
        {
            name: "baidu",
            chn: "百度地图",
            android: {
                id: "com.baidu.BaiduMap",
                uri: "bdapp://",
                market: "market://details?id=com.baidu.BaiduMap"
            },
            ios: {
                id: "452186370",
                uri: "baidumap://",
                market: "itms-apps://itunes.apple.com/cn/app/bai-du-de-tu-yu-yin-dao-hang/id452186370?mt=8"
            },
            web: {
                id: "",
                uri: "http://",
                market: ""
            },
            format: function (data) {
                return "map/direction?origin=name:" +
                    data.origin.name +
                    "|latlng:" +
                    data.origin.latitude +
                    "," + data.origin.longitude +
                    "&destination=name:" + data.destination.name +
                    "|latlng:" + data.destination.latitude +
                    "," + data.destination.longitude +
                    "&mode=driving&src=位搜&coord_type=wgs84";
            }
        },
        {
            name: "apple",
            chn: "苹果地图",
            android: {
                id: "",
                uri: "",
                market: ""
            },
            ios: {
                id: "",
                uri: "http:://",
                market: ""
            },
            web: {
                id: "",
                uri: "http://",
                market: ""
            },
            format: function (data) {
                return "maps.apple.com/?saddr=" +
                    data.origin.name +
                    "&sll=" +
                    data.origin.latitude +
                    "," + data.origin.longitude +
                    "&daddr=" + data.destination.name +
                    "&ll=" + data.destination.latitude +
                    "," + data.destination.longitude;
            }
        }
    ]
};