/**
 * 初始化函数
 * @param core 加载完成的核心库
 * @param callback 回调函数
 */
module.exports = function (core, callback) {
    //本文件用于进行数据或者导航条的初始化操作，当系统核心加载完成时会加载本文件所在的函数
    callback(function () {
        //系统会在window.onload事件中调用这个函数
        alert("成功加载EasyHybrid");
    });
};