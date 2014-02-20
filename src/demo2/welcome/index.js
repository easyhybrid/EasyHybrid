/**
 * 欢迎页面
 * @param core 加载完成的核心库
 * @param data 从上一个页面传递来的数据
 * @param callback 回调函数
 */
module.exports = function (core, data, callback) {
    var options = {

    };
    var view = new core.ui.UIView(options);
    //为view添加事件或者组件
    view.on("load", function () {
        //页面加载完成事件

    });

    view.on("back", function (data) {
        //从其它页面导航回来的事件
    });

    callback(view);//回调视图对象
};