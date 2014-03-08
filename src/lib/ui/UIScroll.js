/**
 * Created by 清月_荷雾 on 14-2-10.
 * author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * 一个内部元素可以自由移动的UIObject类
 */

var util = require("../util/util"),
    dom = require("../util/dom"),
    os = require("../util/os"),
    UIObject = require('./UIObject').UIObject,
    _transform = os.prefixStyle('transform'),
    _transition = {
        transitionTimingFunction: os.prefixStyle('transitionTimingFunction'),
        transitionDuration: os.prefixStyle('transitionDuration'),
        transitionDelay: os.prefixStyle('transitionDelay')
    };

/**
 * @constructor
 */
/**
 * 内部元素可以自由移动的UIObject类
 * @param [style] 添加在wrapper上的样式
 * @param [event] 是否触发滚动事件，为free时，将会忽略元素的准确位置
 * @param [type] 滚动类型
 * @param [move] 是否触发
 * move事件
 * @constructor
 */
function UIScroll(style, event, type, move) {
    UIObject.call(this);
    type = type || "vertical";
    this._horizontal = false;
    this._vertical = false;
    if (type === "horizontal" || type === "both") {
        this._horizontal = true;
    }
    if (type === "vertical" || type === "both") {
        this._vertical = true;
    }
    this._dom = this.wrapper = dom.createDom(util.formatString('<div class="%s" style="position: relative;"></div>', style || ""));
    this.freeScroll = !event && os.nativeTouchScroll;
    this.emitEvent = event;
    this.emitMove = event && move;
    if (this.freeScroll) {
        this.wrapper.style.overflowY = this._horizontal ? "scroll" : "hidden";
        this.wrapper.style.overflowX = this._vertical ? "scroll" : "hidden";
        this.wrapper.style.webkitOverflowScrolling = "touch";
        return;
    }
    this.scroller = dom.createDom('<div class="absolute" style="width: 100%;"></div>');
    this.wrapper.appendChild(this.scroller);
    this.x = 0;//水平滚动位置
    this.y = 0;//竖直滚动位置
    this._inited = false;
    var me = this;
    me.once("load", function () {
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

/**
 * 滚动到制定位置
 * @param x 开始位置
 * @param y 结束位置
 * @param time 时间
 */
UIScroll.prototype.scrollTo = function (x, y, time) {
    this.isInTransition = time > 0;
    time = time || 0;
    this.scroller.style[_transition.transitionDuration] = (time || 0) + 'ms';
    this._translate(x, y);
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
    this._horizontal = this._horizontal && this.maxScrollX < 0;
    this._vertical = this._vertical && this.maxScrollY < 0;
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
    if (!this._horizontal || this.x > 0) {
        x = 0;
    } else if (this.x < this.maxScrollX) {
        x = this.maxScrollX;
    }
    if (!this._vertical || this.y > 0) {
        y = 0;
    } else if (this.y < this.maxScrollY) {
        y = this.maxScrollY;
    }
    if (x === this.x && y === this.y) {
        return false;
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
        var matrix = window.getComputedStyle(dom, null),
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
    this.emit("start", {x: this.x, y: this.y});
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
