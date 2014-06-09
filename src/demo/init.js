/**
 * Created by 赤菁风铃 on 14-6-6.
 */
module.exports = function (core) {
    var scroll = new core.ui.UIScroll("<div class='absolute full-screen'></div>");
    scroll.append(new core.ui.UIObject("<div style='width: 100px;height: 100px;background: red;'></div>"));
    scroll.attach(core.root);
};