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
    protocol = {},//自定义特殊的协议，以简化书写
    xhrSuccessStatus = {
        0: 200,
        1223: 204
    },
    protocolPattern = /^([a-z0-9.+-]+:)/i;


/**
 * 发起一个ajax请求
 * @param options 配置参数
 */
function ajax(options) {
    var ajax_options = reformat_option(options);//根据快捷方式对options进行初步配置
    ajax_options.type = (options.type || "GET").toUpperCase();
    var type = ajax_options.requestType = options.requestType || "xhr";
    var data = ajax_options.data = options.data || {};
    var url = ajax_options.url;
    url = url_tool.parseUrl(url);
    if (url.search) {
        delete  url.search;
    }
    url.query = url.query || {};
    if (url.hash) {
        delete  url.hash;
    }
    if (type === "xhr") {
        ajax_options.async = options.async || true;
        ajax_options.username = options.username || null;
        ajax_options.password = options.password || null;
        ajax_options.headers = options.headers || {};
        ajax_options.timeout = options.timeout || 0;
        ajax_options.responseType = options.responseType || "text";
    } else if (type === "script") {
        ajax_options.async = true;
    } else if (type === "jsonp") {
        ajax_options.async = true;
        var uuid = "callback" + util.uuid().replace("-", "");
        var cbf = options.callback || "callback";
        url.query[cbf] = uuid;
        ajax_options.callback = uuid;
    } else {
        throw  new Error("未知的请求类型");
    }
    if (ajax_options.type === "GET") {
        util.merge(url.query, data);
        ajax_options.data = null;
    }
    if (proxy) {
        ajax_options.url = "http://" + proxy.server + ":" + proxy.port + "/";
        ajax_options.headers["X-Forwarded-For"] = url.format();
    } else {
        ajax_options.url = url.format();
    }
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
        success(content, (headers || "").split(/\r?\n/g));
    }

    switch (ajax_options.requestType) {
        case "script":
            script_request(ajax_options, ajax_complate);
            break;
        case "jsonp":
            script_request(ajax_options, ajax_complate);
            break;
        case "xhr":
            xhr_request(ajax_options, ajax_complate);
            break;
        default :
            break;
    }
}

exports.ajax = ajax;

/**
 * 通过get请求获取数据
 * @param url {string} 要请求的URL
 * @param [data] {{}} 请求的数据
 * @param [success] 成功回调
 * @param [error] 失败回调
 */
exports.get = function (url, data, success, error) {
    if (typeof data === "function") {
        error = success;
        success = data;
        data = null;
    }
    ajax({
        url: url,
        data: data,
        success: success,
        error: error,
        requestType: "xhr",
        responseType: "text",
        type: "GET"
    });
};

/**
 * 通过POST方式获取数据
 * @param url {string} 要请求的URL
 * @param [data] {{}} 请求的数据（请注意此方式可以添加FormData类型数据）
 * @param [success] 成功回调
 * @param [error] 失败回调
 */
exports.post = function (url, data, success, error) {
    ajax({
        url: url,
        data: data,
        success: success,
        error: error,
        requestType: "xhr",
        responseType: "text",
        type: "POST"
    });
};

/**
 * 获取文件
 * @param url {string} 要请求的URL
 * @param [data] {{}} 请求的数据
 * @param [success] 成功回调
 * @param [error] 失败回调
 */
exports.getFile = function (url, data, success, error) {
    ajax({
        url: url,
        data: data,
        success: success,
        error: error,
        requestType: "blob",
        responseType: "array",
        type: "GET"
    });
};

/**
 * 通过jsomp方式获取数据
 * @param url
 * @param data
 * @param success
 * @param error
 */
exports.jsonp = function (url, data, success, error) {
    ajax({
        url: url,
        data: data,
        success: success,
        error: error,
        requestType: "jsonp",
        responseType: "array",
        type: "GET"
    });
};

/**
 * 对option进行处理，并返回适当的访问连接和host
 * @param option 要处理的url
 */
function reformat_option(option) {
    option = option || {};
    var roption = null;
    var url = option.url;
    var rest = url.trim();
    var flag = false;
    var proto = protocolPattern.exec(rest);
    if (proto) {
        proto = proto[0].toLowerCase();
        rest = rest.substr(proto.length);
    } else {
        if (!rest) {
            url = host + "/";
        }
        else if (rest[0] === "/") {
            url = host + rest;
        } else {
            url = host + "/" + rest;
        }
    }
    var slashes = rest.substr(0, 2) === '//';
    if (slashes) {
        rest = rest.substr(2);
    }
    for (var x in protocol) {
        if (protocol.hasOwnProperty(x) && x === proto) {
            flag = true;
            var result = "";
            var target = protocol[x];
            if (target[target.length - 1] === "/") {
                result += target.url.slice(0, -1);
            } else {
                result += target.url;
            }
            result += "/";
            if (rest[0] === "/") {
                result += rest.slice(1);
            } else {
                result += rest;
            }
            url = result;
            roption = util.merge({}, target, true);
        }
    }
    if (!flag) {
        url = url.trim();
        roption = {};
    }
    roption.url = url;
    return roption;
}


/**
 * xhr请求
 * @param options
 * @param complete
 */
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
            xhrSuccessStatus[ xhr.status ] || xhr.status,
            xhr.statusText,
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

/**
 * jsonp请求
 * @param options
 * @param complete
 */
function script_request(options, complete) {
    var script = document.createElement("script");
    script.src = options.url;
    script.async = options.async;
    script.charset = "utf-8";
    var cb = options.callback;
    if (cb) {
        script.onload = function () {
            document.head.removeChild(script);
            if (cb in window) {
                delete window[cb];
                complete("error", 500, "错误的jsonp格式");
            }
        };
        window[cb] = function (data) {
            delete window[cb];
            complete("success", 200, "成功", data, null);
        };
    } else {
        script.onload = function () {
            document.head.removeChild(script);
            complete("success", 200, "成功", null, null);
        };
    }
    script.onerror = function (evt) {
        document.head.removeChild(script);
        complete("error", evt.type === "error" ? 404 : 200, evt.type);
    };
    document.head.appendChild(script);
}

/**
 * 添加代理服务器
 * @param url
 */
ajax.setProxy = function (url) {
    proxy = url;
};

/**
 * 添加主域名
 * @param h
 */
ajax.setHost = function (h) {
    if (h[h.length] === "/") {
        host = h.slice(1);
    } else {
        host = h;
    }
};

/**
 * 添加特殊的协议
 * @note 如定义baidu = http://www.baidu.com，则baidu://a/b为会替换为http://www.baidu.com/a/b
 * @param type {string|*} 类型
 * @param [target]
 */
ajax.setProtocol = function (type, target) {
    type = typeof type !== 'string' ? type : {type: target};
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
};