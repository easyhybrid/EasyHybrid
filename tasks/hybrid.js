var lib = require("./lib/index");
var path = require('path');

module.exports = function (grunt) {
    grunt.task.loadNpmTasks("grunt-contrib-clean");
    grunt.task.loadNpmTasks("grunt-contrib-concat");
    grunt.task.loadNpmTasks("grunt-contrib-copy");
    grunt.task.loadNpmTasks("grunt-contrib-cssmin");
    grunt.task.loadNpmTasks("grunt-contrib-uglify");
    grunt.task.loadNpmTasks("grunt-contrib-jshint");

    //恢复已经暂存的配置信息
    grunt.task.registerTask("easy-hybrid-rescue", "clean and rescue the old config", function () {
        grunt.config.init(grunt.config.get("easy-hybrid-rescue"));
    });

    //书写文件ID，将node.js模式的代码 转化成供loader加载的代码
    grunt.task.registerTask("easy-hybrid-rename", "rename file", function () {
        var config = grunt.config.get("easy-hybrid-rename");
        var deep = config.target.split("/").length;
        var match_type = new RegExp("^(cordova-)?" + config.platform + "-(.+)$");
        var match_url = /require *\( *['"](.+?)['"] *\)/ig;
        //noinspection JSUnusedGlobalSymbols
        var mapping = grunt.file.expandMapping(["**", "!source/" + (!config.cordova ? "cordova" : "self" ) + "/**.js", "source/" + (config.cordova ? "cordova" : "self" ) + "/**.js", "!source/" + (config.cordova ? "cordova" : "self" ) + "/load.js", "!source/" + (config.cordova ? "cordova" : "self" ) + "/require.js"], config.target, {
            cwd: config.path,
            rename: function (dest, src) {
                return dest + src.split(/\/|\\/).map(function (item) {
                    return item.replace(match_type, "$1$2").replace(".html", "-tpl.js");
                }).join("/");
            }
        });
        mapping.forEach(function (item) {
            var src = item.src[0];
            var dest = item.dest;
            var arr = dest.split(/\/|\\/);
            var basename = arr.pop();
            if (basename.indexOf(".") < 0) {
                grunt.file.mkdir(dest);
                return;
            }
            var b = basename.split(".")[0];
            var id = ("hybrid/" + arr.slice(deep - 1).join("/") + "/" + b).replace(/\/+/g, "/");
            if (arr[2] === "source") {
                if (arr.length === 4 && b === "cordova") {
                    id = "cordova";
                } else {
                    id = ("cordova/" + arr.slice(deep + 1).join("/") + "/" + b).replace(/\/+/g, "/");
                }
            }
            grunt.file.copy(src, dest, {
                encoding: "utf8",
                process: function (content) {
                    if (/\.html$/.test(src)) {
                        content = lib.run(content);
                    }
                    var lines = content.split("\n");
                    content = "    " + lines.join("\n    ");
                    return 'define("' + id + '", function (require, exports, module) {\n' + content.replace(match_url, function () {
                        var pfix = arguments[1].replace(config.platform + "-", "").replace(".html", "-tpl");
                        if (pfix.charAt(0) === ".") {
                            return ("require(\"" + path.join(id, "..", pfix).replace(/\\/g, "/") + "\")").replace("\\", "/");
                        }
                        return "require(\"" + pfix + "\")";
                    }) + '\n});'
                }
            });
        });
    });

    //生成index.js文件
    grunt.task.registerTask("easy-hybrid-index", function () {
        var config = grunt.config.get("easy-hybrid-index");
        var src = config.path;
        //生成index.js文件
        var content = 'define("hybrid/index", function (require, exports, module) {\n';
        content += "\n    //下边为加载patch代码\n";
        var list3 = grunt.file.expand({
            cwd: src + "patch/"
        }, "*.js");
        list3.forEach(function (item) {
            content += '    require("hybrid/patch/' + item.split(".")[0] + '");\n';
        });
        content += '\n    var core = require("hybrid/core");\n';

        function quickend(type) {
            content += '\n    //下边为' + type + '注册代码\n';
            var list = grunt.file.expand({
                cwd: src + type + "/"
            }, "*.js");
            list.forEach(function (item) {
                content += '    core.register("' + (type !== "ui" ? item.split(".")[0] : type) + '", require("hybrid/' + type + "/" + item.split(".")[0] + '"));\n';
            });
        }

        [ "util", "plugin", "ui"].forEach(quickend);

        content += '\n    //下边为config注册代码\n';
        content += '\n    core.config = require("hybrid/config");\n';

        content += '\n    //下边为widget注册代码\n';
        var list4 = grunt.file.expand({
            cwd: src + "/widget/"
        }, "*.js");
        list4.forEach(function (item) {
            var id = item.split(".")[0];
            content += '    core.register("widget" ,"' + id + '", require("hybrid/widget/' + item.split(".")[0] + '")(core));\n';
        });

        content += '\n    //下边为view注册代码\n';
        var list2 = grunt.file.expand({
            cwd: src + "/view/"
        }, "*/*.js");
        list2.forEach(function (item) {
            content += '    core.register("view", "' + item.split(".")[0] + '", require("hybrid/view/' + item.split(".")[0] + '"));\n';
        });

        content += '\n    //下边为初始化项目代码\n';
        if (config.native) {
            content += '    var channel = require("cordova/channel");\n';
            content += '    var cordova = window.cordova = require("cordova");\n';
            content += '    cordova["exec"] = require("cordova/exec");\n';
            content += '    channel.onPause = cordova.addDocumentEventHandler("pause");\n';
            content += '    channel.onResume = cordova.addDocumentEventHandler("resume");\n';
        }
        if (config.proxy) {
            content += '    window.devProxy = "' + config.proxy + '";\n';
        }
        content += '    exports.init = function () {\n' +
            '        core.util.join(function(){\n' +
            '            require("hybrid/init")(core);\n' +
            '        }, core.plugin.channels);\n' +
            '    };\n';
        content += '});';
        grunt.file.write(config.dest, content);
    });

    //根据配置生成index.html
    grunt.task.registerTask("easy-hybrid-build", function () {
        var config = grunt.config.get("easy-hybrid-build");
        var target = config.target;
        var src = config.path;
        var css = config.sources.css;
        var js = config.sources.js;
        var content = '<html>\n    <head>' +
            '\n        <meta charset="utf-8"/>' +
            '\n        <meta name="apple-touch-fullscreen" content="yes"/>' +
            '\n        <meta name="apple-mobile-web-app-capable" content="yes" />' +
            '\n        <meta name="apple-mobile-web-app-status-bar-style" content="black">' +
            '\n        <base target="_self"/>' +
            '\n        <title>' + config.name + '</title>';
        css.forEach(function (item) {
            content += '\n        <link href="' + item + '" rel="stylesheet"/>';
        });
        content += '\n    </head>\n    <body>';
        js.forEach(function (item) {
            content += '\n         <script src="' + item + '"></script>';
        });
        content += '\n    </body>\n</html>';
        grunt.file.write(target, content);
    });

    //修复easy-hybrid-build在开发版本时的错误
    grunt.task.registerTask("easy-hybrid-fix", function () {
        var config = grunt.config.get("easy-hybrid-build");
        var target = config.target;
        var src = config.path;
        var css = config.sources.css;
        var js = config.sources.js;
        js.push("js/require.js");
        grunt.file.expand({
            cwd: src + ""
        }, "css/*.css").forEach(function (item) {
            css.push(item);
        });
        grunt.file.expand({
            cwd: src + "compress/"
        }, "**/*.js").forEach(function (item) {
            js.push("js/" + item);
        });
        js.push("js/load.js");
        var content = '<html>\n    <head>' +
            '\n        <meta charset="utf-8"/>' +
            '\n        <base target="_self"/>' +
            '\n        <title>' + config.name + '</title>';
        css.forEach(function (item) {
            content += '\n        <link href="' + item + '" rel="stylesheet"/>';
        });
        content += '\n    </head>\n    <body>';
        js.forEach(function (item) {
            content += '\n         <script src="' + item + '"></script>';
        });
        content += '\n    </body>\n</html>';
        grunt.file.write(target, content);
    });

    //用于根据配置信息对一个平台进行编译
    grunt.task.registerMultiTask("easy-hybrid-platform", "fetch each platform", function () {
        var config = this.data;
        grunt.config.init({
            "easy-hybrid-rescue": grunt.config.get(),//缓存现有文件
            copy: {
                "lib-css": {
                    files: [
                        {
                            expand: true,
                            cwd: config.lib + "css/",
                            src: ["**"],
                            dest: ".tmp/css/",
                            filter: config.filter.lib
                        }
                    ]
                },
                "lib-js": {
                    files: [
                        {
                            expand: true,
                            cwd: config.lib,
                            src: ["**", "!css/**"],
                            dest: ".tmp/js/",
                            filter: config.filter.lib
                        }
                    ]
                },
                "source-css": {
                    files: [
                        {
                            expand: true,
                            flatten: true,
                            cwd: config.src,
                            src: ["**/*.css"],
                            dest: ".tmp/css/",
                            filter: config.filter.source

                        },
                        {
                            expand: true,
                            flatten: true,
                            cwd: config.src,
                            src: ["**/img/*.*"],
                            dest: ".tmp/css/img/",
                            filter: config.filter.source

                        }
                    ]
                },
                "source-js": {
                    files: [
                        {
                            expand: true,
                            cwd: config.src,
                            src: ["**", "!**/css/**"],
                            dest: ".tmp/js/",
                            filter: config.filter.source
                        }
                    ]
                },
                "build": {
                    files: [
                        {
                            expand: true,
                            cwd: ".tmp/css/",
                            src: ["img/**"],
                            dest: config.build + "css/"
                        },
                        {
                            expand: true,
                            cwd: ".tmp/",
                            src: ["index.html"],
                            dest: config.build
                        },
                        {
                            expand: true,
                            cwd: ".tmp/js/source/" + (config.cordova ? "cordova" : "self") + "/",
                            src: ["load.js", "require.js"],
                            dest: ".tmp/"
                        }
                    ]
                }
            },
            "easy-hybrid-rename": {
                path: ".tmp/js/",
                cordova: config.cordova,
                platform: config.platform,
                target: ".tmp/compress/"
            },
            "easy-hybrid-index": {
                platform: config.platform,
                native: config.native,
                proxy: "",
                path: ".tmp/compress/",
                dest: ".tmp/compress/index.js"
            },
            "easy-hybrid-build": {
                path: ".tmp/",
                target: ".tmp/index.html",
                sources: config.sources,
                name: config.name
            },
            clean: {
                tmp: [".tmp/"],
                target: config.target
            },
            concat: {
                build: {
                    options: {
                        separator: '\n\n',
                        banner: '(function(){\n',
                        footer: '\n})();',
                        process: function (src, filepath) {
                            return '// Source: ' + filepath.replace("./tmp/compress/", "") + '\n' + src;
                        }
                    },
                    files: {
                        ".tmp/all.js": [".tmp/require.js", ".tmp/compress/**/*.js", ".tmp/load.js"]
                    }
                }
            },
            uglify: {
                build: {
                    src: [".tmp/all.js"],
                    dest: config.build + "js/index.js"
                }
            },
            cssmin: {
                build: {
                    src: [".tmp/css/*.css"],
                    dest: config.build + "css/index.css"

                }
            }
        });
        var task = [
            "clean",
            "copy:lib-css",
            "copy:lib-js",
            "copy:source-css",
            "copy:source-js",
            "easy-hybrid-rename",
            "easy-hybrid-index",
            "easy-hybrid-build",
            "clean:target",
            "copy:build",
            "concat",
            "uglify",
            "cssmin",
            "clean:tmp",
            "easy-hybrid-rescue"
        ];
        grunt.task.run(task);
    });

    //用于根据信息生成编译信息
    grunt.task.registerMultiTask("easy-hybrid-dev", "fetch each platform", function () {
        var config = this.data;
        if (config === false) {
            return;
        }
        grunt.config.init({
            "easy-hybrid-rescue": grunt.config.get(),//缓存现有文件
            copy: {
                "lib-css": {
                    files: [
                        {
                            expand: true,
                            cwd: config.lib + "css/",
                            src: ["**"],
                            dest: ".tmp/css/",
                            filter: config.filter.lib
                        }
                    ]
                },
                "lib-js": {
                    files: [
                        {
                            expand: true,
                            cwd: config.lib,
                            src: ["**", "!css/**", "!source/self/**", "source/self/load.js", "source/self/require.js"],
                            dest: ".tmp/js/",
                            filter: config.filter.lib
                        }
                    ]
                },
                "source-css": {
                    files: [
                        {
                            expand: true,
                            flatten: true,
                            cwd: config.src,
                            src: ["**/*.css"],
                            dest: ".tmp/css/",
                            filter: config.filter.source

                        },
                        {
                            expand: true,
                            flatten: true,
                            cwd: config.src,
                            src: ["**/img/*.*"],
                            dest: ".tmp/css/img/",
                            filter: config.filter.source

                        }
                    ]
                },
                "source-js": {
                    files: [
                        {
                            expand: true,
                            cwd: config.src,
                            src: ["**", "!**/css/**"],
                            dest: ".tmp/js/",
                            filter: config.filter.source
                        }
                    ]
                },
                "build": {
                    files: [
                        {
                            expand: true,
                            cwd: ".tmp/css/",
                            src: ["**"],
                            dest: config.build + "css/"
                        },
                        {
                            expand: true,
                            cwd: ".tmp/compress/",
                            src: ["**"],
                            dest: config.build + "js/"
                        },
                        {
                            expand: true,
                            cwd: ".tmp/js/source/" + (config.cordova ? "cordova" : "self") + "/",
                            src: [ "load.js", "require.js"],
                            dest: config.build + "js/"
                        },
                        {
                            expand: true,
                            cwd: ".tmp/",
                            src: ["index.html"],
                            dest: config.build
                        }
                    ]
                }
            },
            "easy-hybrid-rename": {
                path: ".tmp/js/",
                cordova: config.cordova,
                platform: "web",
                target: ".tmp/compress/"
            },
            "easy-hybrid-index": {
                platform: config.platform,
                native: config.native,
                proxy: config.proxy,
                path: ".tmp/compress/",
                dest: ".tmp/compress/index.js"
            },
            "easy-hybrid-build": {
                path: ".tmp/",
                target: ".tmp/index.html",
                sources: config.sources,
                name: config.name
            },
            clean: {
                tmp: [".tmp/"],
                target: config.target
            }
        });
        var task = [
            "clean",
            "copy:lib-css",
            "copy:lib-js",
            "copy:source-css",
            "copy:source-js",
            "easy-hybrid-rename",
            "easy-hybrid-index",
            "easy-hybrid-fix",
            "clean:target",
            "copy:build",
            "clean:tmp",
            "easy-hybrid-rescue"
        ];
        grunt.task.run(task);
    });

    //入口函数，用于产生新的配置文件，并对文件进行处理
    grunt.task.registerMultiTask("hybrid", "an javascript development approach base on cordova-js", function () {
        var me = this;
        var task = ["jshint"];
        //重新生成请求参数
        grunt.config.init({
            "easy-hybrid-rescue": grunt.config.get(),//缓存现有文件
            jshint: {
                lib: {
                    files: [
                        {
                            src: (me.data.lib || "src/") + "**/*.js"
                        }
                    ],
                    options: {
                        "bitwise": true,
                        "curly": true,
                        "eqeqeq": true,
                        "es3": true,
                        "forin": true,
                        "immed": true,
                        "newcap": true,
                        "latedef": false,
                        "noarg": true,
                        "noempty": true,
                        "undef": true,
                        "unused": true,
                        "trailing": true,
                        "boss": true,
                        "laxbreak": true,
                        "browser": true,
                        "node": true,
//                        "onevar": true,
                        "eqnull": true
                    }
                },
                project: {
                    files: [
                        {
                            src:  me.target + "**/*.js"
                        }
                    ],
                    options: {
                        jshintrc: '.jshintrc'
                    }
                }
            },
            "easy-hybrid-platform": lib.platformInit(me.target, me.data)
        });
        var dev = lib.developInit(me.target, me.data);
        if (dev) {
            grunt.config.set("easy-hybrid-dev", {
                dev: dev
            });
            task.push("easy-hybrid-dev");
        }
        task.push("easy-hybrid-platform");
        task.push("easy-hybrid-rescue");
        grunt.task.run(task);
    });
};
