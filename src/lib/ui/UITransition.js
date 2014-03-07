/**
 * Created by 清月_荷雾 on 14-2-10.
 * author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * UI元素滚动类（用于为手机元素提供滚动支持）
 */
var rAF = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        },
    _elementStyle = document.createElement('div').style,
    _vendor = (function () {
        var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
            transform,
            i = 0,
            l = vendors.length;

        for (; i < l; i++) {
            transform = vendors[i] + 'ransform';
            if (transform in _elementStyle) {
                return vendors[i].substr(0, vendors[i].length - 1);
            }
        }

        return false;
    })(),
    _prefixStyle = function (style) {
        if (_vendor === false) {
            return false;
        }
        if (_vendor === '') {
            return style;
        }
        return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
    },
    _style = {
        transform: _prefixStyle('transform'),
        transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
        transitionDuration: _prefixStyle('transitionDuration'),
        transitionDelay: _prefixStyle('transitionDelay'),
        transformOrigin: _prefixStyle('transformOrigin')
    },
    _userAgent = window.navigator.userAgent,
    _native = ("-webkit-overflow-scrolling" in _elementStyle) && (_userAgent.match(/(iPad).*OS\s([\d_]+)/) || _userAgent.match(/(iPhone\sOS)\s([\d_]+)/)),
    _ease = {//所有支持的滚动动画
        quadratic: {
            style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            fn: function (k) {
                return k * ( 2 - k );
            }
        },
        circular: {
            style: 'cubic-bezier(0.1, 0.57, 0.1, 1)',	// Not properly "circular" but this looks better, it should be (0.075, 0.82, 0.165, 1)
            fn: function (k) {
                return Math.sqrt(1 - ( --k * k ));
            }
        },
        back: {
            style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            fn: function (k) {
                var b = 4;
                return ( k = k - 1 ) * k * ( ( b + 1 ) * k + b ) + 1;
            }
        },
        bounce: {
            style: '',
            fn: function (k) {
                if (( k /= 1 ) < ( 1 / 2.75 )) {
                    return 7.5625 * k * k;
                } else if (k < ( 2 / 2.75 )) {
                    return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
                } else if (k < ( 2.5 / 2.75 )) {
                    return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
                } else {
                    return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
                }
            }
        },
        elastic: {
            style: '',
            fn: function (k) {
                var f = 0.22,
                    e = 0.4;

                if (k === 0) {
                    return 0;
                }
                if (k === 1) {
                    return 1;
                }

                return ( e * Math.pow(2, -10 * k) * Math.sin(( k - f / 4 ) * ( 2 * Math.PI ) / f) + 1 );
            }
        }
    },//以上变量是滚动函数所需变量
    util = require("../util/util"),//引入工具类
    dom = require("../util/dom"),//DOM操作类
    UIObject = require('./UIObject').UIObject,//引入UIObject基类
    defaultOption = {//关于此参数请参照文件头部的note
        free: true,//是监视滚动（需要准确知道滚动的当前位置，滚动可能出现卡顿，适合分页控件）还是随意滚动（不触发任何滚动事件，滚动的效率会高很多，适合一般手机页面）
        scrolling: false,//是否触发scrolling事件，由于此事件的数量很大，会严重影响效率
        vertical: false,//是否水平滚动
        horizontal: true,//是否竖直滚动
        style: "",//会添加到wrapper上的样式（传递wrapper时，此参数无效）
        easing: "circular"//滚动的动画
    };


/**
 * UI元素滚动类
 * @param option 基础构造信息
 * @constructor
 */
function UITransition(option) {
    UIObject.call(this);
    var mopt = this.options = util.merge(util.clone(defaultOption), option);
    this._dom = this.wrapper = dom.createDom(
        util.formatString('<div class="%s" style="position: relative;">' +
            '    <div class="absolute" style="width: 100%;"></div>' +
            '</div>', mopt.style)
    );
    if (mopt.free && _native) {
        mopt.iosFree = true;
        this.wrapper.style.overflowY = mopt.horizontal ? "scroll" : "hidden";
        this.wrapper.style.overflowX = mopt.vertical ? "scroll" : "hidden";
        this.wrapper.style.webkitOverflowScrolling = "touch";
        return;
    }

    this._init();
}

util.inherits(UITransition, UIObject);

/**
 * 重写追加元素类
 */
UITransition.prototype.append = function () {
    var mopt = this.options;
    if (mopt.iosFree) {
        UIObject.prototype.append.apply(this, arguments);
    } else {
        this._dom = this.scroller;
        UIObject.prototype.append.apply(this, arguments);
        this.refresh();
    }
    this._dom = null;
};

/**
 * 重写删除元素类
 */
UITransition.prototype.remove = function () {
    var mopt = this.options;
    if (mopt.iosFree) {
        UIObject.prototype.remove.apply(this, arguments);
    } else {
        this._dom = this.scroller;
        UIObject.prototype.remove.apply(this, arguments);
        this.refresh();
        this._dom = this.wrapper;
    }
};

/**
 * 初始化滚动元素
 * @private
 */
UITransition.prototype._init = function () {
    this.scroller = this.wrapper.children[0];
    this.x = 0;
    this.y = 0;
    this.directionX = 0;
    this.directionY = 0;
    this.bind(this.wrapper, "touchstart", this._start);
    this.bind(window, "touchmove", this._move);
    this.bind(window, "touchend", this._end);
    this.bind(this.scroller, "transitionend", this._transitionEnd);
    this.bind(this.scroller, "webkitTransitionEnd", this._transitionEnd);
    this.bind(this.scroller, "oTransitionEnd", this._transitionEnd);
    this.bind(this.scroller, "MSTransitionEnd", this._transitionEnd);
    this.refresh();
};

/**
 * 刷新内部元素位置
 * @private
 */
UITransition.prototype._start = function () {
    var point = e.touches ? e.touches[0] : e,
        pos;

    this.initiated = utils.eventType[e.type];
    this.moved = false;
    this.distX = 0;
    this.distY = 0;
    this.directionX = 0;
    this.directionY = 0;
    this.directionLocked = 0;

    this._transitionTime();

    this.startTime = utils.getTime();

    if (this.options.useTransition && this.isInTransition) {
        this.isInTransition = false;
        pos = this.getComputedPosition();
        this._translate(Math.round(pos.x), Math.round(pos.y));
        this._execEvent('scrollEnd');
    } else if (!this.options.useTransition && this.isAnimating) {
        this.isAnimating = false;
        this._execEvent('scrollEnd');
    }

    this.startX = this.x;
    this.startY = this.y;
    this.absStartX = this.x;
    this.absStartY = this.y;
    this.pointX = point.pageX;
    this.pointY = point.pageY;

    this._execEvent('beforeScrollStart');
};

/**
 * 刷新内部元素位置
 * @private
 */
UITransition.prototype._move = function () {

};

/**
 * 刷新内部元素位置
 * @private
 */
UITransition.prototype._end = function () {

};

/**
 * 刷新内部元素位置
 * @private
 */
UITransition.prototype._transitionEnd = function () {

};

/**
 * 刷新内部元素位置
 * @private
 */
UITransition.prototype.refresh = function () {
    this.wrapperWidth = this.wrapper.clientWidth;
    this.wrapperHeight = this.wrapper.clientHeight;
    this.scrollerWidth = this.scroller.offsetWidth;
    this.scrollerHeight = this.scroller.offsetHeight;
    this.maxScrollX = this.wrapperWidth - this.scrollerWidth;
    this.maxScrollY = this.wrapperHeight - this.scrollerHeight;
    this.hasHorizontalScroll = this.options.horizontal && this.maxScrollX < 0;
    this.hasVerticalScroll = this.options.vertical && this.maxScrollY < 0;
    if (!this.hasHorizontalScroll) {
        this.maxScrollX = 0;
        this.scrollerWidth = this.wrapperWidth;
    }
    if (!this.hasVerticalScroll) {
        this.maxScrollY = 0;
        this.scrollerHeight = this.wrapperHeight;
    }
    this.endTime = 0;
    this.directionX = 0;
    this.directionY = 0;
    this.wrapperOffset = dom.offset(this.wrapper);
    this.resetPosition();

};

/**
 * 重置元素所在位置
 * @param [time] 动画的时间
 * @returns {boolean}
 */
UITransition.prototype.resetPosition = function (time) {
    var x = this.x,
        y = this.y;

    time = time || 0;

    if (!this.hasHorizontalScroll || this.x > 0) {
        x = 0;
    } else if (this.x < this.maxScrollX) {
        x = this.maxScrollX;
    }

    if (!this.hasVerticalScroll || this.y > 0) {
        y = 0;
    } else if (this.y < this.maxScrollY) {
        y = this.maxScrollY;
    }

    if (x === this.x && y === this.y) {
        return false;
    }

    this.scrollTo(x, y, time, this.options.easing);

    return true;
};

UITransition.prototype.scrollTo = function (x, y, time, easing) {
    easing = easing || _ease.circular;
    this.isInTransition = time > 0;
    if (!time && easing.style) {
        this._transitionTimingFunction(easing.style);
        this._transitionTime(time);
        this._translate(x, y);
    } else {
        this._animate(x, y, time, easing.fn);
    }
};

/**
 * 添加transitionTiming样式
 * @param easing 样式
 * @private
 */
UITransition.prototype._transitionTimingFunction = function (easing) {
    this.scroller.style[_style.transitionTimingFunction] = easing;
};

/**
 * 添加transitionTiming样式
 * @param time 时间
 * @private
 */
UITransition.prototype._transitionTime = function (time) {
    this.scroller.style[_style.transitionDuration] = (time || 0) + 'ms';
};

/**
 * 滚动元素
 * @param x 水平偏移量
 * @param y 竖直偏移量
 */
UITransition.prototype._translate = function (x, y) {
    this.scroller.style[_style.transform] = 'translate(' + x + 'px,' + y + 'px)';
    this.x = x;
    this.y = y;

};

UITransition.prototype._animate = function (destX, destY, duration, easingFn) {
    var that = this,
        startX = this.x,
        startY = this.y,
        startTime = util.getTime(),
        destTime = startTime + duration;

    function step() {
        var now = util.getTime(),
            newX, newY,
            easing;

        if (now >= destTime) {
            that.isAnimating = false;
            that._translate(destX, destY);

            if (!that.resetPosition(that.options.bounceTime)) {
                that._execEvent('scrollEnd');
            }

            return;
        }

        now = ( now - startTime ) / duration;
        easing = easingFn(now);
        newX = ( destX - startX ) * easing + startX;
        newY = ( destY - startY ) * easing + startY;
        that._translate(newX, newY);

        if (that.isAnimating) {
            rAF(step);
        }
    }

    this.isAnimating = true;
    step();
};

exports.UITransition = UITransition;

