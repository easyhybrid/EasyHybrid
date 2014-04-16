/**
 * Created by 赤菁风铃 on 14-3-1.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 * @note 修复部分触屏设备不支持触摸事件的问题，并且为使用鼠标的设备添加触摸事件
 */

if (!('ontouchstart' in window)) {
    var cancelClickMove = false;
    var preventAll = function (e) {
        e.preventDefault();
        e.stopPropagation();
    };
    var redirectMouseToTouch = function (type, originalEvent, newTarget) {
        var theTarget = newTarget ? newTarget : originalEvent.target;
        if (theTarget.tagName.toUpperCase().indexOf("SELECT") === -1 && theTarget.tagName.toUpperCase().indexOf("TEXTAREA") === -1 && theTarget.tagName.toUpperCase().indexOf("INPUT") === -1)  //SELECT, TEXTAREA & INPUT
        {
            preventAll(originalEvent);
        }
        var touchevt = document.createEvent("MouseEvent");
        touchevt.initEvent(type, true, true);
        touchevt.initMouseEvent(type, true, true, window, originalEvent.detail, originalEvent.screenX, originalEvent.screenY, originalEvent.clientX, originalEvent.clientY, originalEvent.ctrlKey, originalEvent.shiftKey, originalEvent.altKey, originalEvent.metaKey, originalEvent.button, originalEvent.relatedTarget);
        if (type !== 'touchend') {
            touchevt.touches = [];
            touchevt.touches[0] = {};
            touchevt.touches[0].pageX = originalEvent.pageX;
            touchevt.touches[0].pageY = originalEvent.pageY;
            touchevt.touches[0].target = theTarget;
        }
        touchevt.mouseToTouch = true;
        if (navigator.userAgent.match(/MSIE 10.0/i)) {
            var elem = originalEvent.target;
            while (elem != null) {
                if (elem.hasAttribute("on" + type)) {
                    eval(elem.getAttribute("on" + type));
                }
                elem = elem.parentElement;
            }
        }
        theTarget.dispatchEvent(touchevt);
    };
    var mouseDown = false, lastTarget = null, firstMove = false;
    if (!window.navigator.msPointerEnabled) {
        document.addEventListener("mousedown", function (e) {
            mouseDown = true;
            lastTarget = e.target;
            redirectMouseToTouch("touchstart", e);
            firstMove = true;
            cancelClickMove = false;
        }, true);
        document.addEventListener("mouseup", function (e) {
            if (!mouseDown) {
                return;
            }
            redirectMouseToTouch("touchend", e, lastTarget);	//bind it to initial mousedown target
            lastTarget = null;
            mouseDown = false;
        }, true);
        document.addEventListener("mousemove", function (e) {
            if (!mouseDown) {
                return;
            }
            if (firstMove) {
                firstMove = false;
                return;
            }
            redirectMouseToTouch("touchmove", e, lastTarget);
            e.preventDefault();
            cancelClickMove = true;
        }, true);
    } else {
        document.addEventListener("MSPointerDown", function (e) {
            mouseDown = true;
            lastTarget = e.target;
            redirectMouseToTouch("touchstart", e);
            firstMove = true;
            cancelClickMove = false;
        }, true);
        document.addEventListener("MSPointerUp", function (e) {
            if (!mouseDown) {
                return;
            }
            redirectMouseToTouch("touchend", e, lastTarget);
            lastTarget = null;
            mouseDown = false;
        }, true);
        document.addEventListener("MSPointerMove", function (e) {
            if (!mouseDown) {
                return;
            }
            if (firstMove) {
                firstMove = false;
                return;
            }
            redirectMouseToTouch("touchmove", e, lastTarget);
            e.preventDefault();
            cancelClickMove = true;
        }, true);
    }
    document.addEventListener("drag", preventAll, true);
    document.addEventListener("dragstart", preventAll, true);
    document.addEventListener("dragenter", preventAll, true);
    document.addEventListener("dragover", preventAll, true);
    document.addEventListener("dragleave", preventAll, true);
    document.addEventListener("dragend", preventAll, true);
    document.addEventListener("drop", preventAll, true);
    document.addEventListener("selectstart", preventAll, true);
    document.addEventListener("click", function (e) {
        if (!e.mouseToTouch && e.target === lastTarget) {
            preventAll(e);
        }
        if (cancelClickMove) {
            preventAll(e);
            cancelClickMove = false;
        }
    }, true);
    window.addEventListener("resize", function () {
        var touchevt = document.createEvent("Event");
        touchevt.initEvent("orientationchange", true, true);
        document.dispatchEvent(touchevt);
    }, false);
}
