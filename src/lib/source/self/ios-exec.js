define("cordova/exec", function (require, exports, module) {
    var cordova = require('cordova'),//引入cordova类
        bridge = require("hybrid/plugin/cordova-base"),//引入原生桥类
        jsToNativeModes = {
            IFRAME_NAV: 0,
            XHR_NO_PAYLOAD: 1,
            XHR_WITH_PAYLOAD: 2,
            XHR_OPTIONAL_PAYLOAD: 3,
            IFRAME_HASH_NO_PAYLOAD: 4,
            IFRAME_HASH_WITH_PAYLOAD: 5
        },
        bridgeMode,
        execIframe,
        execHashIframe,
        hashToggle = 1,
        execXhr,
        requestCount = 0,
        vcHeaderValue = null,
        commandQueue = [],
        isInContextOfEvalJs = 0;

    function createExecIframe() {
        var iframe = document.createElement("iframe");
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        return iframe;
    }

    function createHashIframe() {
        var ret = createExecIframe();
        ret.contentWindow.history.replaceState(null, null, 'file:///#');
        return ret;
    }

    function shouldBundleCommandJson() {
        if (bridgeMode === jsToNativeModes.XHR_WITH_PAYLOAD) {
            return true;
        }
        if (bridgeMode === jsToNativeModes.XHR_OPTIONAL_PAYLOAD) {
            var payloadLength = 0;
            for (var i = 0; i < commandQueue.length; ++i) {
                payloadLength += commandQueue[i].length;
            }
            return payloadLength < 4500;
        }
        return false;
    }

    function massageArgsJsToNative(args) {
        if (!args || Object.prototype.toString.call(args).slice(8, -1) !== 'Array') {
            return args;
        }
        var ret = [];
        args.forEach(function (arg) {
            if (Object.prototype.toString.call(args).slice(8, -1) === 'ArrayBuffer') {
                ret.push({
                    'CDVType': 'ArrayBuffer',
                    'data': btoa(String.fromCharCode.apply(null, arg))
                });
            } else {
                ret.push(arg);
            }
        });
        return ret;
    }

    function massageMessageNativeToJs(message) {
        if (message.CDVType == 'ArrayBuffer') {
            var stringToArrayBuffer = function (str) {
                var ret = new Uint8Array(str.length);
                for (var i = 0; i < str.length; i++) {
                    ret[i] = str.charCodeAt(i);
                }
                return ret.buffer;
            };
            var base64ToArrayBuffer = function (b64) {
                return stringToArrayBuffer(atob(b64));
            };
            message = base64ToArrayBuffer(message.data);
        }
        return message;
    }

    function convertMessageToArgsNativeToJs(message) {
        var args = [];
        if (!message || !message.hasOwnProperty('CDVType')) {
            args.push(message);
        } else if (message.CDVType == 'MultiPart') {
            message.messages.forEach(function (e) {
                args.push(massageMessageNativeToJs(e));
            });
        } else {
            args.push(massageMessageNativeToJs(message));
        }
        return args;
    }

    function iOSExec() {
        if (bridgeMode === undefined) {
            bridgeMode = navigator.userAgent.indexOf(' 5_') == -1 ? jsToNativeModes.IFRAME_NAV : jsToNativeModes.XHR_NO_PAYLOAD;
        }

        var successCallback, failCallback, service, action, actionArgs, splitCommand;
        var callbackId = null;
        if (typeof arguments[0] !== "string") {
            successCallback = arguments[0];
            failCallback = arguments[1];
            service = arguments[2];
            action = arguments[3];
            actionArgs = arguments[4];
            callbackId = 'INVALID';
        } else {
            try {
                splitCommand = arguments[0].split(".");
                action = splitCommand.pop();
                service = splitCommand.join(".");
                actionArgs = Array.prototype.splice.call(arguments, 1);

                console.log('The old format of this exec call has been removed (deprecated since 2.1). Change to: ' +
                    "cordova.exec(null, null, \"" + service + "\", \"" + action + "\"," + JSON.stringify(actionArgs) + ");"
                );
                return;
            } catch (e) {
            }
        }

        actionArgs = actionArgs || [];

        if (successCallback || failCallback) {
            callbackId = service + cordova.callbackId++;
            cordova.callbacks[callbackId] =
            {success: successCallback, fail: failCallback};
        }

        actionArgs = massageArgsJsToNative(actionArgs);

        var command = [callbackId, service, action, actionArgs];

        commandQueue.push(JSON.stringify(command));

        if (!isInContextOfEvalJs && commandQueue.length == 1) {
            switch (bridgeMode) {
                case jsToNativeModes.XHR_NO_PAYLOAD:
                case jsToNativeModes.XHR_WITH_PAYLOAD:
                case jsToNativeModes.XHR_OPTIONAL_PAYLOAD:
                    if (execXhr && execXhr.readyState != 4) {
                        execXhr = null;
                    }
                    // Re-using the XHR improves exec() performance by about 10%.
                    execXhr = execXhr || new XMLHttpRequest();
                    execXhr.open('HEAD', "/!gap_exec?" + (+new Date()), true);
                    if (!vcHeaderValue) {
                        vcHeaderValue = /.*\((.*)\)/.exec(navigator.userAgent)[1];
                    }
                    execXhr.setRequestHeader('vc', vcHeaderValue);
                    execXhr.setRequestHeader('rc', ++requestCount);
                    if (shouldBundleCommandJson()) {
                        execXhr.setRequestHeader('cmds', iOSExec.nativeFetchMessages());
                    }
                    execXhr.send(null);
                    break;
                case jsToNativeModes.IFRAME_HASH_NO_PAYLOAD:
                case jsToNativeModes.IFRAME_HASH_WITH_PAYLOAD:
                    execHashIframe = execHashIframe || createHashIframe();
                    if (!execHashIframe.contentWindow) {
                        execHashIframe = createHashIframe();
                    }
                    hashToggle = hashToggle ^ 3;
                    var hashValue = '%0' + hashToggle;
                    if (bridgeMode === jsToNativeModes.IFRAME_HASH_WITH_PAYLOAD) {
                        hashValue += iOSExec.nativeFetchMessages();
                    }
                    execHashIframe.contentWindow.location.hash = hashValue;
                    break;
                default:
                    execIframe = execIframe || createExecIframe();
                    if (!execIframe.contentWindow) {
                        execIframe = createExecIframe();
                    }
                    execIframe.src = "gap://ready";
            }
        }
    }

    iOSExec.jsToNativeModes = jsToNativeModes;

    iOSExec.setJsToNativeBridgeMode = function (mode) {
        if (execIframe) {
            execIframe.parentNode.removeChild(execIframe);
            execIframe = null;
        }
        bridgeMode = mode;
    };

    iOSExec.nativeFetchMessages = function () {
        if (!commandQueue.length) {
            return '';
        }
        var json = '[' + commandQueue.join(',') + ']';
        commandQueue.length = 0;
        return json;
    };

    iOSExec.nativeCallback = function (callbackId, status, message, keepCallback) {
        return iOSExec.nativeEvalAndFetch(function () {
            var success = status === 0 || status === 1;
            var args = convertMessageToArgsNativeToJs(message);
            cordova.callbackFromNative(callbackId, success, status, args, keepCallback);
        });
    };

    iOSExec.nativeEvalAndFetch = function (func) {
        isInContextOfEvalJs++;
        try {
            func();
            return iOSExec.nativeFetchMessages();
        } finally {
            isInContextOfEvalJs--;
        }
    };
    module.exports = iOSExec;
    bridge.registerNative(iOSExec);
});
