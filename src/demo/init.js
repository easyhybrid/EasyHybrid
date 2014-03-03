/**
 * 初始化函数
 * @param core 加载完成的核心库
 */
module.exports = function (core) {
    return function () {
        var result = core.util.parseUrl("http://221.176.1.140:8080/wlan/index.php?wlanacname=1066.0731.731.00&wlanuserip=10.11.48.12&ssid=CMCC#1da");
        console.log(result);
        console.log(result.format());
        //系统会在cordova加载完成后调用这个函数
        alert("成功加载EasyHybrid");
    };
};