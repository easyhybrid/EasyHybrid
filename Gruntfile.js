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
        hybrid: {//进行项目编译
            demo: {
                cordova: false,//是否使用cordova，关开此参数，请参考头部的注释信息
                lib: "",//使用的代码基础库所在位置，如果没有此参数或者值相当于false，都认为是src/lib/
                develop: {//调试配置信息，如果没有此参数或者值相当于false，都认为是不生成开发版本
                    enable: true,
                    proxy: "/"//开发代理信息，如果没有此参数或者值相当于false，都认为是不生成代理（此参数仅供开发使用）
                },
                name: "Easy Hybrid",
                platforms: ["android", "web", "ios"],//需要的目标平台，目前支持"android", "web", "ios"，以后会陆续添加
                patch: ["viewport-pad", "improve-sizzle", "improve-jquery" , "improve-array"],//用于屏蔽用不到的patch插件，请注意平台不匹配的插件已经自动屏蔽
                util: [],//用于屏蔽用不到的util插件，请注意平台不匹配的插件已经自动屏蔽
                plugin: [],//用于屏蔽用不到的plugin插件，请注意平台不匹配的插件已经自动屏蔽
                ui: [],//用于屏蔽用不到的ui插件，请注意平台不匹配的插件已经自动屏蔽
                sources: {//需要额外添加的其它CSS或者JS库，当cordova，当为true时,请在此添加cordova.js和cordova_plugin.js
                    css: [],
                    js: [/*"js/setting.js"*/]
                }
            },
            template: {
                cordova: false,//是否使用cordova，关开此参数，请参考头部的注释信息
                lib: "",//使用的代码基础库所在位置，如果没有此参数或者值相当于false，都认为是src/lib/
                develop: {//调试配置信息，如果没有此参数或者值相当于false，都认为是不生成开发版本
                    enable: true,
                    proxy: "/"//开发代理信息，如果没有此参数或者值相当于false，都认为是不生成代理（此参数仅供开发使用）
                },
                name: "企业展示模板",
                platforms: ["android", "web", "ios"],//需要的目标平台，目前支持"android", "web", "ios"，以后会陆续添加
                patch: ["viewport-pad", "improve-sizzle", "improve-jquery" , "improve-array"],//用于屏蔽用不到的patch插件，请注意平台不匹配的插件已经自动屏蔽
                util: [],//用于屏蔽用不到的util插件，请注意平台不匹配的插件已经自动屏蔽
                plugin: [],//用于屏蔽用不到的plugin插件，请注意平台不匹配的插件已经自动屏蔽
                ui: [],//用于屏蔽用不到的ui插件，请注意平台不匹配的插件已经自动屏蔽
                sources: {//需要额外添加的其它CSS或者JS库，当cordova，当为true时,请在此添加cordova.js和cordova_plugin.js
                    css: [],
                    js: [/*"js/setting.js"*/]
                }
            },
            "live-working": {
                cordova: false,//是否使用cordova，关开此参数，请参考头部的注释信息
                lib: "",//使用的代码基础库所在位置，如果没有此参数或者值相当于false，都认为是src/lib/
                develop: {//调试配置信息，如果没有此参数或者值相当于false，都认为是不生成开发版本
                    enable: true,
                    proxy: "/"//开发代理信息，如果没有此参数或者值相当于false，都认为是不生成代理（此参数仅供开发使用）
                },
                name: "中国带电作业网",
                platforms: ["android", "web", "ios"],//需要的目标平台，目前支持"android", "web", "ios"，以后会陆续添加
                patch: ["viewport-pad", "improve-sizzle", "improve-jquery" , "improve-array"],//用于屏蔽用不到的patch插件，请注意平台不匹配的插件已经自动屏蔽
                util: [],//用于屏蔽用不到的util插件，请注意平台不匹配的插件已经自动屏蔽
                plugin: [],//用于屏蔽用不到的plugin插件，请注意平台不匹配的插件已经自动屏蔽
                ui: [],//用于屏蔽用不到的ui插件，请注意平台不匹配的插件已经自动屏蔽
                sources: {//需要额外添加的其它CSS或者JS库，当cordova，当为true时,请在此添加cordova.js和cordova_plugin.js
                    css: [],
                    js: [/*"js/setting.js"*/]
                }
            },
            wesou: {
                cordova: false,//是否使用cordova，关开此参数，请参考头部的注释信息
                lib: "",//使用的代码基础库所在位置，如果没有此参数或者值相当于false，都认为是src/lib/
                develop: {//调试配置信息，如果没有此参数或者值相当于false，都认为是不生成开发版本
                    enable: true,
                    proxy: "/"//开发代理信息，如果没有此参数或者值相当于false，都认为是不生成代理（此参数仅供开发使用）
                },
                name: "位搜",
                platforms: ["android", "web", "ios"],//需要的目标平台，目前支持"android", "web", "ios"，以后会陆续添加
                patch: ["viewport-pad", "improve-sizzle", "improve-jquery" , "improve-array"],//用于屏蔽用不到的patch插件，请注意平台不匹配的插件已经自动屏蔽
                util: [],//用于屏蔽用不到的util插件，请注意平台不匹配的插件已经自动屏蔽
                plugin: [],//用于屏蔽用不到的plugin插件，请注意平台不匹配的插件已经自动屏蔽
                ui: [],//用于屏蔽用不到的ui插件，请注意平台不匹配的插件已经自动屏蔽
                sources: {//需要额外添加的其它CSS或者JS库，当cordova，当为true时,请在此添加cordova.js和cordova_plugin.js
                    css: [],
                    js: []
                }
            }
        },
        watch: {//监视文件改动
            template: {
                files: ['src/**', 'template/**'],
                tasks: ['hybrid:template']
            },
            demo: {
                files: ['src/**', 'demo/**'],
                tasks: ['hybrid:demo']
            },
            wesou: {
                files: ['src/**', 'wesou/**'],
                tasks: ['hybrid:wesou']
            },
            "live-working": {
                files: ['src/**', 'live-working/**'],
                tasks: ['hybrid:live-working']
            }

        },
        "proxy-server": {//生成代理服务器
            template: {
                server: undefined,//server名称，一般是localhost，如果需要通过反向代理部署调试版本可修改此参数
                port: 3001//用于监听的端口，如果build/demo/dev中存在访问的文件，则会返回对应的文件，否则使用代理获取远程数据（除非必要，请不要使用代理下载文件）
            },
            wesou: {
                server: undefined,//server名称，一般是localhost，如果需要通过反向代理部署调试版本可修改此参数
                port: 3002//用于监听的端口，如果build/demo/dev中存在访问的文件，则会返回对应的文件，否则使用代理获取远程数据（除非必要，请不要使用代理下载文件）
            },
            "live-working":{
                server: undefined,//server名称，一般是localhost，如果需要通过反向代理部署调试版本可修改此参数
                port: 3004//用于监听的端口，如果build/demo/dev中存在访问的文件，则会返回对应的文件，否则使用代理获取远程数据（除非必要，请不要使用代理下载文件）
            },
            demo: {
                server: undefined,//server名称，一般是localhost，如果需要通过反向代理部署调试版本可修改此参数
                port: 3003//用于监听的端口，如果build/demo/dev中存在访问的文件，则会返回对应的文件，否则使用代理获取远程数据（除非必要，请不要使用代理下载文件）
            }
        }
    });
    grunt.task.loadNpmTasks("grunt-contrib-watch");
    grunt.task.loadTasks("tasks");
    grunt.task.registerTask("live-working", [ "hybrid:live-working", "proxy-server:live-working", "watch:live-working"]);
    grunt.task.registerTask("wesou", [ "hybrid:wesou", "proxy-server:wesou", "watch:wesou"]);
    grunt.task.registerTask("template", [ "hybrid:template", "proxy-server:template", "watch:template"]);
    grunt.task.registerTask("demo", [ "hybrid:demo", "proxy-server:demo", "watch:demo"]);
    grunt.task.registerTask("default", [ "template"]);
};
