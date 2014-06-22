/**
 * Created by 清月_荷雾 on 14-2-8.
 * author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * Form控件
 * 如果你不打算提供一个提交按钮，请使用此控件
 */
var util = require("../util/util"),
    dom = require("../util/dom"),
    UIObject = require("./UIObject").UIObject;

/**
 * Form控件
 * @constructor
 */
function UIForm(options) {
    if (!options || typeof options === "string" || options.nodeType) {
        options = {
            html: options
        };
    }
    UIObject.call(this, options.html);
    if (!dom.nodeName(this._dom, "form")) {
        var form = dom.parse("<form action='#'></form>")[0];
        var parent = this._dom.parentNode;
        form.appendChild(this._dom);
        if (parent) {
            parent.appendChild(form);
        }
        this._target = this._dom;
        this._dom = form;
    } else {
        this._target = this._dom;
    }
    this._dom.appendChild(dom.parse("<input type='submit' style='width: 0;opacity: 0;border: none' value='" + (options.button || "前往") + "'/>")[0]);
    var self = this;
    this.bind(null, "submit", function (e) {
        e.preventDefault();
        e.stopPropagation();
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

/**
 * 添加一个子元素
 */
UIForm.prototype.append = function () {
    var dom = this._dom;
    this._dom = this._target;
    UIObject.prototype.append.apply(this, arguments);
    this._dom = dom;
};

UIForm.prototype.insert = function () {
    var dom = this._dom;
    this._dom = this._target;
    UIObject.prototype.insert.apply(this, arguments);
    this._dom = dom;
};

UIForm.prototype.clear = function () {
    var dom = this._dom;
    this._dom = this._target;
    UIObject.prototype.clear.apply(this, arguments);
    this._dom = dom;
};


exports.UIForm = UIForm;