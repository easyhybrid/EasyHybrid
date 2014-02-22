/**
 * Created by 清月_荷雾 on 14-2-20.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * 编译文件配置
 * @note 本文件用于配置本项目中所使用或不使用的插件,以减少代码在编译后的大小，请注意包含在优先级高于不包含高于没有指定
 */

module.exports = {
    cordova: false,//是否使用cordova，当为true时，plugin和patch下所有以cordova-开头的插件将会被exclude，同时在项目编译时会使用cordova自带的引导方式进行引导
    enable: true,//是否开启项目，当为false时，将不会编译此项目
    "package": {//项目的简介，本项目中的内容会出现在core.config中
        name: "EasyHybrid演示项目",
        author: "赤菁风铃"
    },
    patch: {//用于为系统添加方法或者统一不同平台之间的接口差距，以保证页面开发逻辑的统一，当cordova为true时，请include cordova-web-fix插件
        include: [],
        exclude: []
    },
    platform: ["android", "web", "ios"],//部署时的目标平台，要注意的是，系统会自动生成一个名为dev的平台来提供调试，使用的配置与web相同
    plugin: {//系统中使用的工具函数
        include: [],
        exclude: []
    },
    proxy: "/abc/123",//dev版本使用的HTTP请求代理地址（用于解决跨域请求问题）
    sources: {//需要额外添加的其它CSS或者JS库，当cordova，当为true时,请在此添加cordova.js和cordova-plugin.js，cordova在创建工程时会自动将他们添加到工程中
        css: [],
        js: []
    },
    ui: {//系统中使用到的UI组件，请注意UIObject和UIView将会被忽略
        include: [],
        exclude: []
    }
};