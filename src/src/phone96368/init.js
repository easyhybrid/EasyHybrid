/**
 * Created by 清月_荷雾 on 14-3-4.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * 项目的入口函数（index会在core加载完毕时获取此函数）
 */

/**
 * 项目初始化代码
 * @param core 核心工具类
 * @returns {Function}返回函数会在项目加载完成时被回调，所以请不要在代码里面使用异步调用
 */
module.exports = function (core) {
    var util = core.util;
    return function () {
        var balance = core.config.balance;
        var oraXsm = util.load("xsm") || core.config.xsm;
        var _timeout = null;
        var _loaded = false;

        function load(free, xsm) {
            if (_loaded) {
                return;
            }
            _loaded = true;
            if (!free) {
                core.getNavigation("default").remove("free");
                core.config.free = null;
            } else {
                core.config.free = free;
            }
            core.config.xsm = xsm;
        }

        _timeout = setTimeout(function () {
            _timeout = null;
            load(false, oraXsm);
        }, 2000);
        util.post(balance, {"m": "Api", "a": "balance", version: core.config.version}, function (data) {
            data = JSON.parse(data);
            if (_timeout) {
                clearTimeout(_timeout);
            }
            if (data.success) {
                util.save("xsm", data.xsm);
                load(data.free, data.xsm);
                return;
            }
            load(false, oraXsm);
        }, function () {
            load(false, oraXsm);
        });
        core.href("user/login");//如果没有什么特别的定制，这里可以只是单独的导航到某一个功能
    };

};


