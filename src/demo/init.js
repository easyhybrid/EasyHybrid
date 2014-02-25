/**
 * 初始化函数
 * @param core 加载完成的核心库
 */
module.exports = function (core) {
    return function () {
        //系统会在cordova加载完成后调用这个函数
        alert("成功加载EasyHybrid");
    };
};