/**
 * Created by 清月_荷雾 on 14-3-4.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * 项目的默认导航条
 */

module.exports = function (core) {
    var util = core.util;
    var UISimpleNavigation = core.ui.UISimpleNavigation;
    var UIStateItem = core.ui.UIStateItem;
    var items = core.config.navigation;
    var nav = new UISimpleNavigation("ui-nav-default", core.root);
    var onclick = function (dom, item) {
        core.href(item.name);
    };
    for (var x in items) {
        if (items.hasOwnProperty(x)) {
            var item = items[x];
            var state = new UIStateItem("active",
                util.formatString('<div class="ui-nav-default-item %s">%s</div>', item.style, item.text),
                item,
                false
            );
            state.on("click", onclick);
        }
    }
    return nav;
};