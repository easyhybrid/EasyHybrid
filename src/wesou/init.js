/**
 * Created by 清月_荷雾 on 14-3-4.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * 项目的入口函数（index会在core加载完毕时获取此函数）
 */

/**
 * 项目初始化代码
 * @param core 核心工具类
 */
module.exports = function (core) {
    core.network.setProtocol("center", {
        url: core.config.center + "/CommonApi",
        options: {
            responseType: "json",
            type: "post"
        }
    });
    var city = core.data.load("city");
    core.geolocation.position(function () {
    }, function () {
    }, {
        maximumAge: 10 * 60 * 1000,
        enableHighAccuracy: true
    });
    if (!city) {
        core.href("more/welcome-start");
    } else {
        core.network.setProtocol("site", {
            url: city.FZXX_FWQ + "/CommonApi",
            data: {
                FZXX_BH: city.FZXX_BH
            },
            options: {
                responseType: "json",
                type: "post"
            }
        });
        core.href("shop/index", city);
    }
};


