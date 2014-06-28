/**
 * Created by 赤菁风铃 on 14-3-1.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 * @note 额外的触摸事件，如果您需要非触摸设备上使用，请排除此文件
 * @note 包括如下事件
 *          0延时点击tap
 *          250延时点击singleTap
 *          500延时点击click（系统自带）
 *          750延时点击longTap
 *          双击事件doubleTap
 *          捏合和缩放事件pinch
 *          转角事件rotate
 *          滑动事件swipe（swipeLeft swipeRight swipeUp swipeDown）
 */

var touch = {},
    touchTimeout,
    longTapTimer,
    gesture = {},
    gestureStart = false;

function parentIfText(node) {
    return 'tagName' in node ? node : node.parentNode;
}

function swipeDirection(x1, x2, y1, y2) {
    var xDelta = Math.abs(x1 - x2), yDelta = Math.abs(y1 - y2);
    if (xDelta >= yDelta) {
        return (x1 - x2 > 0 ? 'Left' : 'Right');
    } else {
        return (y1 - y2 > 0 ? 'Up' : 'Down');
    }
}

var longTapDelay = 750;

function longTap() {
    if (touch.last && (Date.now() - touch.last >= longTapDelay)) {
        var event = document.createEvent("HTMLEvents");
        event.initEvent('longTap', true, true);
        touch.el.dispatchEvent(event);
        touch = {};
    }
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

function deg(x1, y1, x2, y2) {
    return Math.floor(Math.atan2(y2 - y1, x2 - x1) / Math.PI * 180);
}

document.addEventListener('touchstart', function (e) {
    if (!e.touches || e.touches.length === 0) {
        return;
    }
    if (!gestureStart && e.touches.length > 1) {
        gesture.fx1 = e.touches[0].pageX;
        gesture.fy1 = e.touches[0].pageY;
        gesture.f2 = gesture.f2 = 0;
        gesture.sx1 = e.touches[1].pageX;
        gesture.sy1 = e.touches[1].pageY;
        gesture.s2 = gesture.s2 = 0;
        gestureStart = true;
    }
    var now = Date.now(), delta = now - (touch.last || now);
    touch.el = parentIfText(e.touches[0].target);
    if (touchTimeout) {
        clearTimeout(touchTimeout);
    }
    touch.x1 = e.touches[0].pageX;
    touch.y1 = e.touches[0].pageY;
    touch.x2 = touch.y2 = 0;
    if (delta > 0 && delta <= 250) {
        touch.isDoubleTap = true;
    }
    touch.last = now;
    longTapTimer = setTimeout(longTap, longTapDelay);
}, true);

document.addEventListener('touchmove', function (e) {
    if (gestureStart && e.touches.length > 1) {
        var event;
        gesture.fx2 = e.touches[0].pageX;
        gesture.fy2 = e.touches[0].pageY;
        gesture.sx2 = e.touches[1].pageX;
        gesture.sy2 = e.touches[1].pageY;
        var sdis = distance(gesture.fx1, gesture.fy1, gesture.sx1, gesture.sy1);
        var edis = distance(gesture.fx2, gesture.fy2, gesture.sx2, gesture.sy2);
        var scale = sdis === edis / sdis;
        event = document.createEvent("HTMLEvents");
        event.initEvent('pinch', true, true);
        event.scale = scale;
        document.dispatchEvent(event);
        var ddeg = deg(gesture.fx2, gesture.fy2, gesture.sx2, gesture.sy2) - deg(gesture.fx1, gesture.fy1, gesture.sx1, gesture.sy1);
        event = document.createEvent("HTMLEvents");
        event.initEvent('rotate', true, true);
        event.rotation = ddeg;
        document.dispatchEvent(event);
    }
    touch.x2 = e.touches[0].pageX;
    touch.y2 = e.touches[0].pageY;
    if (longTapTimer) {
        clearTimeout(longTapTimer);
    }
}, true);

document.addEventListener('touchend', function (e) {
    var event;
    if (gestureStart && e.touches.length <= 1) {
        gestureStart = false;
        gesture = {};
    }
    if (longTapTimer) {
        clearTimeout(longTapTimer);
    }
    if (!touch.el) {
        touch = {};
        return;
    }
    if (touch.isDoubleTap) {
        event = document.createEvent("HTMLEvents");
        event.initEvent('doubleTap', true, true);
        touch.el.dispatchEvent(event);
        touch = {};
    } else if (touch.x2 > 0 || touch.y2 > 0) {
        if (Math.abs(touch.x1 - touch.x2) > 30 || Math.abs(touch.y1 - touch.y2) > 30) {

            event = document.createEvent("HTMLEvents");
            event.initEvent('swipe', true, true);
            touch.el.dispatchEvent(event);
            event = document.createEvent("HTMLEvents");
            event.initEvent('swipe' + swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2), true, true);
            touch.el.dispatchEvent(event);
        }
        touch.x1 = touch.x2 = touch.y1 = touch.y2 = touch.last = 0;
        touch = {};
    } else if ('last' in touch) {
        event = document.createEvent("HTMLEvents");
        event.initEvent('tap', true, true);
        touch.el.dispatchEvent(event);
        touchTimeout = setTimeout(function () {
            touchTimeout = null;
            if (touch.el) {
                var event = document.createEvent("HTMLEvents");
                event.initEvent('singleTap', true, true);
                touch.el.dispatchEvent(event);
            }
            touch = {};
        }, 250);
    }
}, true);
document.addEventListener('touchcancel', function () {
    touch = {};
    gestureStart = false;
    gesture = {};
    if (longTapTimer) {
        clearTimeout(longTapTimer);
    }
}, true);


