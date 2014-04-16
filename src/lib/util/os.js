/**
 * Created by 赤菁风铃 on 14-2-24.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 * @note 系统信息
 */

var userAgent = window.navigator.userAgent;
var os = {};
/**
 * 根据userAgent获取系统信息
 */
os.webkit = userAgent.match(/WebKit\/([\d.]+)/) ? true : false;
os.android = userAgent.match(/(Android)\s+([\d.]+)/) || userAgent.match(/Silk-Accelerated/) ? true : false;
os.androidICS = os.android && userAgent.match(/(Android)\s4/) ? true : false;
os.ipad = userAgent.match(/(iPad).*OS\s([\d_]+)/) ? true : false;
os.iphone = !os.ipad && userAgent.match(/(iPhone\sOS)\s([\d_]+)/) ? true : false;
os.webos = userAgent.match(/(webOS|hpwOS)[\s\/]([\d.]+)/) ? true : false;
os.touchpad = os.webos && userAgent.match(/TouchPad/) ? true : false;
os.ios = os.ipad || os.iphone || false;
os.playbook = userAgent.match(/PlayBook/) ? true : false;
os.blackberry = os.playbook || userAgent.match(/BlackBerry/) ? true : false;
os.blackberry10 = os.blackberry && userAgent.match(/Safari\/536/) ? true : false;
os.chrome = userAgent.match(/Chrome/) ? true : false;
os.opera = userAgent.match(/Opera/) ? true : false;
os.fennec = userAgent.match(/fennec/i) ? true : userAgent.match(/Firefox/) ? true : false;
os.ie = userAgent.match(/MSIE 10.0/i) ? true : false;
os.ieTouch = os.ie && userAgent.toLowerCase().match(/touch/i) ? true : false;
os.supportsTouch = 'ontouchstart' in window;

//修复部分不能使用常规判断得到的属性
var head = document.documentElement.getElementsByTagName("head")[0];
os.nativeTouchScroll = typeof (head.style["-webkit-overflow-scrolling"]) !== "undefined" && os.ios;

//去除所有标记为android但不是用webkit核心的浏览器
if (os.android && !os.webkit) {
    os.android = false;
}


module.exports = os;
