/**
 * Created by 赤菁风铃 on 14-3-1.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 * @note 修复部分浏览器不支持Array.forEach等方法的问题，并提供异步支持
 */

/**
 * 异步调用数组中的每一个元素并执行回调
 * @param fn 回调函数
 * @param thisObj 上下文对象
 * @param cb 全部执行完成后调用的回调
 */
Array.prototype.async = function (fn, thisObj, cb) {
    var self = this,
        total = self.length,
        i = 0;

    function done() {
        if (i >= total) {
            cb();
            return;
        }
        fn.call(typeof thisObj === "undefined" ? self[i] : thisObj, self[i], i, self, done);
        i++;
    }

    done();
};

if (typeof Array.prototype.forEach !== "function") {
    /**
     * 同步调用数组中的每一个元素并执行回调
     * @param fn 回调函数
     * @param thisObj 上下文对象
     */
    Array.prototype.forEach = function (fn, thisObj) {
        for (var i = 0; i < this.length; i++) {
            fn.call(typeof thisObj === "undefined" ? this[i] : thisObj, this[i], i, this);
        }
    };
}


