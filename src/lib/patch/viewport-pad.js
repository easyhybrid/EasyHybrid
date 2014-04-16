/**
 * Created by 赤菁风铃 on 14-3-1.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 * @note 修复直接使用手机浏览器访问时的问题,请注意如果您的设备是手机(如果您在做非竖版手机应用，请排除此文件)
 */

var os = require("../util/os"),//引入系统库
    dpr = window.devicePixelRatio = window.devicePixelRatio || Math.round(window.screen.availWidth / document.documentElement.clientWidth) || 1,//实际像素比
    head = document.getElementsByTagName('head'),
    viewport = document.createElement('meta'),
    style = document.body.style;
if (os.ios) {
    dpr = 1;
}
viewport.name = 'viewport';
style.position = "relative";
style.overflow = "hidden";
var width = window.screen.width / dpr;
if (os.ipad) {
    style.width = "100%";
    style.height = "100%";
    viewport.content = 'width=device-width, initial-scale=1.0, user-scalable=no';
} else {
    //按照320宽度优化页面
    style.width = "100%";
    style.height = "100%";
    viewport.content = 'target-densitydpi=160, width=device-width, user-scalable=no';
}
head[head.length - 1].appendChild(viewport);
