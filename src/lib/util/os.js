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
os.android = userAgent.match(/(Android)\s+([\d.]+)/) || userAgent.match(/Silk-Accelerated/) ? true : false;
os.androidICS = os.android && userAgent.match(/(Android)\s4/) ? true : false;


os.ipad = userAgent.match(/(iPad).*OS\s([\d_]+)/) ? true : false;
os.iphone = userAgent.match(/(iPhone\sOS)\s([\d_]+)/) ? true : false;
os.ios = os.ipad || os.iphone || false;

os.webos = userAgent.match(/(webOS|hpwOS)[\s\/]([\d.]+)/) ? true : false;
os.touchpad = os.webos && userAgent.match(/TouchPad/) ? true : false;

os.playbook = userAgent.match(/PlayBook/) ? true : false;
os.blackberry = os.playbook || userAgent.match(/BlackBerry/) ? true : false;
os.blackberry10 = os.blackberry && userAgent.match(/Safari\/536/) ? true : false;

os.webkit = userAgent.match(/WebKit\/([\d.]+)/) ? true : false;
os.chrome = userAgent.match(/Chrome/) ? true : false;
os.opera = userAgent.match(/Opera/) ? true : false;
os.fennec = userAgent.match(/fennec/i) ? true : userAgent.match(/Firefox/) ? true : false;
os.ie = userAgent.match(/MSIE 10.0/i) ? true : false;
os.ieTouch = os.ie && userAgent.toLowerCase().match(/touch/i) ? true : false;
os.fullscreen = os.android || os.ios || os.blackberry || os.ieTouch;//基本匹配可能用到的移动设备（支持android ios wp和blackberry）

//去除所有标记为android但不是用webkit核心的浏览器
if (os.android && !os.webkit) {
    os.android = false;
}
//修复部分不能使用常规判断得到的属性
os.supportsTouch = 'ontouchstart' in window;
os.nativeTouchScroll = typeof (document.documentElement.getElementsByTagName("head")[0].style["-webkit-overflow-scrolling"]) !== "undefined" && os.ios;
module.exports = os;
