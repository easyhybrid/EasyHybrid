/**
 * 初始化函数
 * @param core 加载完成的核心库
 */
module.exports = function (core) {
    return callback(function () {
        //系统会在window.onload事件中调用这个函数
        alert("成功加载EasyHybrid");
    });
};