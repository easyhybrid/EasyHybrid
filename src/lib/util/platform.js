/**
 * Created by 赤菁风铃 on 14-2-24.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 * @note 系统信息和平台信息
 */

var userAgent = 

/**
 * 根据userAgent对系统进行设置
 * @param userAgent 用户代理信息
 * @constructor
 */
function OS(userAgent) {
    this.webkit = userAgent.match(/WebKit\/([\d.]+)/) ? true : false;
    this.android = userAgent.match(/(Android)\s+([\d.]+)/) || userAgent.match(/Silk-Accelerated/) ? true : false;
    this.androidICS = this.android && userAgent.match(/(Android)\s4/) ? true : false;
    this.ipad = userAgent.match(/(iPad).*OS\s([\d_]+)/) ? true : false;
    this.iphone = !this.ipad && userAgent.match(/(iPhone\sOS)\s([\d_]+)/) ? true : false;
    this.webos = userAgent.match(/(webOS|hpwOS)[\s\/]([\d.]+)/) ? true : false;
    this.touchpad = this.webos && userAgent.match(/TouchPad/) ? true : false;
    this.ios = this.ipad || this.iphone;
    this.playbook = userAgent.match(/PlayBook/) ? true : false;
    this.blackberry = this.playbook || userAgent.match(/BlackBerry/) ? true : false;
    this.blackberry10 = this.blackberry && userAgent.match(/Safari\/536/) ? true : false;
    this.chrome = userAgent.match(/Chrome/) ? true : false;
    this.opera = userAgent.match(/Opera/) ? true : false;
    this.fennec = userAgent.match(/fennec/i) ? true : userAgent.match(/Firefox/) ? true : false;
    this.ie = userAgent.match(/MSIE 10.0/i) ? true : false;
    this.ieTouch = this.ie && userAgent.toLowerCase().match(/touch/i) ? true : false;
    this.supportsTouch = ((window.DocumentTouch && document instanceof window.DocumentTouch) || 'ontouchstart' in window);
    var head = document.documentElement.getElementsByTagName("head")[0];
    this.nativeTouchScroll = typeof (head.style["-webkit-overflow-scrolling"]) !== "undefined" && this.ios;
    if (this.android && !this.webkit) {
        this.android = false;
    }
}
exports.os = new OS(window.navigator.userAgent);
exports.platform = {};//平台配置信息
