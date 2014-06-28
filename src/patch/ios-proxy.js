/**
 * Created by 赤菁风铃 on 14-3-1.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 * @note 修复IOS平台的特性
 */

var plugin = require("./../plugin/plugin");

plugin.platform = "ios";

setTimeout(function () {
    plugin.exec("SplashScreen", "hide", []);
}, 3000);

////TODO 临时性禁用IOS自然滚动
//var dom = require("../util/dom");
//dom.support.nativeTouchScroll = false;
