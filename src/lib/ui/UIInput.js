/**
 * Created by 清月_荷雾 on 14-2-8.
 * author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * 单条输入控件
 * 单条的input控件，提供点击，焦点等事件
 */
var dom = require("../util/dom"),
    util = require("../util/util"),
    UIObject = require("./UIObject").UIObject,
    blur = dom.createDom("<input type='text' style='width: 0;opacity: 0;border: none' />");

document.body.insertBefore(blur, document.body.firstChild);

/**
 * 输入条控件
 * @constructor
 */
function UIInput(options) {
    options = options || {};
    var form = util.format(
        "<form action='#' class='%s'>" +
            "<input  placeholder='%s' type='text' style='width: 100%;height: 100%;border: 0;background: none;'/>" +
            "<input type='submit' style='width: 0;opacity: 0;border: none' value='%s'/>" +
            "</form>",
        options.style || "",
        options.placeholder || "",
        options.button || "前往"
    );
    UIObject.call(this, form);
    var self = this;
    this.bind("input[type=text]", "click", function () {
        self.emit("click", this.value);
    });
    this.bind("input[type=text]", "keyup", function () {
        self.emit("change", this.value);
    });
    this.bind(null, "submit", function (e) {
        e.preventDefault();
        self.emit("submit", self.find("input[type=text]")[0].value);
        return false;
    });
}

util.inherits(UIInput, UIObject);

/**
 * 让元素获取焦点
 */
UIInput.prototype.focus = function () {
    this.find("input[type=text]")[0].focus();
};

/**
 * 一种可行的修复android下键盘bug的方法
 */
UIInput.prototype.blur = function () {
    this.find("input[type=text]")[0].blur();
    blur.blur();
    blur.focus();
    blur.style.display = "none";
    setTimeout(function () {
        blur.style.display = "block";
    }, 50);
};

/**
 * 获取或者设置输入值
 * @param v
 * @returns {*}
 */
UIInput.prototype.value = function (v) {
    if (typeof v === "undefined") {
        return this.find("input[type=text]")[0].value;
    }
    this.find("input[type=text]")[0].value = v || "";
    return null;
};

/**
 * 直接提交输入
 * @returns {*}
 */
UIInput.prototype.submit = function () {
    this.emit("submit", this.find("input[type=text]")[0].value);
};


exports.UIInput = UIInput;