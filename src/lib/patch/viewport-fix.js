/**
 * Created by 赤菁风铃 on 14-3-1.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 * @note 修复直接使用手机浏览器访问时的问题
 */

var os = require("../util/os");
var head = document.getElementsByTagName('head');
var viewport = document.createElement('meta');
viewport.name = 'viewport';
var style = document.body.style;
style.position = "relative";
if (os.ipad) {
    style.width = "768px";
    style.height = "100%";
} else if (os.android || os.iphone) {
    style.width = "320px";
    style.height = "100%";
} else {
    style.width = "320px";
    style.height = "480px";
}
if (os.android) {
    viewport.content = 'target-densitydpi=' + ( 320 / window.screen.width * window.devicePixelRatio * 160) + ', width=device-width, user-scalable=no';
}
if (os.ios) {
    viewport.content = 'width=device-width, initial-scale=1.0, user-scalable=no';
}
head[head.length - 1].appendChild(viewport);
