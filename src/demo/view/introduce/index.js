/**
 * Created by 清月_荷雾 on 14-3-4.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * 产品介绍和相关推荐
 * @note 这个页面用于展示UIObject的快速生成对象的方式
 */

module.exports = function (core, data, cb) {
    var tpl = require("./tpl/index.html");
    var view = core.ui.UIObject.create({
        type: core.ui.UIView,
        args: {
            style: "none",
            navigation: "default.introduce",
            transform: "none",
            reverse: false
        },
        children: [
            '<div class="ui-header"><div class="ui-header-title">框架介绍</div></div>',
            {
                args:'ui-content',
                children:[
                    {
                        type: core.ui.UIScroll,
                        args: [tpl.render(), "ui-content"],
                        event: {}
                    }
                ]
            }
        ]
    });
    cb(view);
};