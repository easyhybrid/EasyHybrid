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
                        return "require(\"" + arguments[1].replace(config.platform + "-", "").replace(".tpl", "-tpl") + "\")";
                    }) + '\n});'
                }
            });
        });
    });

    grunt.task.registerTask("easy-hybrid-index", function () {
        var flist = fs.readdirSync(path.join(process.cwd(), ".tmp/compress"));
        flist.forEach(function (item) {
            //生成index.js文件
            var content = 'define("hybrid/index",function (require, exports, module) {\n';
            content += "\n    //下边为加载patch代码\n";
            var list3 = grunt.file.expand({
                cwd: ".tmp/compress/" + item + "/js/patch/"
            }, "*.js");
            list3.forEach(function (item) {
                content += '    require("hybrid/patch/' + item.split(".")[0] + '");\n';
            });
            content += '\n    var core = require("./core");\n';
            function quickend(type) {
                content += '\n    //下边为' + type + '注册代码\n';
                var list = grunt.file.expand({
                    cwd: ".tmp/compress/" + item + "/js/" + type + "/"
                }, "*.js");
                list.forEach(function (item) {
                    content += '    core.register("' + type + '", require("hybrid/' + type + "/" + item.split(".")[0] + '"));\n';
                });
            }

            ["ui", "plugin"].forEach(quickend);

            content += '\n    //下边为view注册代码\n';
            var list2 = grunt.file.expand({
                cwd: ".tmp/compress/" + item + "/js/view/"
            }, "*/*.js");
            list2.forEach(function (item) {
                content += '    core.register("view", "' + item.split(".")[0] + '", require("hybrid/view/' + item.split(".")[0] + '"));\n';
            });

            content += '\n    //下边为初始化项目代码\n';
            content += '    exports.init = require("hybrid/init")(core);\n';
            content += '});';
            grunt.file.write(".tmp/compress/" + item + "/js/index.js", content);
        });
    });

    //用于根据配置信息对一个平台进行编译
    grunt.task.registerMultiTask("easy-hybrid-platform", "fetch each platform", function () {
        var config = this.data;
        var dest = ".tmp/" + config.name + "/";
        grunt.config.init({
            "easy-hybrid-rescue": grunt.config.get(),//缓存现有文件
            copy: {
                "lib-css": {
                    files: config.lib.map(function (item) {
                        return {
                            expand: true,
                            cwd: item + "css/",
                            src: ["**"],
                            dest: dest + "css/",
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
                            dest: dest + "js/",
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
                            dest: dest + "css/",
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
                            dest: dest + "js/view/",
                            filter: lib.createFilter(config, 0, config.type)
                        }
                    ]
                }
            },
            "easy-hybrid-rename": {
                path: dest + "js/",
                platform: config.type,
                target: dest + "compress/"
            },
            jshint: {
                all: [
                    '.tmp/*/compress/**/*.js',
                ],
                options: {
                    jshintrc: '.jshintrc'
                }
            }
        });
        grunt.task.run(["copy:lib-css", "copy:lib-js", "copy:source-css", "copy:source-js", "easy-hybrid-rename", "jshint", "easy-hybrid-rescue"]);

        //
        //        var tasks = ["copy:lib", "copy:source", "copy:platform", "clean:ora", "easy-hybrid-rename", "easy-hybrid-index", "copy:css", "cssmin", "copy:dev"];//任务列表
        //            var config = {
        //
        //
        //
        //                copy: {
        //                    lib: filterLirary(lib_path, pkg),//归并基础库
        //                    source: {//归并项目资源文件
        //                        files: [
        //                            {
        //                                expand: true,
        //                                cwd: 'src/' + me.target + "/",
        //                                src: ["**", "!init.js", "!package.js", "!**/css/**"],
        //                                dest: '.tmp/ora/js/view',
        //                                filter: createFilter(pkg, false, "")
        //                            },
        //                            {
        //                                expand: true,
        //                                cwd: 'src/' + me.target + "/",
        //                                src: ["init.js"],
        //                                dest: '.tmp/ora/js/',
        //                                filter: createFilter(pkg, false, "")
        //                            }
        //                        ]
        //                    },
        //                    platform: {//提取各平台文件
        //                        files: [
        //                            {
        //                                expand: true,
        //                                cwd: '.tmp/ora/',
        //                                src: ["**"],
        //                                dest: '.tmp/source/dev/',
        //                                filter: createFilter(pkg, false, "web")
        //                            }
        //                        ]
        //                    },
        //                    css: {
        //                        files: [
        //                            {
        //                                expand: true,
        //                                cwd: '.tmp/source/dev/css/',
        //                                src: ["**"],
        //                                dest: '.tmp/dist/dev/css/'
        //                            }
        //                        ]
        //                    },
        //                    dev: {
        //                        files: [
        //                            {
        //                                expand: true,
        //                                cwd: '.tmp/source/dev/js/',
        //                                src: ["**"],
        //                                dest: '.tmp/dist/dev/js/'
        //                            }
        //                        ]
        //                    }
        //                },
        //                cssmin: {
        //                    options: {
        //                        keepSpecialComments: 0
        //                    },
        //                    css: {
        //                        files: {
        //                        }
        //                    }
        //                }
        //            };
        //            //归并项目资源文件
        //            var flist = fs.readdirSync(path.join(process.cwd(), 'src', me.target));
        //            flist.forEach(function (item) {
        //                config.copy.source.files.push({
        //                    expand: true,
        //                    cwd: 'src/' + me.target + "/" + item + "/css/",
        //                    src: ["**"],
        //                    dest: '.tmp/ora/css/',
        //                    filter: createFilter(pkg, false, "")
        //                });
        //            });
        //            //提取各平台文件
        //            pkg.platform.forEach(function (item) {
        //                config.copy.platform.files.push({
        //                    expand: true,
        //                    cwd: '.tmp/ora/',
        //                    src: ["**"],
        //                    dest: '.tmp/source/' + item + "/",
        //                    filter: createFilter(pkg, false, item)
        //                });
        //                config.copy.css.files.push({
        //                    expand: true,
        //                    cwd: '.tmp/source/' + item + '/css/',
        //                    src: ["img/*.*"],
        //                    dest: '.tmp/dist/' + item + '/css/'
        //                });
        //                config.cssmin.css.files['.tmp/dist/' + item + '/css/index.css'] = grunt.file.expand('.tmp/source/' + item + '/css/*.css');
        //            });
        //            grunt.config.init(config);
    });

    //入口函数，用于产生新的配置文件，并对文件进行处理
    grunt.task.registerMultiTask("hybrid", "an javascript development approach base on cordova-js", function () {
        var me = this;
        //重新生成请求参数
        grunt.config.init({
            "easy-hybrid-rescue": grunt.config.get(),//缓存现有文件
            "easy-hybrid-platform": lib.platformInit(me.target, me.data.lib, me.data.pkg),
            clean: {
                ora: [".tmp"]
            }
        });
        grunt.task.run(["easy-hybrid-platform", "easy-hybrid-rescue"]);

    });
};
