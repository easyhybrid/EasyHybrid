var util = require("util");
var path = require("path");
var support = ["ios", "android", "web"];
var native = ["ios", "android"];//目前系统支持的通过phonegap原生代码交互来实现的平台，系统会加载一个简易版的cordova核心用来和
var plugins = ["ui", "plugin", "patch", "util"];

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
    data = data.replace(/<!--[\w\W\r\n]*?-->/g, '').replace(/("|\\)/g, '\\$1').replace(/({{.+?}})/g, function (s) {
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
                    source += str;
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
                    source += '_s.push(\'' + str;
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
    return '' +
        'module.exports = {\n' +
        '    render: function(map) {\n' +
        '        var p = [],\n' +
        '            v = [];\n' +
        '        map = map || {};\n' +
        '        for(var i in map) {\n' +
        '           p.push(i);\n' +
        '           v.push(map[i]);\n' +
        '        }\n' +
        '        return (new Function(p, \"var _s=[];_s.push(' + source + ' return _s;\")).apply(null, v).join("");\n' +
        '    }\n' +
        '};';
}
exports.run = run;

/**
 * 初始化各平台信息，并对缺失的参数进行补充
 * @param target 源文件所在位置
 * @param pkg 配置包信息
 * @returns {Array|*}
 */
function platformInit(target, pkg) {
    //对相关参数进行规范化
    pkg.cordova = !!pkg.cordova;//是否使用cordova
    //noinspection JSUnresolvedVariable
    pkg.lib = pkg.lib || path.join(__dirname, "../../src");//库文件路径
    pkg.name = pkg.name || "";//项目名称
    pkg.platforms = pkg.platforms || ["web"];//目标平台
    pkg.sources = pkg.sources || {};//额外资源路径
    pkg.sources.css = pkg.sources.css || [];//额外css资源路径
    pkg.sources.js = pkg.sources.js || [];//额外js资源路径
    var source = {
        css: [
            "css/index.css"
        ],
        js: [
            "js/index.js"
        ]
    };
    pkg.sources.css.forEach(function (item) {
        if (source.css.indexOf(item) < 0) {
            source.css.push(item);

        }
    });
    pkg.sources.js.forEach(function (item) {
        if (source.js.indexOf(item) < 0) {
            source.js.push(item);

        }
    });
    pkg.plugin = pkg.plugin || [];//plugin插件
    pkg.util = pkg.util || [];//util插件
    pkg.patch = pkg.patch || [];//patch插件
    pkg.ui = pkg.ui || [];//ui插件
    //生成platform参数
    var platform = {};
    pkg.platforms.forEach(function (item) {
        platform[item] = {
            cordova: pkg.cordova,//是否启用cordova
            native: native.indexOf(item) >= 0,//是否有原生桥
            build: "build/" + target + "/" + item + "/",//目标代码目录
            target: target,//工程名称
            platform: item,//平台的名称
            name: pkg.name,
            src: target + "/",//源代码目录
            lib: pkg.lib,//从哪里选择基础库
            filter: {
                lib: createFilter(pkg, pkg.lib.split("/").length, item),//库文件过滤函数
                source: createFilter(pkg, 0, item)//一般文件过滤函数
            },
            sources: source//要引入index.html的资源
        };
    });
    return platform;
}

exports.platformInit = platformInit;


/**
 * 初始化开发包信息
 * @param target 源文件所在位置
 * @param pkg 配置包信息
 * @returns {*}
 */
function developInit(target, pkg) {
    if (!pkg.develop || !pkg.develop.enable) {
        return false
    }
    var source = {
        css: [
        ],
        js: [
        ]
    };
    pkg.sources.css.forEach(function (item) {
        if (source.css.indexOf(item) < 0) {
            source.css.push(item);

        }
    });
    pkg.sources.js.forEach(function (item) {
        if (source.js.indexOf(item) < 0) {
            source.js.push(item);

        }
    });
    return {
        proxy: pkg.develop.proxy || false,//代理信息
        native: false,//是否有原生桥
        cordova: pkg.cordova,//是否启用cordova
        build: "build/" + target + "/dev/",//目标代码目录
        target: target,//工程名称
        src: target + "/",//源代码目录
        name: pkg.name,
        lib: pkg.lib,//从哪里选择基础库
        filter: {
            lib: createFilter(pkg, pkg.lib.split("/").length, "web"),//库文件过滤函数
            source: createFilter(pkg, 0, "web")//一般文件过滤函数
        },
        sources: source//要引入index.html的资源
    };
}

exports.developInit = developInit;

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
        support.forEach(function (item) {
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
            for (var i = deep - 1; i < arr.length; i++) {
                if (plats && match.test(arr[i])) {
                    return false;
                }
            }
            var type = arr[deep - 1];
            if (plugins.indexOf(type) >= 0) {
                var basename = (arr[deep] || "").split(".")[0] || "";
                if (pkg[type].indexOf(basename) >= 0) {
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

