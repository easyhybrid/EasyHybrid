/**
 * Created by 赤菁风铃 on 14-3-1.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 * @note 部分在web无法使用的插件的代理函数
 */

var plugin = require("./../plugin/plugin");
var register = plugin.register;
var util = require("../util/util");
var data =  require("../util/data");
var os = require("../util/os");

plugin.platform = "web";
/**
 * 返回设备信息
 */
register("Device", {
    getDeviceInfo: function (success) {
        var uuid = data.load("uuid");
        if (!uuid) {
            uuid = util.uuid();
            data.save("uuid", uuid);
        }
        success({
            uuid: uuid,
            platform: "web",
            version: "",
            cordova: "3.0.0",
            model: "model"
        });
    }
});

/**
 * 获取网络信息
 */
register("NetworkStatus", {
    getConnectionInfo: function (success) {
        success("wifi");
    }
});

/**
 * 提示信息框
 */
register("Notification", {
    alert: function (success, fail, args) {
        setTimeout(function () {
            window.alert(args[0]);
            success();
        }, 0);
    },
    confirm: function (success, fail, args) {
        setTimeout(function () {
            if (window.confirm(args[0])) {
                success(0);
            } else {
                success(1);
            }
        }, 0);
    },
    prompt: function (success, fail, args) {
        setTimeout(function () {
            var value = window.prompt(args[0], args[3]);
            if (value === null) {
                success(1, value);
            } else {
                success(0, value);
            }
        }, 0);
    },
    beep: function () {

    }
});

/**
 * 浏览器信息
 */
register("InAppBrowser", {
    open: function (success, fail, args) {
        window.open(args[0], "_blank");
        success("loadstart");
    },
    close: function () {
    },
    shop: function () {
    },
    injectScriptFile: function () {
    },
    injectScriptCode: function () {
    },
    injectStyleCode: function () {
    },
    injectStyleFile: function () {
    }
});

/**
 * 浏览器信息
 */
register("Action", {
    open: function (success, fail, args) {
        window.open(args[0], "_blank");
        success();
    },
    video: function (success, fail, args) {
        window.open(args[0], "_blank");
        success();
    },
    exist: function (success) {
        success(0);
    }
});

/**
 * 地理定位信息（在PC上会屏蔽此接口）
 */
register("Geolocation", {
    getLocation: function (success, fail, args) {
        if (os.fullscreen || os.ipad) {
                navigator.geolocation.getCurrentPosition(function (result) {
                var pos = result.coords;
                pos.timestamp = result.timestamp;
                if (success) {
                    success(pos);
                }
            },fail, {
                enableHighAccuracy: args[0],
                maximumAge: args[1]
            });
        } else {
            fail(2, "设备不支持GPS定位");
        }
    }
});

/**
 * 注册splash功能
 */
register("SplashScreen", {
    show: function () {
    },
    hide: function () {

    }
});

//修复部分浏览器不支持触摸事件的问题，并且为使用鼠标的设备添加触摸事件
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
            while (elem) {
                if (elem.hasAttribute("on" + type)) {
                    /*jshint evil:true */
                    eval(elem.getAttribute("on" + type));
                    /*jshint evil:false */
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