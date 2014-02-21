var fs = require("fs");
var path = require("path");
var tpl = require("./lib/tpl");

module.exports = function (grunt) {

    grunt.task.loadNpmTasks("grunt-contrib-clean");
    grunt.task.loadNpmTasks("grunt-contrib-concat");
    grunt.task.loadNpmTasks("grunt-contrib-copy");
    grunt.task.loadNpmTasks("grunt-contrib-cssmin");
    grunt.task.loadNpmTasks("grunt-contrib-uglify");

    grunt.task.registerTask("easy-hybrid-rename", "rename file", function () {
        var mapping = grunt.file.expandMapping("**/js/**", ".tmp/compress/", {
            cwd: ".tmp/source/",
            rename: function (dest, src) {
                if (src.indexOf(".") < 0) {
                    return  src;
                }
                var arr = src.split(/\/|\\/);
                var type = arr[0];
                var basename = arr.pop() || "";
                var match = new RegExp("^(?:(cordova-)?" + type + "-)(.+)$");
                arr.push(basename.replace(match, "$1$2").replace(".tpl", ".js"));
                return arr.join("/");
            }
        });
        var match = /require *\( *['"](.+?)['"] *\)/ig;
        mapping.forEach(function (item) {
            var src = item.src[0];
            var desc = item.dest;
            if (desc.indexOf(".") < 0) {
                grunt.file.mkdir(path.join(".tmp/compress", desc));
                return;
            }
            var arr = desc.split(/\/|\\/);
            var basename = arr.pop();
            var type = arr[0];
            grunt.file.copy(src, path.join(".tmp/compress", desc), {
                encoding: "utf8",
                process: function (content) {
                    var p = arr.slice(2);
                    var bp = basename.replace(type + "-", "").replace(".js", "");
                    if (/\.tpl$/.test(src)) {
                        bp += "-tpl";
                    }
                    p.push(bp);
                    p.unshift("hybrid");
                    if (/\.tpl$/.test(src)) {
                        return 'define("' + p.join("/") + '", ' + tpl.run(content) + ');'
                    } else {
                        return 'define("' + p.join("/") + '", function (require, exports, module) {\n' + content.replace(match, function () {
                            return "require(\"" + arguments[1].replace(type + "-", "").replace(".tpl", "-tpl") + "\")";
                        }) + '\n});'
                    }
                }
            });
        });
    });

    grunt.task.registerTask("easy-hybrid-rescue", "clean and rescue the old config", function () {
        grunt.config.init(grunt.config.get("_back"));
    });


    grunt.task.registerMultiTask("hybrid", "an javascript development approach base on cordova-js", function () {
        var me = this;
        var tasks = ["copy:lib", "copy:source", "copy:platform", "clean:ora", "easy-hybrid-rename"];//任务列表
        var lib_path = me.data.lib || "merge";
        var pkg = me.data.pkg;
        var config = {
            _back: grunt.config.get(),//缓存现有文件
            clean: {
                ora: [".tmp/ora"]
            },
            copy: {
                lib: filterLirary(lib_path, pkg),//归并基础库
                source: {//归并项目资源文件
                    files: [
                        {
                            expand: true,
                            cwd: 'src/' + me.target + "/",
                            src: ["**", "!init.js", "!package.js", "!**/css/**"],
                            dest: '.tmp/ora/js/view',
                            filter: createFilter(pkg, false, "")
                        },
                        {
                            expand: true,
                            cwd: 'src/' + me.target + "/",
                            src: ["init.js"],
                            dest: '.tmp/ora/js/',
                            filter: createFilter(pkg, false, "")
                        }
                    ]
                },
                platform: {//提取各平台文件
                    files: [
                        {
                            expand: true,
                            cwd: '.tmp/ora/',
                            src: ["**"],
                            dest: '.tmp/source/dev/',
                            filter: createFilter(pkg, false, "web")
                        }
                    ]
                }
            }
        };
        //归并项目资源文件
        var flist = fs.readdirSync(path.join(process.cwd(), 'src', me.target));
        flist.forEach(function (item) {
            config.copy.source.files.push({
                expand: true,
                cwd: 'src/' + me.target + "/" + item + "/css/",
                src: ["**"],
                dest: '.tmp/ora/css/',
                filter: createFilter(pkg, false, "")
            });
        });
        //提取各平台文件
        pkg.platform.forEach(function (item) {
            config.copy.platform.files.push({
                expand: true,
                cwd: '.tmp/ora/',
                src: ["**"],
                dest: '.tmp/source/' + item + "/",
                filter: createFilter(pkg, false, item)
            });
        });
        grunt.config.init(config);
        tasks.push("easy-hybrid-rescue");
        grunt.task.run(tasks);
    });

    /**
     * 基础库复制条件生成
     * @param lib_path 库路径类型
     * @param pkg 程序配置包
     * @returns {object} 过滤函数
     */
    function filterLirary(lib_path, pkg) {
        var copy = {files: []};
        var flag = false;
        var filter = createFilter(pkg, true, "");
        if (lib_path === "package" || lib_path === "merge") {
            copy.files.push({
                expand: true,
                cwd: 'node_modules/easy-hybrid/src/lib/',
                src: ["**", "!**/css/**"],
                dest: '.tmp/ora/js/',
                filter: filter
            });
            copy.files.push({
                expand: true,
                cwd: 'node_modules/easy-hybrid/src/lib/css/',
                src: ["**"],
                dest: '.tmp/ora/css',
                filter: filter
            });
            flag = true;
        }
        if (lib_path === "project" || lib_path === "merge") {
            copy.files.push({
                expand: true,
                cwd: 'src/lib/',
                src: ["**", "!**/css/**"],
                dest: '.tmp/ora/js/',
                filter: filter
            });
            copy.files.push({
                expand: true,
                cwd: 'src/lib/css/',
                src: ["**"],
                dest: '.tmp/ora/css/',
                filter: filter
            });
            flag = true;
        }
        if (!flag) {
            copy.files.push({
                expand: true,
                cwd: lib_path,
                src: ["**", "!**/css/**"],
                dest: '.tmp/ora/js/',
                filter: filter
            });
            copy.files.push({
                expand: true,
                cwd: lib_path + "css/",
                src: ["**"],
                dest: '.tmp/ora/css/',
                filter: filter
            });
        }
        return copy;
    }

    /**
     * 用于生成复制过滤函数
     * @param {object} pkg 程序配置包
     * @param {bool} isLib 是不是库
     * @param {string} platform 平台
     * @returns {Function} 过滤函数
     */
    function createFilter(pkg, isLib, platform) {
        var plats = "";
        if (pkg.cordova) {//过滤掉所有的cordova开头的文件
            plats += "cordova-|";
        }
        if (platform) {
            pkg.platform.forEach(function (item) {
                if (item === platform) {
                    return;
                }
                plats += item + "-|";
                plats += "cordova-" + item + "-|";
            });
        }
        plats = plats.slice(0, -1);
        var match = new RegExp("^(" + plats + ")");
        if (isLib) {
            return function (src) {
                if (src.indexOf(".") < 0) {
                    return true;
                }
                var arr = src.split(/\/|\\/);
                var basename = (arr.pop() || "").split(".")[0] || "";
                var type = arr.pop() || "";
                return !(type in pkg) || pkg[type].include.indexOf(basename) >= 0 || !(pkg[type].exclude.indexOf(basename) >= 0 || plats && match.test(basename));
            }
        }
        else {
            return function (src) {
                if (src.indexOf(".") < 0) {
                    return true;
                }
                var arr = src.split(/\/|\\/);
                var basename = (arr.pop() || "").split(".")[0] || "";
                return !plats || !match.test(basename)
            }
        }
    }
};

