/**
 * Created by 清月_荷雾 on 14-2-10.
 * author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * 一个内部元素可以自由移动的UIObject类
 */

var util = require("../util/util"),
    dom = require("../util/dom"),
    UIObject = require('./UIObject').UIObject,
    _transform = dom.prefixStyle('transform'),
    _transition = {
        transitionTimingFunction: dom.prefixStyle('transitionTimingFunction'),
        transitionDuration: dom.prefixStyle('transitionDuration'),
        transitionDelay: dom.prefixStyle('transitionDelay')
    },
    nativeTouchScroll = document.createElement("div").style["-webkit-overflow-scrolling"] !== undefined
        && (navigator.userAgent.match(/(iPad).*OS\s([\d_]+)/) || navigator.userAgent.match(/(iPhone\sOS)\s([\d_]+)/));

/**
 * @constructor
 */
/**
 * 内部元素可以自由移动的UIObject类
 * @param options 配置参数
 * move事件
 * @constructor
 */
function UIScroll(options) {
    UIObject.call(this);
    if (typeof options === "string") {
        options = {
            style: options
        };
    }
    var event = options.event;
    var html = options.html;
    var type = options.type || "vertical";
    this._horizontal = false;
    this._vertical = false;
    if (type === "horizontal" || type === "both") {
        this._horizontal = true;
    }
    if (type === "vertical" || type === "both") {
        this._vertical = true;
    }
    this._dom = this.wrapper = dom.create(util.format('<div class="%s" style="overflow: hidden;"></div>', options.style || ""))[0];
    this.freeScroll = !event && nativeTouchScroll;
    this.emitEvent = event;
    this.emitMove = event && options.move;
    if (this.freeScroll) {
        this.wrapper.style.overflowY = this._horizontal ? "scroll" : "hidden";
        this.wrapper.style.overflowX = this._vertical ? "scroll" : "hidden";
        this.wrapper.style.webkitOverflowScrolling = "touch";
        if (html) {
            this.wrapper.innerHTML = html || "";
        }
        return;
    }
    this.scroller = dom.create('<div class="absolute" style="width: 100%;"></div>')[0];
    this.wrapper.appendChild(this.scroller);
    if (html) {
        this.scroller.innerHTML = html || "";
    }
    this.x = 0;//水平滚动位置
    this.y = 0;//竖直滚动位置
    this._inited = false;
    var me = this;
    me.once("load", function () {
        var styles = window.getComputedStyle(me.wrapper, null);
        if (styles.position !== "absolute") {
            me.wrapper.style.position = "relative";
        }
        me.scroller.style[_transition.transitionTimingFunction] = "cubic-bezier(0.1, 0.57, 0.1, 1)";
        me.bind(me.wrapper, "touchstart", me);
        me.bind(me.wrapper, "touchmove", me);
        me.bind(me.wrapper, "touchend", me);
        me.bind(me.scroller, "transitionend", me);
        me.bind(me.scroller, "webkitTransitionEnd", me);
        me.bind(me.scroller, "oTransitionEnd", me);
        me.bind(me.scroller, "MSTransitionEnd", me);
        me._inited = true;
        me.refresh();
    });
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
 * 重写向前追加元素类
 */
UIScroll.prototype.prepend = function () {
    if (this.freeScroll) {
        UIObject.prototype.prepend.apply(this, arguments);
    } else {
        this._dom = this.scroller;
        UIObject.prototype.prepend.apply(this, arguments);
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
    UIObject.prototype.clear.call(this);
    if (!this.freeScroll && this._inited) {
        this.refresh();
    }
};

/**
 * 滚动到指定元素
 * @param x 开始位置
 * @param y 结束位置
 * @param time 时间
 */
UIScroll.prototype.scrollTo = function (x, y, time) {
    this.isInTransition = time > 0;
    time = time || 0;
    this.scroller.style[_transition.transitionDuration] = time + 'ms';
    this._translate(x, y);
};

/**
 * 滚动到指定元素
 * @param ele UIObject或者dom
 * @param time 滚动时间
 */
UIScroll.prototype.scrollToElement = function (ele, time) {
    if (ele instanceof  UIObject) {
        ele = ele._dom;
    } else {
        ele = dom.find(ele, this.scroller)[0];
    }
    if (!ele) {
        return;
    }
    var pos = dom.offset(ele);
    var wap = dom.offset(this.wrapper);
    pos.left -= wap.left;
    pos.top -= wap.top;
    pos.left = pos.left > 0 || this.maxScrollX > 0 ? 0 : pos.left < this.maxScrollX ? this.maxScrollX : pos.left;
    pos.top = pos.top > 0 || this.maxScrollY > 0 ? 0 : pos.top < this.maxScrollY ? this.maxScrollY : pos.top;
    time = time === undefined || time === null || time === 'auto' ? Math.max(Math.abs(pos.left) * 2, Math.abs(pos.top) * 2) : time;
    this.scrollTo(pos.left, pos.top, time);
};


/**
 * 重新初始化页面位置
 */
UIScroll.prototype.refresh = function () {
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
 * 事件回调
 * @private
 * @param e 异常事件
 */
UIScroll.prototype.handleEvent = function (e) {
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
 * 动画结束事件
 * @private
 */
UIScroll.prototype._transitionEnd = function (e) {
    if (e.target !== this.scroller || !this.isInTransition) {
        return;
    }
    this.scroller.style[_transition.transitionDuration] = '0ms';
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
        if (this._horizontal && this.x < this.maxScrollX) {
            setTimeout(function () {
                self.emit("right");
            }, 10);
        }
        if (this._vertical && this.y > 0) {
            setTimeout(function () {
                self.emit("top");
            }, 10);
        }
        if (this._vertical && this.y < this.maxScrollY) {
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
    var point = e.touches ? e.touches[0] : e;
    this.moved = false;
    this.distX = 0;
    this.distY = 0;
    this.scroller.style[_transition.transitionDuration] = '0ms';
    if (this.isInTransition) {
        this.isInTransition = false;
        var matrix = window.getComputedStyle(this.scroller, null),
            x, y;
        matrix = matrix[_transform].split(')')[0] || "";
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
    this.scroller.style[_transform] = 'translate(' + x + 'px,' + y + 'px)';
    this.x = x;
    this.y = y;
};


exports.UIScroll = UIScroll;

