/**
 * Created by 赤菁风铃 on 14-3-1.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 * @note 修复IOS平台的特性
 */

var plugin = require("./../plugin/plugin");

plugin.platform = "ios";

setTimeout(function () {
    plugin.exec(null, null, "SplashScreen", "hide", []);
}, 3000);
