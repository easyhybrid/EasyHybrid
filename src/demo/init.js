/**
 * Created by 清月_荷雾 on 14-3-4.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * 项目的入口函数（index会在core加载完毕时获取此函数）
 */

/**
 * 项目初始化代码
 * @param core 核心工具类
 * @returns {Function}返回函数会在项目加载完成时被回调，所以请不要在代码里面使用异步调用
 */
module.exports = function (core) {
    return function () {
        core.href("more/index");//如果没有什么特别的定制，这里可以只是单独的导航到某一个功能
    };
};