/**
 * Created by 赤菁风铃 on 14-3-28.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 *
 * @note 示例首页
 */

module.exports = function (core, info, cb) {
    var names = {};
    var tpl = require("./tpl/index.html");
    var view = core.ui.tree(tpl.render({
        Author: [
            {
                name: "清月_荷雾",
                email: "441984145@qq.com"
            },
            {
                name: "赤菁风铃",
                email: "liuxuanzy@qq.com"
            }
        ]
    }), names);
    cb(view);
};