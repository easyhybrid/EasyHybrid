/**
 * Created by 赤菁风铃 on 14-2-24.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 * @note 系统信息
 */

var userAgent = window.navigator.userAgent;

/**
 * 根据userAgent获取系统信息
 */
var os = {
    webkit: userAgent.match(/WebKit\/([\d.]+)/) ? true : false,
    android: userAgent.match(/(Android)\s+([\d.]+)/) || userAgent.match(/Silk-Accelerated/) ? true : false,
    androidICS: this.android && userAgent.match(/(Android)\s4/) ? true : false,
    ipad: userAgent.match(/(iPad).*OS\s([\d_]+)/) ? true : false,
    iphone: !this.ipad && userAgent.match(/(iPhone\sOS)\s([\d_]+)/) ? true : false,
    webos: userAgent.match(/(webOS|hpwOS)[\s\/]([\d.]+)/) ? true : false,
    touchpad: this.webos && userAgent.match(/TouchPad/) ? true : false,
    ios: this.ipad || this.iphone,
    playbook: userAgent.match(/PlayBook/) ? true : false,
    blackberry: this.playbook || userAgent.match(/BlackBerry/) ? true : false,
    blackberry10: this.blackberry && userAgent.match(/Safari\/536/) ? true : false,
    chrome: userAgent.match(/Chrome/) ? true : false,
    opera: userAgent.match(/Opera/) ? true : false,
    fennec: userAgent.match(/fennec/i) ? true : userAgent.match(/Firefox/) ? true : false,
    ie: userAgent.match(/MSIE 10.0/i) ? true : false,
    ieTouch: this.ie && userAgent.toLowerCase().match(/touch/i) ? true : false,
    supportsTouch: 'ontouchstart' in window
};

//修复部分不能使用常规判断得到的属性
var head = document.documentElement.getElementsByTagName("head")[0];
os.nativeTouchScroll = typeof (head.style["-webkit-overflow-scrolling"]) !== "undefined" && os.ios;
//去除所有标记为android但不是用webkit核心的浏览器
if (os.android && !os.webkit) {
    os.android = false;
}

var _elementStyle = document.createElement('div').style,
    _vendor = (function () {
        var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
            transform,
            i = 0,
            l = vendors.length;

        for (; i < l; i++) {
            transform = vendors[i] + 'ransform';
            if (transform in _elementStyle) {
                return vendors[i].substr(0, vendors[i].length - 1);
            }
        }

        return false;
    })(),
    _prefixStyle = function (style) {
        if (_vendor === false) {
            return false;
        }
        if (_vendor === '') {
            return style;
        }
        return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
    };
os.prefixStyle = _prefixStyle;

module.exports = os;
