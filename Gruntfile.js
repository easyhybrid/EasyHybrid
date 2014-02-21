module.exports = function (grunt) {
    grunt.config.init({
        base: process.cwd(),
        hybrid: {
            demo: {
                lib: "project",//使用base/src/lib作为基础库，为package时，会使用base/node_modules/easy-hybrid/src/lib作为基础库，为merge时，会对两者进行归并
                //lib:"package",//使用base/src/lib作为基础库
                //lib:"merge",//会对project和package进行归并，这个是默认选项
                //lib:"./aaa/lib"//使用自定义路径
                pkg: require("./src/demo/package.js")//项目的配置信息，示例使用了JS文件以便于说明用法，其它项目可直接使用JSON文件,也可以写在Gruntfile内
            },
            demo2: {
                lib: "project",//使用base/src/lib作为基础库，为package时，会使用base/node_modules/easy-hybrid/src/lib作为基础库，为merge时，会对两者进行归并
                //lib:"package",//使用base/src/lib作为基础库
                //lib:"merge",//会对project和package进行归并，这个是默认选项
                //lib:"./aaa/lib"//使用自定义路径
                pkg: require("./src/demo2/package.js")//项目的配置信息，示例使用了JS文件以便于说明用法，其它项目可直接使用JSON文件,也可以写在Gruntfile内
            }
        }
    });

    grunt.task.loadTasks("tasks");

    grunt.task.registerTask("default", "hybrid:demo");
};