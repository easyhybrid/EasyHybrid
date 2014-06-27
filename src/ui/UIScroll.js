/**
 * Created by 清月_荷雾 on 14-2-10.
 * author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * 一个内部元素可以自由移动的UIObject类
 */

var util = require("../util/util"),
    dom = require("../util/dom"),
    UIObject = require('./UIObject').UIObject,
    nativeTouchScroll = dom.support.nativeTouchScroll,
    handleFunc = function (e) {
        switch (e.type) {
            case 'touchstart':
                this._start(e);
                break;
            case 'touchmove':
                this._move(e);
                break;
            case 'touchend':
                this._end(e);
                break;
            case 'resize':
                this.refresh(e);
                break;
            case 'transitionend':
            case 'webkitTransitionEnd':
            case 'oTransitionEnd':
            case 'MSTransitionEnd':
                this._transitionEnd(e);
                break;
        }
    };

/**
 * 内部元素可以自由移动的UIObject类
 * @param options 配置参数
 * @constructor
 */
function UIScroll(options) {
    if (!options || typeof options === "string" || options.nodeType) {
        options = {
            html: options
        };
    }
    UIObject.call(this, options.html);
    var event = options.event;
    var type = options.type || "vertical";
    this._horizontal = false;
    this._vertical = false;
    if (type === "horizontal" || type === "both") {
        this._horizontal = true;
    }
    if (type === "vertical" || type === "both") {
        this._vertical = true;
    }
    this.wrapper = this._dom;
    this.freeScroll = !event && nativeTouchScroll;
    this.emitEvent = event;
    this.emitMove = event && options.move;
    if (this.freeScroll) {
        dom.style(this.wrapper, "overflowY", this._horizontal ? "scroll" : "hidden");
        dom.style(this.wrapper, "overflowX", this._vertical ? "scroll" : "hidden");
        dom.style(this.wrapper, "webkitOverflowScrolling", "touch");
        return;
    }
    dom.style(this.wrapper, "overflow", "hidden");
    var scroller = this.scroller = dom.parse('<div class="absolute" style="width: 100%;"></div>')[0];
    var arr = [].slice.call(this.wrapper.childNodes);
    util.each(arr, function (i, item) {
        if (item.nodeType === 1 || item.nodeType === 3 && util.trim(item.textContent)) {
            scroller.appendChild(item);
        }
    });
    this.wrapper.appendChild(this.scroller);
    this.x = 0;//水平滚动位置
    this.y = 0;//竖直滚动位置
    this._inited = false;
    var proxy = util.proxy(handleFunc, this);
    this.bind(this.wrapper, "touchstart", proxy);
    this.bind(this.wrapper, "touchmove", proxy);
    this.bind(this.wrapper, "touchend", proxy);
    this.bind(this.scroller, "transitionend", proxy);
    this.bind(this.scroller, "webkitTransitionEnd", proxy);
    this.bind(this.scroller, "oTransitionEnd", proxy);
    this.bind(this.scroller, "MSTransitionEnd", proxy);
    dom.style(this.scroller, "transitionTimingFunction", "cubic-bezier(0.1, 0.57, 0.1, 1)");
}

util.inherits(UIScroll, UIObject);

/**
 * 重写追加元素类
 */
UIScroll.prototype.append = function () {
    if (this.freeScroll) {
        UIObject.prototype.append.apply(this, arguments);
    } else {
        this._dom = this.scroller;
        UIObject.prototype.append.apply(this, arguments);
        if (this._inited) {
            this.refresh();
        }
        this._dom = this.wrapper;
    }
};

/**
 * 重写追加元素类
 */
UIScroll.prototype.insert = function () {
    if (this.freeScroll) {
        UIObject.prototype.insert.apply(this, arguments);
    } else {
        this._dom = this.scroller;
        UIObject.prototype.insert.apply(this, arguments);
        if (this._inited) {
            this.refresh();
        }
        this._dom = this.wrapper;
    }
};

/**
 * 重写删除元素类
 */
UIScroll.prototype.remove = function () {
    if (this.freeScroll) {
        UIObject.prototype.remove.apply(this, arguments);
    } else {
        this._dom = this.scroller;
        UIObject.prototype.remove.apply(this, arguments);
        if (this._inited) {
            this.refresh();
        }
        this._dom = this.wrapper;
    }
};

UIScroll.prototype.clear = function () {
    if (this.freeScroll) {
        UIObject.prototype.clear.apply(this, arguments);
    } else {
        this._dom = this.scroller;
        UIObject.prototype.clear.apply(this, arguments);
        if (this._inited) {
            this.refresh();
        }
        this._dom = this.wrapper;
    }
};

/**
 * 滚动到指定元素
 * @param x 开始位置
 * @param y 结束位置
 * @param time 时间
 */
UIScroll.prototype.scrollTo = function (x, y, time) {
    if (!dom.contains(document.body, this.wrapper)) {
        return;
    } else if (!this._inited) {
        this.refresh();
    }
    this.isInTransition = time > 0;
    time = time || 0;
    dom.style(this.scroller, "transitionDuration", time + 'ms');
    this._translate(x, y);
};

//noinspection JSUnusedGlobalSymbols
/**
 * 滚动到指定元素
 * @param ele UIObject或者dom
 * @param time 滚动时间
 */
UIScroll.prototype.scrollToElement = function (ele, time) {
    if (!dom.contains(document.body, this.wrapper)) {
        return;
    } else if (!this._inited) {
        this.refresh();
    }

    if (ele instanceof  UIObject) {
        ele = ele._dom;
    } else {
        ele = dom.find(ele, this.scroller)[0];
    }
    if (!ele) {
        return;
    }
    var pos = dom.position(ele);
    pos.left = -pos.left;
    pos.top = -pos.top;
    pos.left = pos.left > 0 || this.maxScrollX > 0 ? 0 : pos.left < this.maxScrollX ? this.maxScrollX : pos.left;
    pos.top = pos.top > 0 || this.maxScrollY > 0 ? 0 : pos.top < this.maxScrollY ? this.maxScrollY : pos.top;
    time = time === undefined || time === null || time === 'auto' ? Math.min(2000, Math.max(Math.abs(pos.left) * 2, Math.abs(pos.top) * 2)) : time;
    this.scrollTo(pos.left, pos.top, time);
};

/**
 * 重新初始化页面位置
 */
UIScroll.prototype.refresh = function () {
    if (!this._inited) {
        var position = dom.css(this.wrapper, "position");
        if (position !== "absolute") {
            dom.style(this.wrapper, "position", "relative");
        }
        this._inited = true;
    }
    var wrapperWidth = this.wrapper.clientWidth;
    var wrapperHeight = this.wrapper.clientHeight;
    var scrollerWidth = this.scroller.offsetWidth;
    var scrollerHeight = this.scroller.offsetHeight;
    this.maxScrollX = wrapperWidth - scrollerWidth;
    this.maxScrollY = wrapperHeight - scrollerHeight;
    this._horizontalEnd = this._horizontal && this.maxScrollX < 0;
    this._verticalEnd = this._vertical && this.maxScrollY < 0;
    if (!this._horizontal) {
        this.maxScrollX = 0;
    }
    if (!this._vertical) {
        this.maxScrollY = 0;
    }
    this._resetPosition();
};

/**
 * 动画结束事件
 * @private
 */
UIScroll.prototype._transitionEnd = function (e) {
    if (e.target !== this.scroller || !this.isInTransition) {
        return;
    }
    dom.style(this.scroller, "transitionDuration", '0ms');
    if (!this._resetPosition(600)) {
        this.isInTransition = false;
        if (this.emitEvent) {
            this.emit("end", {x: this.x, y: this.y});
        }
    }
};

/**
 * 重置元素所在位置(对于元素不在预期的元素进去规范)
 * @param [time] 动画的时间
 * @returns {boolean}
 * @private
 */
UIScroll.prototype._resetPosition = function (time) {
    var x = this.x,
        y = this.y;
    time = time || 0;
    if (!this._horizontalEnd || this.x > 0) {
        x = 0;
    } else if (this.x < this.maxScrollX) {
        x = this.maxScrollX;
    }
    if (!this._verticalEnd || this.y > 0) {
        y = 0;
    } else if (this.y < this.maxScrollY) {
        y = this.maxScrollY;
    }
    if (x === this.x && y === this.y) {
        return false;
    }
    if (this.emitEvent && time > 0) {
        var self = this;
        if (this._horizontal && this.x > 0) {
            setTimeout(function () {
                self.emit("left");
            }, 10);
        }
        if (this._horizontal && this.x < this.maxScrollX && this.x < 0) {
            setTimeout(function () {
                self.emit("right");
            }, 10);
        }
        if (this._vertical && this.y > 0) {
            setTimeout(function () {
                self.emit("top");
            }, 10);
        }
        if (this._vertical && this.y < this.maxScrollY && this.y < 0) {
            setTimeout(function () {
                self.emit("bottom");
            }, 10);
        }
    }
    this.scrollTo(x, y, time);
    return true;
};

/**
 * 动画开始事件
 * @private
 */
UIScroll.prototype._start = function (e) {
    if (!this._inited) {
        this.refresh();
    }
    var point = e.touches ? e.touches[0] : e;
    this.moved = false;
    this.distX = 0;
    this.distY = 0;
    dom.style(this.scroller, "transitionDuration", '0ms');
    if (this.isInTransition) {
        this.isInTransition = false;
        var matrix = dom.css(this.scroller, "transform").replace(")", ""),
            x, y;
        var matrix2 = matrix.split(', ');
        x = +(matrix2[12] || matrix2[4]);
        y = +(matrix2[13] || matrix2[5]);
        this._translate(Math.round(x), Math.round(y));
        this.emit("end", {x: this.x, y: this.y});
    }
    this.pointX = point.pageX;
    this.pointY = point.pageY;
    if (this.emitEvent) {
        this.emit("start", {x: this.x, y: this.y});
    }
};

/**
 * 动画过程事件
 * @private
 */
UIScroll.prototype._move = function (e) {
    e.preventDefault();
    var point = e.touches ? e.touches[0] : e,
        deltaX = point.pageX - this.pointX,
        deltaY = point.pageY - this.pointY,
        newX, newY,
        absDistX, absDistY;

    this.pointX = point.pageX;
    this.pointY = point.pageY;

    this.distX += deltaX;
    this.distY += deltaY;
    absDistX = Math.abs(this.distX);
    absDistY = Math.abs(this.distY);

    if (absDistX < 10 && absDistY < 10) {
        return;
    }
    deltaX = this._horizontal ? deltaX : 0;
    deltaY = this._vertical ? deltaY : 0;
    newX = this.x + deltaX;
    newY = this.y + deltaY;

    if (newX > 0 || newX < this.maxScrollX) {
        newX = this.x + deltaX / 3;
    }
    if (newY > 0 || newY < this.maxScrollY) {
        newY = this.y + deltaY / 3;
    }
    this.moved = true;
    this._translate(newX, newY);
    if (this.emitMove) {
        this.emit("move", {x: this.x, y: this.y});
    }
};

/**
 * 动画结束事件
 * @private
 */
UIScroll.prototype._end = function () {
    this.isInTransition = 0;
    if (this._resetPosition(600)) {
        return;
    }
    if (this.emitEvent && !this.moved) {
        this.emit("cancel");
    } else if (this.emitEvent) {
        this.emit("end", {x: this.x, y: this.y});
    }
};

UIScroll.prototype._translate = function (x, y) {
    dom.style(this.scroller, "transform", 'translate(' + x + 'px,' + y + 'px)');
    this.x = x;
    this.y = y;
};

exports.UIScroll = UIScroll;

