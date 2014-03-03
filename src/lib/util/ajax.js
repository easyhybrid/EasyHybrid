/**
 * Created by 清月_荷雾 on 14-3-3.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 * @note ajax、iframe、jsonp等请求相关函数
 */

var proxy = null,//代理服务器
    host = null,//主域名
    util = require("./util"),
    url_tool = require("./url"),
    protocol = {};//自定义特殊的协议，以简化书写


/**
 * 添加代理服务器
 * @param url
 */
function setProxy(url) {
    proxy = url;
}
exports.setProxy = setProxy;

/**
 * 添加主域名
 * @param h
 */
function setHost(h) {
    if (h[h.length] === "/") {
        host = h.slice(1);
    } else {
        host = h;
    }
}
exports.setHost = setHost;


/**
 * 添加特殊的协议
 * @note 如定义baidu = http://www.baidu.com，则baidu://a/b为会替换为http://www.baidu.com/a/b
 * @param type {string|*} 类型
 * @param [target]
 */
exports.setProtocol = function (type, target) {
    if (typeof  type !== "string") {
        for (var x in type) {
            if (type.hasOwnProperty(x)) {
                if (x.indexOf(":") < 0) {
                    protocol[x.toLowerCase() + ":"] = target;
                }
                else {
                    protocol[x.toLowerCase()] = target;
                }
            }
        }
    }
    else {
        if (type.indexOf(":") < 0) {
            protocol[type.toLowerCase() + ":"] = target;
        }
        else {
            protocol[type.toLowerCase()] = target;
        }
    }
};


/**
 * 发起一个ajax请求
 * @param options 配置参数
 */
function ajax(options) {
    options = options || {};
    var url = reformat_url(options.url);
    if (!url) {
        throw  new Error("Url不能为空");
    }
    url = url_tool.parseUrl(url);
    var target_host = url.host;
    var target_url = url.href;
    if (url.hash) {
        delete  url.hash;
    }
    if (proxy) {
        url.host = proxy.server + ":" + proxy.port;
        target_url = url.format();
    } else {
        target_url = url.format();
    }
    var ajax_options = {};
    ajax_options.type = options.type || "";
    ajax_options.url = target_url;
    ajax_options.async = options.async || true;
    ajax_options.username = options.username || null;
    ajax_options.password = options.password || null;
    ajax_options.headers = options.headers || {};
    ajax_options.headers.host = target_host;
    ajax_options.timeout = options.timeout || 0;
    ajax_options.responseType = options.responseType || "text";

    var error = options.error || function (code, msg) {
        console.log(code + "：" + msg);
    };
    var success = options.success || function () {
    };

    function ajax_complate(type, code, message, content, headers) {
        if (type === "error" || code !== 200) {
            error(code, message);
            return;
        }
        success(content, headers.split(/\r?\n/g));
    }

    switch (options.requestType) {
        case "jsonp":
            break;
        case "scripts":
            break;
        case "xhr":
            xhr_request(ajax_options, ajax_complate);
            break;
        default :
            xhr_request(ajax_options, ajax_complate);
    }
}
exports.ajax = ajax;

var protocolPattern = /^([a-z0-9.+-]+:)/i;


/**
 * 对url进行处理，并返回适当的访问连接和host
 * @param url 要处理的url
 */
function reformat_url(url) {
    var rest = url.trim();
    var proto = protocolPattern.exec(rest);
    if (proto) {
        proto = proto[0].toLowerCase();
        rest = rest.substr(proto.length);
    } else {
        if (!rest) {
            return host + "/";
        }
        else if (rest[0] === "/") {
            return host + rest;
        } else {
            return host + "/" + rest;
        }
    }
    var slashes = rest.substr(0, 2) === '//';
    if (slashes) {
        rest = rest.substr(2);
    }
    for (var x in protocol) {
        if (protocol.hasOwnProperty(x) && x === proto) {
            var result = "";
            var target = protocol[x];
            if (target[target.length - 1] === "/") {
                result += target.slice(0, -1);
            } else {
                result += target;
            }
            result += "/";
            if (rest[0] === "/") {
                result += rest.slice(1);
            } else {
                result += rest;
            }
            return result;
        }
    }
    return url.trim();
}

//以下代码为处理xhr请求
var xhrSuccessStatus = {
    0: 200,
    1223: 204
};

function xhr_request(options, complete) {
    var xhr = null;
    var headers = options.headers;
    try {
        xhr = new XMLHttpRequest();
        if (xhr.overrideMimeType) {
            xhr.overrideMimeType("text/xml");
        }
    } catch (e) {
        complete("error", "404", "无法创建XMLHttpRequest对象！");
    }
    xhr.open(options.type, options.url, options.async, options.username, options.password);
    if (!headers["X-Requested-With"]) {
        headers["X-Requested-With"] = "XMLHttpRequest";
    }
    for (var i in headers) {
        if (headers.hasOwnProperty(i)) {
            xhr.setRequestHeader(i, headers[ i ]);
        }
    }
    xhr.onload = function () {
        complete(
            "success",
            xhr.statusText,
            xhrSuccessStatus[ xhr.status ] || xhr.status,
            options.responseType === "text" ? xhr.responseText : xhr.response,
            xhr.getAllResponseHeaders()
        );
    };
    if (options.timeout) {
        xhr.timeout = options.timeout;
        xhr.ontimeout = function () {
            complete("error", xhr.status || 404, "请求时间过长！");
        };
    }
    xhr.onerror = function () {
        complete("error", xhr.status || 404, xhr.statusText);
    };
    try {
        xhr.send(options.data || null);
    } catch (e) {
        complete("error", xhr.status || 404, xhr.statusText);
    }
}