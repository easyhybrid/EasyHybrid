/**
 * Created by 清月_荷雾 on 14-2-20.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * Grunt配置文件示例
 * @note 关于cordova参数的说明
 * @note true 如果您设置此参数为true,您需要注意以下几点：
 *    1、通过将cordova相关插件放在cordova_plugin中的方式来使用他们，
 *    2、将cordova.js和cordova_plugin.js添加到sources.js选项中
 *    3、将cordova.js和cordova_plugin.js以及相关插件目录添加到实际部署的项目中
 *    4、dev版本不会自动添加cordova.js和cordova_plugin.js以及相关插件，您需要自己复制，并且这些文件会在下一次编译时消失
 *    5、自动排除所有以cordova-开头的ui、plugin和patch
 *    6、使用cordova.define和cordova.require来加载模块
 *
 * @note false 如果您设置此参数为false ,您需要注意以下几点：
 *    1、系统会自己实现与cordova客户端的通信，不需要引用cordova.js
 *    2、部分功能可能暂时没有对应的插件支持，但是可能会支持很多第三方
 *    3、dev版本可以正常使用，无需增加文件
 *    3、在EasyHybrid 1.0版本上线之前，我们更推荐您使用cordova自身，这样可能会减少您修改和添加插件的时间
 */
module.exports = function (grunt) {
    grunt.config.init({
        base: process.cwd(),
        hybrid: {
            demo: {
                cordova: false,//是否使用cordova，关开此参数，请参考头部的注释信息
                lib: "",//使用的代码基础库所在位置，如果没有此参数或者值相当于false，都认为是src/lib/
                develop: {//调试配置信息，如果没有此参数或者值相当于false，都认为是不生成开发版本
                    enable: true,
                    proxy: {//开发代理信息，如果没有此参数或者值相当于false，都认为是不生成代理
                        server: "49.123.82.24",//server名称，一般是localhost，如果需要通过反向代理部署调试版本可修改此参数
                        port: 80//用于监听的端口，如果build/demo/dev中存在访问的文件，则会返回对应的文件，否则使用代理获取远程数据（除非必要，请不要使用代理下载文件）
                    }//跨域请求代理，仅供开发时使用请注意端口与
                },
                name: "EasyHybrid演示项目",
                platforms: [ "ios"],//需要的目标平台，目前支持"android", "web", "ios"，以后会陆续添加
                patch: [],//用于屏蔽用不到的patch插件，请注意平台不匹配的插件已经自动屏蔽
                util: [],//用于屏蔽用不到的util插件，请注意平台不匹配的插件已经自动屏蔽
                plugin: [],//用于屏蔽用不到的plugin插件，请注意平台不匹配的插件已经自动屏蔽
                ui: [],//用于屏蔽用不到的ui插件，请注意平台不匹配的插件已经自动屏蔽
                sources: {//需要额外添加的其它CSS或者JS库，当cordova，当为true时,请在此添加cordova.js和cordova_plugin.js
                    css: [],
                    js: []
                }
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
            demo: {
                server: "49.123.82.24",//server名称，一般是localhost，如果需要通过反向代理部署调试版本可修改此参数
                port: 80//用于监听的端口，如果build/demo/dev中存在访问的文件，则会返回对应的文件，否则使用代理获取远程数据（除非必要，请不要使用代理下载文件）
            }
        }
    });
    grunt.task.loadNpmTasks("grunt-contrib-watch");
    grunt.task.loadTasks("tasks");
    grunt.task.registerTask("default", [ "hybrid:demo", "proxy-server:demo", "watch"]);
};