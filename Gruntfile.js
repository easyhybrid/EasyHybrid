//本配置仅用于示例，为了方便开发，搭建了一个简单的server，会在正式完成后去除，watch不是本项目必须的插件
module.exports = function (grunt) {
    grunt.config.init({
        base: process.cwd(),
        hybrid: {
            demo: {
                lib: "project",//使用base/src/lib作为基础库，为package时，会使用base/node_modules/easy-hybrid/src/lib作为基础库，为merge时，会对两者进行归并
                pkg: require("./src/demo/package.js")//项目的配置信息，示例使用了JS文件以便于说明用法，其它项目可直接使用JSON文件,也可以写在Gruntfile内
            }
        },
        watch: {
            all: {
                files: ['src/lib/**'],
                tasks: ['hybrid']
            },
            demo: {
                files: ['src/demo/**'],
                tasks: ['hybrid:demo']
            }
        },
        "proxy-server": {
            "demo": {
                port: 3000,//用于监听的端口，如果本地文件存在，则会返回build/{%name}/dev中的文件，否则使用代理获取远程数据
                target: "http://soft.hnu.edu.cn",//远程代理目标
                host: "soft.hnu.edu.cn"
            }
        }
    });
    grunt.task.loadNpmTasks("grunt-contrib-watch");
    grunt.task.loadTasks("tasks");
    grunt.task.registerTask("default", [ "proxy-server:demo", "watch"]);
};