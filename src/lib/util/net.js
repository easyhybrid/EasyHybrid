/**
 * Created by 清月_荷雾 on 14-3-3.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 * @note 网络相关操作
 */

//region 工具函数
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],
    unwise = ['{', '}', '|', '\\', '^', '~', '`'].concat(delims),
    autoEscape = ['\''].concat(delims),
    nonHostChars = ['%', '/', '?', ';', '#'].concat(unwise).concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([a-z0-9A-Z_-]{0,63})(.*)$/,
    slashedProtocol = {
        'http': true,
        'https': true,
        'ftp': true,
        'gopher': true,
        'file': true,
        'http:': true,
        'https:': true,
        'ftp:': true,
        'gopher:': true,
        'file:': true
    };

/**
 * 将对象转化成queryString
 * @param obj 要转化的对象
 * @param [sep] 连接符
 * @param [eq] 相等符号
 * @param [name] 符号的名字，如果obj不是Object类型，那么表示对一个字段进行组合
 * @returns {string}
 */
function encode(obj, sep, eq, name) {
    sep = sep || '&';
    eq = eq || '=';
    if (obj === null) {
        obj = undefined;
    }

    if (typeof obj === 'object') {
        return Object.keys(obj).map(function (k) {
            var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
            if (Array.isArray(obj[k])) {
                return obj[k].map(function (v) {
                    return ks + encodeURIComponent(stringifyPrimitive(v));
                }).join(sep);
            } else {
                return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
            }
        }).join(sep);

    }
    if (!name) {
        return '';
    }
    return encodeURIComponent(stringifyPrimitive(name)) + eq + encodeURIComponent(stringifyPrimitive(obj));
}
exports.encodeQueryString = encode;

/**
 * 将queryString转化成对象
 * @param qs qs字符串
 * @param [sep] 连接符
 * @param [eq] 相等符号
 * @returns {{}}
 */
function decode(qs, sep, eq) {
    sep = sep || '&';
    eq = eq || '=';
    var obj = {};

    if (typeof qs !== 'string' || qs.length === 0) {
        return obj;
    }

    var regexp = /\+/g;
    qs = qs.split(sep);

    var len = qs.length;

    for (var i = 0; i < len; ++i) {
        var x = qs[i].replace(regexp, '%20'),
            idx = x.indexOf(eq),
            kstr, vstr, k, v;

        if (idx >= 0) {
            kstr = x.substr(0, idx);
            vstr = x.substr(idx + 1);
        } else {
            kstr = x;
            vstr = '';
        }
        k = decodeURIComponent(kstr);
        v = decodeURIComponent(vstr);
        if (!Object.prototype.hasOwnProperty.call(obj, k)) {
            obj[k] = v;
        } else if (Array.isArray(obj[k])) {
            obj[k].push(v);
        } else {
            obj[k] = [obj[k], v];
        }
    }
    return obj;
}

exports.decodeQueryString = encode;

function stringifyPrimitive(v) {
    switch (typeof v) {
        case 'string':
            return v;

        case 'boolean':
            return v ? 'true' : 'false';

        case 'number':
            return isFinite(v) ? v : '';

        default:
            return '';
    }
}

/**
 * 将url转换成对象
 * @param url
 * @returns {parse}
 */
function parse(url) {
    if (typeof url !== 'string') {
        throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
    }

    var rest = url.trim(),
        proto = protocolPattern.exec(rest),
        i = 0,
        result = {};
    if (proto) {
        proto = proto[0];
        result.protocol = proto.toLowerCase();
        rest = rest.substr(proto.length);
    }
    var slashes = rest.substr(0, 2) === '//';

    if (slashes) {
        rest = rest.substr(2);
        result.slashes = true;
    }

    if (slashes || (proto && !slashedProtocol[proto])) {
        var hostEnd = -1;
        for (i = 0; i < hostEndingChars.length; i++) {
            var hec1 = rest.indexOf(hostEndingChars[i]);
            if (1 !== -1 && (hostEnd === -1 || hec1 < hostEnd)) {
                hostEnd = hec1;
            }
        }
        var auth, atSign;
        if (hostEnd === -1) {
            atSign = rest.lastIndexOf('@');
        } else {
            atSign = rest.lastIndexOf('@', hostEnd);
        }

        if (atSign !== -1) {
            auth = rest.slice(0, atSign);
            rest = rest.slice(atSign + 1);
            this.auth = decodeURIComponent(auth);
        }

        hostEnd = -1;
        for (i = 0; i < nonHostChars.length; i++) {
            var hec = rest.indexOf(nonHostChars[i]);
            if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
                hostEnd = hec;
            }
        }
        if (hostEnd === -1) {
            hostEnd = rest.length;
        }
        result.host = rest.slice(0, hostEnd);
        rest = rest.slice(hostEnd);

        var host = result.host;
        var port = portPattern.exec(host);
        if (port) {
            port = port[0];
            if (port !== ':') {
                result.port = port.substr(1);
            }
            host = host.substr(0, host.length - port.length);
        }
        if (host) {
            result.hostname = host;
        }

        result.hostname = result.hostname || '';

        var ipv6Hostname = result.hostname[0] === '[' && result.hostname[result.hostname.length - 1] === ']';

        if (!ipv6Hostname) {
            var hostparts = result.hostname.split(/\./);
            for (i = 0; i < hostparts.length; i++) {
                var part = hostparts[i];
                if (!part) {
                    continue;
                }
                if (!part.match(hostnamePartPattern)) {
                    var newpart = '';
                    for (var j = 0, k = part.length; j < k; j++) {
                        if (part.charCodeAt(j) > 127) {
                            newpart += 'x';
                        } else {
                            newpart += part[j];
                        }
                    }
                    if (!newpart.match(hostnamePartPattern)) {
                        var validParts = hostparts.slice(0, i);
                        var notHost = hostparts.slice(i + 1);
                        var bit = part.match(hostnamePartStart);
                        if (bit) {
                            validParts.push(bit[1]);
                            notHost.unshift(bit[2]);
                        }
                        if (notHost.length) {
                            rest = '/' + notHost.join('.') + rest;
                        }
                        result.hostname = validParts.join('.');
                        break;
                    }
                }
            }
        }
        if (result.hostname.length > hostnameMaxLen) {
            result.hostname = '';
        } else {
            result.hostname = result.hostname.toLowerCase();
        }
        if (!ipv6Hostname) {
            var domainArray = result.hostname.split('.');
            var newOut = [];
            for (i = 0; i < domainArray.length; ++i) {
                newOut.push(domainArray[i]);
            }
            result.hostname = newOut.join('.');
        }

        var p = result.port ? ':' + result.port : '';
        var h = result.hostname || '';
        result.host = h + p;
        result.href += result.host;

        if (ipv6Hostname) {
            result.hostname = result.hostname.substr(1, result.hostname.length - 2);
            if (rest[0] !== '/') {
                rest = '/' + rest;
            }
        }
    }
    for (i = 0; i < autoEscape.length; i++) {
        var ae = autoEscape[i];
        var esc = encodeURIComponent(ae);
        if (esc === ae) {
            esc = escape(ae);
        }
        rest = rest.split(ae).join(esc);
    }
    var hash = rest.indexOf('#');
    if (hash !== -1) {
        result.hash = rest.substr(hash);
        rest = rest.slice(0, hash);
    }
    var qm = rest.indexOf('?');
    if (qm !== -1) {
        result.search = rest.substr(qm);
        result.query = rest.substr(qm + 1);
        result.query = decode(result.query);
        rest = rest.slice(0, qm);
    } else {
        result.search = '';
        result.query = {};
    }
    if (rest) {
        result.pathname = rest;
    }
    if (slashedProtocol[result.protocol] && result.hostname && !result.pathname) {
        result.pathname = '/';
    }

    if (result.pathname || result.search) {
        result.path = (result.pathname || '') + ( result.search || '');
    }

    result.href = format(result);
    return result;
}
exports.parseUrl = parse;

function format(result) {
    var auth = result.auth || '';
    if (auth) {
        auth = encodeURIComponent(auth);
        auth = auth.replace(/%3A/i, ':');
        auth += '@';
    }

    var protocol = result.protocol || '',
        pathname = result.pathname || '',
        hash = result.hash || '',
        host = false,
        query = '';

    if (result.host) {
        host = auth + result.host;
    } else if (result.hostname) {
        host = auth + (result.hostname.indexOf(':') === -1 ? result.hostname : '[' + result.hostname + ']');
        if (result.port) {
            host += ':' + result.port;
        }
    }

    if (result.query && typeof result.query === 'object' && Object.keys(result.query).length) {
        query = encode(result.query);
    }

    var search = result.search || (query && ('?' + query)) || '';

    if (protocol && protocol.substr(-1) !== ':') {
        protocol += ':';
    }

    if (result.slashes || (!protocol || slashedProtocol[protocol]) && host !== false) {
        host = '//' + (host || '');
        if (pathname && pathname.charAt(0) !== '/') {
            pathname = '/' + pathname;
        }
    } else if (!host) {
        host = '';
    }

    if (hash && hash.charAt(0) !== '#') {
        hash = '#' + hash;
    }
    if (search && search.charAt(0) !== '?') {
        search = '?' + search;
    }

    pathname = pathname.replace(/[?#]/g, function (match) {
        return encodeURIComponent(match);
    });
    search = search.replace('#', '%23');

    return protocol + host + pathname + search + hash;
}
exports.formatUrl = format;
//endregion 工具函数

//region url和protocol处理
var proxy = null,//代理服务器
    util = require("./util"),//工具类
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
 * 添加特殊的协议
 * @note 如定义baidu = http://www.baidu.com，则baidu://a/b为会替换为http://www.baidu.com/a/b
 * @param type {string|*} 类型
 * @param [target]
 */
exports.setProtocol = function (type, target) {
    if (typeof  type !== "string") {
        util.merge(protocol, type);
    }
    else {
        protocol[type] = target;
    }
};

/**
 * 对url进行处理，并返回适当的访问连接和host
 * @param url 要处理的url
 */
function getUrl(url) {
}
//endregion url和protocol处理

////region 数据请求
///**
// * @param [url] {string} 要访问的路径
// * @param options 配置参数
// */
//function ajax(url, options) {
//    url = options.url || host;
//    var success = options.success;
//    var headers = options.headers;
//    var error = options.error || function (msg) {
//        console.log(msg);
//    };
//    if (!url) {
//        error("url不能为空");
//        return;
//    }
//
//}
//
//exports.ajax = ajax;
//
////endregion 数据请求


