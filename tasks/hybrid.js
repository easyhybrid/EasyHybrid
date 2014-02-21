var fs = require("fs");
var path = require("path");
module.exports = function (grunt) {

    grunt.task.registerTask("easy-hybrid-lib", "fetch each projects", function () {

    });

    grunt.task.registerTask("versions", function () {
        console.log(grunt.config.data);
    });
    grunt.task.loadNpmTasks("grunt-contrib-clean");
    grunt.task.loadNpmTasks("grunt-contrib-concat");
    grunt.task.loadNpmTasks("grunt-contrib-copy");
    grunt.task.loadNpmTasks("grunt-contrib-cssmin");
    grunt.task.loadNpmTasks("grunt-contrib-uglify");
    grunt.task.registerTask("easy-hybrid-rescue", "clean and rescue the old config", function () {
        grunt.config.init(grunt.config.get("_back"));
    });

    grunt.task.registerMultiTask("hybrid", "an javascript development approach base on cordova-js", function () {
        var tasks = [];//任务列表
        var config = {
            _back: grunt.config.get(),//缓存现有文件
            copy: {}//复制文件任务

        };//配置文件
        var lib_path = this.data.lib || "merge";
        var flag = false;
        if (lib_path === "package" || lib_path === "merge") {
            config.copy.lib_package = {
                cwd: 'node_modules/easy-hybrid/src/lib/',
                src: ["**"],
                dest: '.tmp/lib_ora_unfilter/'
            };
            flag = true;
            tasks.push("copy:lib_package");
        }
        if (lib_path === "project" || lib_path === "merge") {
            config.copy.lib_project = {
                cwd: 'src/lib/',
                src: ["**"],
                dest: '.tmp/lib_ora_unfilter/'
            };
            flag = true;
            tasks.push("copy:lib_project");
        }
        if (!flag) {
            config.copy.lib_user = {
                cwd: lib_path,
                src: ["**"],
                dest: '.tmp/lib_ora_unfilter/'
            };
            tasks.push("copy:lib_user");
        }
        var pkg = this.data.pkg;
        grunt.config.init(config);
        tasks.push("easy-hybrid-rescue");
        grunt.task.run(tasks);
    });

};

