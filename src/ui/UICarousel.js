/**
 * Created by 清月_荷雾 on 14-2-8.
 * author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * 图片轮播控件
 *
 */

var util = require("../util/util"),//引入工具类
    dom = require("../util/dom"),//DOM操作类
    UIObject = require('./UIObject').UIObject;//UIObject

/**
 * 图片轮播控件
 * @param options
 * @constructor
 */
function UICarousel(options) {
    if (!options || typeof options === "string" || options.nodeType) {
        options = {
            html: options
        };
    }
    UIObject.call(this, options.html);
    var event = options.event || false;//是否直接滑动切换
    var self = this;
    self._start = false;
    self._index = 0;
    self._interval = null;
    self._time = options.time || 4000;
    self._transform = options.transform || "carousel";
    self.on("destroy", function () {
        if (self._interval) {
            clearInterval(self._interval);
        }
    });
    if (event) {
        self.bind(null, "swipeLeft", function () {
            if (!self._start) {
                self.next();
                return;
            }
            clearInterval(self._interval);
            self._interval = null;
            self.next();
            self._interval = setInterval(function () {
                self.next();
            }, self._time);
        });
        self.bind(null, "swipeRight", function () {
            if (!self._start) {
                self.prev();
                return;
            }
            clearInterval(self._interval);
            self._interval = null;
            self.prev();
            self._interval = setInterval(function () {
                self.next();
            }, self._time);
        });
    }
}

util.inherits(UICarousel, UIObject);

/**
 * 开始滚动
 */
UICarousel.prototype.start = function () {
    var self = this;
    if (self._start || self._children.length <= 1) {
        return;
    }
    self._start = true;
    for (var k = 0; k < this._children.length; k++) {
        this._children[k]._dom.style.zIndex = 10000 + k;
    }
    self._interval = setInterval(function () {
        self.next();
    }, self._time);
    self.next();
};

/**
 * 结束滚动
 */
UICarousel.prototype.stop = function () {
    if (!this._start) {
        return;
    }
    this._start = false;
    clearInterval(this._time);
    this._interval = null;
    for (var k = 0; k < this._children.length; k++) {
        this._children[k]._dom.style.zIndex = 10000 + k;
    }
};
/**
 * 开始滚动
 */
UICarousel.prototype.next = function () {
    var self = this;
    if (self._children.length <= 1) {
        return;
    }
    var next = self._index;
    this.reset();
    this._index = (self._index + 1) % self._children.length;
    self._children[next]._dom.style.zIndex = parseInt(self._children[next]._dom.style.zIndex, 10) + self._children.length;
    dom.addClass(self._children[next]._dom, self._transform + "-in");
    this.emit("change", next);
};

/**
 * 开始滚动
 */
UICarousel.prototype.prev = function () {
    var self = this;
    if (self._children.length <= 1) {
        return;
    }
    self._index = (self._index - 1 + self._children.length) % self._children.length;
    var next = self._index;
    dom.addClass(self._children[next]._dom, self._transform + "-out");
    setTimeout(function () {
        self._children[next]._dom.style.zIndex = parseInt(self._children[next]._dom.style.zIndex, 10) - self._children.length;
        self.reset();

    }, 550);
    this.emit("change", (self._index - 1 + self._children.length) % self._children.length);
};

UICarousel.prototype.reset = function () {
    for (var i = 0; i < this._children.length; i++) {
        dom.removeClass(this._children[i]._dom, this._transform + "-in " + this._transform + "-out");
    }
    if (this._children[0]._dom.style.zIndex < 10000 - this._children.length) {
        for (var j = this._children.length - 1; j >= 0; j--) {
            this._children[j]._dom.style.zIndex = parseInt(this._children[j]._dom.style.zIndex, 10) + this._children.length;
        }
    } else if (this._children[0]._dom.style.zIndex > 10000 + this._children.length) {
        for (var k = 0; k < this._children.length; k++) {
            this._children[k]._dom.style.zIndex = parseInt(this._children[k]._dom.style.zIndex, 10) - this._children.length;
        }
    }

};


exports.UICarousel = UICarousel;