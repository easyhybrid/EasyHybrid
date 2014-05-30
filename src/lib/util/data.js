/**
 * Created by 清月_荷雾 on 14-2-8.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 * @note HTML相关数据库操作函数
 */
var lo = window.localStorage;

/**
 * 保存数据（请注意本地存储只能存储少于2.5M的数据）
 * @param key 项目名称
 * @param item 数据项目
 */
function save(key, item) {
    lo.setItem(key, JSON.stringify({
        content: item
    }));
}
exports.save = save;

/**
 * 读取数据（请注意本地存储只能存储少于2.5M的数据）
 * @param key 要获取的键
 * @returns {*}
 */
function load(key) {
    var data = lo.getItem(key);
    if (!data) {
        return null;
    }
    return JSON.parse(data).content;
}
exports.load = load;

/**
 * 清理本地缓存
 */
exports.clear = function () {
    lo.clear();
};