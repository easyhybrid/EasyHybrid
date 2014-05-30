/**
 * Created by 清月_荷雾 on 14-2-8.
 * author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * Form控件
 * 如果你不打算提供一个提交按钮，请使用此控件
 */
var util = require("../util/util"),
    UIObject = require("./UIObject").UIObject;


/**
 * Form控件
 * @constructor
 */
function UIForm(options) {
    options = options || {};
    var form = util.format(
        "<form action='#' class='%s'>" +
            "<input type='submit' style='width: 0;opacity: 0;border: none' value='%s'/>" +
            "</form>",
        options.style || "",
        options.button || "前往"
    );
    UIObject.call(this, form);
    var self = this;
    this.bind(null, "submit", function (e) {
        e.preventDefault();
        self.emit("submit", self._dom);
        return false;
    });
}

util.inherits(UIForm, UIObject);

/**
 * 直接提交输入
 * @returns {*}
 */
UIForm.prototype.submit = function () {
    this.emit("submit", this._dom);
};

exports.UIForm = UIForm;