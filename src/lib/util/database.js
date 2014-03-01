/**
 * Created by 清月_荷雾 on 14-2-8.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 * @note 数据库相关操作
 */

var lo = localStorage;

/**
 * 保存本地数据到localStorage中
 * @param key 保存的键
 * @param value 要保存的对象
 */
function setStorageItem(key, value) {
    lo.setItem(key, JSON.stringify({
        content: value
    }));
}
exports.setStorageItem = setStorageItem;

/**
 * 从本地localStorage中获取数据
 * @param key 要获取的键
 * @returns {*}
 */
function getStorageItem(key) {
    var data = lo.getItem(key);
    if (!data) {
        return null;
    }
    return JSON.parse(data).content;
}
exports.getStorageItem = getStorageItem;

/**
 * 清空本地localStorage
 */
function clearStorage() {
    lo.clear();
}
exports.clearStorage = clearStorage;
