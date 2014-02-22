var fs = require('fs');
var util = require("util");
var sopport = ["dev", "ios", "android", "web"];//目前系统支持的或者即将支持的平台，以item-或者cordove-item-开头的文件或者目录名将会被系统保留
var plugins = ["ui", "plugin", "patch"];

/**
 * 对模板数据进行编译
 * @param data 模板数据
 */
function run(data) {
    var reg = {
        'if': function () {
            return /{{\s*if\s*\(.+?}}/g;
        },
        'else': function () {
            return /{{\s*else\s*}}/g;
        },
        'elseif': function () {
            return /{{\s*else\s+if.+?}}/g;
        },
        'endif': function () {
            return /{{\s*endif\s*}}/g;
        },
        'for': function () {
            return /{{\s*for\s+.+?}}/g;
        },
        'endfor': function () {
            return /{{\s*endfor\s*}}/g;
        },
        'eval': function () {
            return /{{\s*eval\s+.+?}}/g;
        }
    };
    var helper = {
        variable: function (str) {
            return str.replace(/{{(.+?)}}/, '$1');
        },
        statement: function (str, type) {
            var result = '';
            if (type == 'if') {
                result = str.replace(/{{(.+?)}}/, '$1') + '{';
            } else if (type == 'elseif' || type == 'else') {
                result = '}' + str.replace(/{{(.+?)}}/, '$1') + '{';
            } else if (type == 'for') {
                str = str.replace(/^\s*\{\{/, '').replace(/\}\}\s*$/, '');
                var list = str.match(/data=([\S]+)\s*/)[1];
                var key = str.match(/key=([\S]+)\s*/)[1] || '_key';
                var item = str.match(/item=([\S]+)\s*/)[1] || '_item';
                var isObject = str.match(/object=([\S]+)\s*/); // object类型，使用for in
                if (isObject && isObject[1]) {
                    result = 'for(var ' + key + ' in ' + list + '){var ' + item + '=' + list + '[' + key + '];'
                } else {
                    var isReverse = str.match(/reverse=([\S]+)\s*/);
                    var start = str.match(/start=([\S]+)\s*/);
                    var end = str.match(/end=([\S]+)\s*/);
                    var step = str.match(/step=([\S]+)\s*/);
                    if (isReverse && isReverse[1]) {
                        start = start ? start[1] : list + '.length - 1';
                        end = end ? end[1] : -1;
                        step = step ? -step[1] : -1;
                        result = 'for(var ' + key + '=' + start + '; ' + key + '>' + end + ';' + key + '+=' + step + '){var ' + item + '=' + list + '[' + key + '];'
                    } else {
                        start = start ? start[1] : 0;
                        end = end ? end[1] : list + '.length';
                        step = step ? +step[1] : 1;
                        result = 'for(var ' + key + '=' + start + '; ' + key + '<' + end + ';' + key + '+=' + step + '){var ' + item + '=' + list + '[' + key + '];'
                    }
                }
            } else if (type == 'endif' || type == 'endfor') {
                result = '}';
            } else if (type == 'eval') {
                result = str.replace(/^{{\s*eval/, '').replace(/}}\s*$/, '') + ';';
            }
            return result;
        }
    };
    var preFlag = 1; // 上一次命中的类型：1：html文本，2：变量，3：语句
    var flag; // 本次命中的类型
    var source = ''; // 输出的源码
    var isFirst = true; // 是否第一行
    var str; // 循环中每行的代码
    // 去注释空行，转义双引号和斜杆，根据语法进行分行，去空行，然后根据行切割
    data = data.replace(/<!--[\w\W\r\n]*?-->/g, '').replace(/("|\\)/g, '\\$1').replace(/({{.+?}})/g,function (s) {
        return '\n' + s + '\n';
    }).replace(/\r/g, '');
    data = data.split('\n').filter(function (v) {
        return !/^\s*$/.test(v);
    });

    for (var i = 0, len = data.length; i < len; i++) {
        str = data[i].replace(/^\s+|\s+$/, ' ');
        if (str) {
            var statementType = '';
            if (/{{.+?}}/.test(str)) {
                flag = 2;
                for (var type in reg) {
                    if (!reg.hasOwnProperty(type)) {
                        continue;
                    }
                    if ((reg[type]()).test(str)) {
                        flag = 3;
                        statementType = type;
                    }
                }
            } else {
                flag = 1;
            }
            if (preFlag == 1) {
                if (isFirst) {
                    source += '\'';
                }
                if (flag == 1) {
                    source += ' ' + str;
                } else if (flag == 2) {
                    source += '\',' + helper.variable(str);
                } else if (flag == 3) {
                    source += '\');' + helper.statement(str, statementType);
                }
            } else if (preFlag == 2) {
                if (flag == 1) {
                    source += ',\'' + str;
                } else if (flag == 2) {
                    source += ',' + helper.variable(str);
                } else if (flag == 3) {
                    source += ');' + helper.statement(str, statementType);
                }
            } else if (preFlag == 3) {
                if (flag == 1) {
                    source += '_s.push(\' ' + str;
                } else if (flag == 2) {
                    source += '_s.push(' + helper.variable(str);
                } else if (flag == 3) {
                    source += helper.statement(str, statementType);
                }
            }
            isFirst = false;
            preFlag = flag;
        }
    }
    if (flag == 1) {
        source += '\');';
    } else if (flag == 2) {
        source += ');';
    }
    return 'module.exports = {\n' +
        '    render: function(map) {\n' +
        '        var p = [],\n' +
        '            v = [];\n' +
        '        for(var i in map) {\n' +
        '            if (map.hasOwnProperty(i)) {\n' +
        '                p.push(i);\n' +
        '                v.push(map[i]);\n' +
        '            }\n' +
        '        }\n' +
        '        /*jshint evil: true */' +
        '        return (new Function(p, \"var _s=[];_s.push(' + source + ' return _s;\")).apply(null, v).join("");\n' +
        '    }\n' +
        '};';
}
exports.run = run;

/**
 * 初始化各平台信息，并对缺失的参数进行补充
 * @param target 源文件所在位置
 * @param lib_path 配置文件中给出的配置路径信息
 * @param pkg 配置包信息
 * @returns {Array|*}
 */
function platformInit(target, lib_path, pkg) {
    //对相关参数进行规范化
    lib_path = lib_path || "merge";
    pkg = pkg || {};
    pkg.cordova = !!pkg.cordova;
    pkg.platform = pkg.platform || ["dev"];
    pkg.sources = pkg.sources || [];
    pkg.proxy = pkg.proxy || "";
    plugins.forEach(function (item) {
        pkg[item] = pkg[item] || {};
        pkg[item].include = pkg[item].include || [];
        pkg[item].exclude = pkg[item].include || [];
    });
    //处理文件路径
    var lib_src = [];
    var flag = false;
    if (lib_path === "package" || lib_path === "merge") {
        lib_src.push("node_modules/easy-hybrid/src/lib/");
        flag = true;
    }
    if (lib_path === "project" || lib_path === "merge") {
        lib_src.push("src/lib/");
        flag = true;
    }
    if (!flag) {
        if (Array.isArray(lib_path)) {
            lib_src = lib_path;
        }
        else {
            lib_src.push(lib_path);
        }
    }
    lib_src = lib_src.map(function (item) {
        if (item[item.length - 1] !== "/") {
            return item + "/";
        }
        return item;
    });
    //生成platform参数
    var platform = {};
    if (pkg.platform.indexOf("dev") < 0) {
        pkg.platform.push("dev");
    }
    pkg.platform.forEach(function (item) {
        var result = {
            src: "src/" + target + "/",
            lib: lib_src,//从哪里选择基础库
            cordova: pkg.cordova,//是否启用cordova
            patch: pkg.patch,//patch过滤条件
            plugin: pkg.plugin,//plugin过滤条件
            ui: pkg.ui,//ui过滤条件
            sources: pkg.sources,//要引入index.html的资源
            config: util._extend({}, pkg.package)//平台配置信息（会被注入到util.config对象中）
        };
        if (item === "dev") {
            result.name = "dev";//名称
            result.type = "web";//过滤前缀
            result.compress = false;//是否压缩
            result.config.platform = "dev";//为配置添加平台名称
            result.config.proxy = pkg.proxy;//为配置添加代理路径
        } else {
            result.name = item;//名称
            result.type = item;//过滤前缀
            result.compress = true;//是否压缩
            result.config.platform = item;//为配置添加平台名称
            result.config.proxy = "";//为配置添加代理路径
        }
        platform[item] = result;
    });
    return platform;
}

exports.platformInit = platformInit;

/**
 * 用于生成复制过滤函数
 * @param {object} pkg 程序配置包
 * @param {number} deep 从第几层开始过滤
 * @param {string} platform 平台
 * @returns {Function} 过滤函数
 */
function createFilter(pkg, deep, platform) {
    var plats = "";
    if (pkg.cordova) {//过滤掉所有的cordova开头的文件
        plats += "cordova-|";
    }
    if (platform) {
        sopport.forEach(function (item) {
            if (item === platform) {
                return;
            }
            plats += item + "-|";
            plats += "cordova-" + item + "-|";
        });
    }
    plats = plats.slice(0, -1);
    var match = new RegExp("^(" + plats + ")");
    if (deep) {
        return function (src) {
            var arr = src.split(/\/|\\/);
            if (arr.length < deep) {
                return true;
            }
            if (arr.length == deep) {
                return !(plats && match.test(arr[deep - 1]));
            }
            var type = arr[deep - 1];
            if (type in plugins) {
                deep++;
                var basename = (arr[deep - 1] || "").split(".")[0] || "";
                if (pkg[type].include.indexOf(basename) >= 0) {
                    return true;
                }
                if (pkg[type].exclude.indexOf(basename) >= 0) {
                    return false;
                }
            }
            for (var i = deep - 1; i < arr.length; i++) {
                if (plats && match.test(arr[i])) {
                    return false;
                }
            }
            return true;
        }
    }
    else {
        return function (src) {
            var arr = src.split(/\/|\\/);
            for (var i = deep; i < arr.length; i++) {
                if (plats && match.test(arr[i])) {
                    return false;
                }
            }
            return true;
        }
    }
}
exports.createFilter = createFilter;

