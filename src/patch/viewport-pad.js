/**
 * Created by 赤菁风铃 on 14-3-1.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 * @note 处理pad或者横板的应用的显示，请注意这个文件仅仅是将应用全屏，您需要自己处理各分辨率下的显示方式
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
if (os.ipad) {
    style.width = "100%";
    style.height = "100%";
    viewport.content = 'width=device-width, initial-scale=1.0, user-scalable=no';
} else {
    style.width = "100%";
    style.height = "100%";
    viewport.content = 'target-densitydpi=160, width=device-width, user-scalable=no';
}
head[head.length - 1].appendChild(viewport);
