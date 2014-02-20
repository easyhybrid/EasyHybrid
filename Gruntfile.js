var fs = require("fs");
var path = require("path");
module.exports = function (grunt) {
    var root = path.join(process.cwd(), "src");
    var projects = {};
    var fileList = fs.readdirSync(root);
    fileList.forEach(function (item) {
        var state = fs.statSync(path.join(root, item));
        if (item === "lib" || state.isFile()) {
            return;
        }
        var pack = require(path.join(root, item, "package"));
        if (pack.enable) {
            projects[item] = {
                pkg: pack
            };
        }
    });

    grunt.config.init({
        easyhybrid: projects
    });
    grunt.task.loadTasks("tasks");
    grunt.task.registerTask('default', ["easyhybrid"]);
};