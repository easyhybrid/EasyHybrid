var fs = require("fs");
var path = require("path");
var lib = require("./lib/index");

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
        var mapping = grunt.file.expandMapping("**", config.target, {
            cwd: config.path,
            rename: function (dest, src) {
                return dest + src.split(/\/|\\/).map(function (item) {
                    return item.replace(match_type, "$1$2").replace(".tpl", "-tpl.js");
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
            var id = ("hybrid/" + arr.slice(deep - 1).join("/") + "/" + basename.split(".")[0]).replace(/\/+/g, "/");
            grunt.file.copy(src, dest, {
                encoding: "utf8",
                process: function (content) {
                    if (/\.tpl$/.test(src)) {
                        content = lib.run(content);
                    }
                    var lines = content.split("\n");
                    content = "    " + lines.join("\n    ");
                    return 'define("' + id + '", function (require, exports, module) {\n' + content.replace(match_url, function () {
                        var pfix = arguments[1].replace(config.platform + "-", "").replace(".tpl", "-tpl");
                        if (pfix.charAt(0) === ".") {
                            return "require(\"" + path.join(id, "..", pfix) + "\")";
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
        var setting = config.config;
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
        content += '\n    core.util.platform = ' + JSON.stringify(setting) + ';\n';
        function quickend(type) {
            content += '\n    //下边为' + type + '注册代码\n';
            var list = grunt.file.expand({
                cwd: src + type + "/"
            }, "*.js");
            list.forEach(function (item) {
                content += '    core.register("' + type + '", require("hybrid/' + type + "/" + item.split(".")[0] + '"));\n';
            });
        }

        ["ui", "plugin", "util"].forEach(quickend);

        content += '\n    //下边为view注册代码\n';
        var list2 = grunt.file.expand({
            cwd: src + "/view/"
        }, "*/*.js");
        list2.forEach(function (item) {
            content += '    core.register("view", "' + item.split(".")[0] + '", require("hybrid/view/' + item.split(".")[0] + '"));\n';
        });

        content += '\n    //下边为初始化项目代码\n';
        content += '    exports.init = require("hybrid/init")(core);\n';
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
        if (config.compress) {
            //编译压缩处理
            css.push("css/index.css");
            js.push("js/index.js");
        } else {
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
        }
        var content = '<html>\n    <head>' +
            '\n        <meta charset="utf-8"/>' +
            '\n        <base target="_self"/>' +
            '\n        <title>' + config.config.name + '</title>';
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
                    files: config.lib.map(function (item) {
                        return {
                            expand: true,
                            cwd: item + "css/",
                            src: ["**"],
                            dest: ".tmp/css/",
                            filter: lib.createFilter(config, 0, config.name)
                        };
                    })
                },
                "lib-js": {
                    files: config.lib.map(function (item) {
                        return {
                            expand: true,
                            cwd: item,
                            src: ["**", "!**/css/**"],
                            dest: ".tmp/js/",
                            filter: lib.createFilter(config, item.split("/").length, config.type)
                        };
                    })
                },
                "source-css": {
                    files: fs.readdirSync(config.src).filter(function (item) {
                        return grunt.file.isDir(process.cwd(), config.src, item);
                    }).map(function (item) {
                        return {
                            expand: true,
                            cwd: config.src + item + "/css/",
                            src: ["**"],
                            dest: ".tmp/css/",
                            filter: lib.createFilter(config, 0, config.type)
                        };
                    })
                },
                "source-js": {
                    files: [
                        {
                            expand: true,
                            cwd: config.src,
                            src: ["*/**", "!**/css/**"],
                            dest: ".tmp/js/view/",
                            filter: lib.createFilter(config, 0, config.type)
                        },
                        {
                            expand: true,
                            cwd: config.src,
                            src: ["init.js"],
                            dest: ".tmp/js/",
                            filter: lib.createFilter(config, 0, config.type)
                        }
                    ]
                },
                "build-uncompress": {
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
                            cwd: ".tmp/",
                            src: ["index.html"],
                            dest: config.build
                        }
                    ]
                },
                "build-compress": {
                    files: [
                        {
                            expand: true,
                            cwd: ".tmp/css/",
                            src: ["img/**"],
                            dest: config.build + "css/"
                        }
                    ]
                }
            },
            "easy-hybrid-rename": {
                path: ".tmp/js/",
                platform: config.type,
                target: ".tmp/compress/"
            },
            "easy-hybrid-index": {
                path: ".tmp/compress/",
                dest: ".tmp/compress/index.js",
                config: config.config
            },
            "easy-hybrid-build": {
                path: ".tmp/",
                target: ".tmp/index.html",
                compress: config.compress,
                sources: config.sources,
                config: config.config
            },
            jshint: {
                all: [
                    '.tmp/compress/**/*.js'
                ],
                options: {
                    jshintrc: '.jshintrc'
                }
            },
            clean: {
                tmp: [".tmp/"],
                target: config.target
            },
            concat: {
                combine: {
                    options: {
                        process: function (src, filepath) {
                            return '// Source: ' + filepath.replace("./tmp/compress/", "") + '\n' + src;
                        }
                    },
                    files: {
                        ".tmp/combine.js": [".tmp/compress/**/*.js"]
                    }
                },
                build: {
                    options: {
                        separator: '\n\n',
                        banner: '(function(){\n',
                        footer: '\n})();'
                    },
                    files: {
                        ".tmp/all.js": [path.join(__dirname, "source", "require.js"), ".tmp/combine.js", path.join(__dirname, "source", "load.js")]
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
        var task = ["copy:lib-css", "copy:lib-js", "copy:source-css", "copy:source-js", "easy-hybrid-rename", "easy-hybrid-index", "easy-hybrid-build", "clean:target"];
        if (config.compress) {
            task.push("concat:combine");
            task.push("concat:build");
            task.push("uglify:build");
            task.push("copy:build-compress");
            task.push("cssmin:build");
        } else {
            //直接复制文件
            task.push("copy:build-uncompress");
            grunt.file.copy(path.join(__dirname, "source", "require.js"), path.join(process.cwd(), config.build, "js", "require.js"));
            grunt.file.copy(path.join(__dirname, "source", "load.js"), path.join(process.cwd(), config.build, "js", "load.js"));
        }
        task.push("clean:tmp");
        task.push("easy-hybrid-rescue");
        grunt.task.run(task);
    });

    //入口函数，用于产生新的配置文件，并对文件进行处理
    grunt.task.registerMultiTask("hybrid", "an javascript development approach base on cordova-js", function () {
        var me = this;
        //重新生成请求参数
        grunt.config.init({
            "easy-hybrid-rescue": grunt.config.get(),//缓存现有文件
            "easy-hybrid-platform": lib.platformInit(me.target, me.data.lib, me.data.pkg)
        });
        grunt.task.run(["easy-hybrid-platform", "easy-hybrid-rescue"]);

    });
};
