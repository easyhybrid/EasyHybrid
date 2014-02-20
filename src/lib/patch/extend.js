/**
 * 用于对系统中核心对象进行扩展
 */
function extend() {
    /**
     * 扩展日期函数
     * @param format 格式化字符串
     * @returns string 字符串
     */
    Date.prototype.formatDate = function (format) {
        var date = this;
        format = format || "yyyy-MM-dd";
        var dict = {
            "yyyy": date.getFullYear(),
            "M": date.getMonth() + 1,
            "d": date.getDate(),
            "H": date.getHours(),
            "m": date.getMinutes(),
            "s": date.getSeconds(),
            "MM": ("" + (date.getMonth() + 101)).substr(1),
            "dd": ("" + (date.getDate() + 100)).substr(1),
            "HH": ("" + (date.getHours() + 100)).substr(1),
            "mm": ("" + (date.getMinutes() + 100)).substr(1),
            "ss": ("" + (date.getSeconds() + 100)).substr(1)
        };
        return format.replace(/(yyyy|MM?|dd?|HH?|ss?|mm?)/g, function () {
            return dict[arguments[0]];
        });
    };

    /**
     * 对Array进行扩展，添加是否数组的判断方法
     * @type {*|Function}
     */
    Array.isArray = Array.isArray || function (obj) {
        return typeof obj === "object" && Object.prototype.toString.call(obj).slice(8, -1) === "[object Array]";
    };
}
exports.extend = extend;

