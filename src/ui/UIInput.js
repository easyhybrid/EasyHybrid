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
    blurdom = dom.parse("<input type='text' style='width: 0;opacity: 0;border: none' />")[0];

document.body.insertBefore(blurdom, document.body.firstChild);

/**
 * 输入条控件
 * @constructor
 */
function UIInput(options) {
    if (!options || typeof options === "string" || options.nodeType) {
        options = {
            html: options
        };
    }
    UIObject.call(this, options.html);
    if (!dom.nodeName(this._dom, "input")) {
        util.error("elem必须是一个input");
    }
    if (options.placeholder) {
        dom.attr(this._dom, "placeholder", options.placeholder);
    }
    this._input = this._dom;
    var form = dom.parse("<form action='#'></form>")[0];
    var parent = this._dom.parentNode;
    form.appendChild(this._dom);
    if (parent) {
        parent.appendChild(form);
    }
    this._dom.appendChild(dom.parse("<input type='submit' style='width: 0;opacity: 0;border: none' value='" + (options.button || "前往") + "'/>")[0]);
    var self = this;
    this.bind(this._input, "click", function () {
        self.emit("click", this.value);
    });
    this.bind(this._input, "keyup", function () {
        self.emit("change", this.value);
    });
    this.bind(null, "submit", function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.emit("submit", self.find("input[type=text]")[0].value);
        return false;
    });
}

util.inherits(UIInput, UIObject);

/**
 * 让元素获取焦点
 */
UIInput.prototype.focus = function () {
    dom.event.trigger(this._input, "focus");
};

/**
 * 一种可行的修复android下键盘bug的方法
 */
UIInput.prototype.blur = function () {
    dom.event.trigger(this._input, "blur");
    blurdom.blur();
    blurdom.focus();
    blurdom.style.display = "none";
    setTimeout(function () {
        blurdom.style.display = "block";
    }, 50);
};

/**
 * 获取或者设置输入值
 * @param v
 * @returns {*}
 */
UIInput.prototype.value = function (v) {
    if (v === undefined) {
        return dom.val(this._input);
    }
    return dom.val(this._input, v);
};

/**
 * 直接提交输入
 * @returns {*}
 */
UIInput.prototype.submit = function () {
    this.emit("submit", dom.val(this._input));
};


exports.UIInput = UIInput;