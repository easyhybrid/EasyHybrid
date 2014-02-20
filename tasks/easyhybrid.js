module.exports = function (grunt) {
    grunt.task.registerMultiTask("easyhybrid", "an javascript development approach base on cordova-js", function () {
        var data = this.data;
        grunt.config.aaa = this.target;
        console.log(grunt.config);
    });
};