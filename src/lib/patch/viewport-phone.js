/**
 * Created by 赤菁风铃 on 14-3-1.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 * @note 修复直接使用手机浏览器访问时的问题,本文件会尽量给出一个320/360宽度的页面，您可能需要同时处理这两个分辨率
 * @note 320/360分辨率是比较适合手机屏幕显示的分辨率
 * @note 如果您在做的不是竖版手机页面，请排除这个文件
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
if (os.iphone) {
    style.width = "320px";
    style.height = "100%";
    viewport.content = 'width=device-width, initial-scale=1.0, user-scalable=no';
} else if ((os.ipad && (style.width * style.height) % 320 !== 0) || !os.fullscreen) {//处理使用ipad浏览器或者使用PC浏览器的情况，排除使用iphone虚拟机
    style.width = "360px";
    style.height = "615px";
} else if (width % 180 === 0) {
    //按照360宽度优化页面
    style.width = "360px";
    style.height = "100%";
    viewport.content = 'target-densitydpi=' + ( 360 / width * 160) + ', width=device-width, user-scalable=no';
} else {
    //按照320宽度优化页面
    style.width = "320px";
    style.height = "100%";
    viewport.content = 'target-densitydpi=' + ( 320 / width * 160) + ', width=device-width, user-scalable=no';
}
head[head.length - 1].appendChild(viewport);
