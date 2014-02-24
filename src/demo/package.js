/**
 * Created by 清月_荷雾 on 14-2-20.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * 编译文件配置
 * @note 本文件用于配置本项目中所使用或不使用的插件,以减少代码在编译后的大小，请注意包含在优先级高于不包含高于没有指定
 * @note 关于exports.cordova参数的说明
 * @note true 如果您设置此参数为true,您需要注意以下几点：
 *    1、通过将cordova相关插件放在cordova_plugin中的方式来使用他们，
 *    2、将cordova.js和cordova_plugin.js添加到sources.js中
 *    3、将cordova.js和cordova_plugin.js以及相关插件目录添加到实际部署的项目中
 *    4、为您提供一个不带有cordova.js的dev版本以方便调试，但是不保证在dev版本中可以使用cordova提供的功能，可能需要在真机上进行测试
 *    5、自动排除所有以cordova-开头的ui、plugin和patch，即使手动将他们添加到include中
 *    6、提供一个require.js来加载模块，代码会与cordova完全分离并以保证自己的使用方式
 *
 * @note false 如果您设置此参数为false ,您需要注意以下几点：
 *    1、为所支持的版本提供相应的cordova.js，但是可能没有cordova_plugin.js
 *    2、部分功能可能暂时没有对应的插件支持
 *    3、为所有的web和dev版本提供proxy插件（一般放在patch中），以保证在web版本的cordova中使用cordova的部分功能，但是它可能只是一个简单的提示
 *    4、使用cordova.define和cordova.require来加载模块
 *    5、监视channel.onNativeReady事件而非document的deviceready事件，以加快加载速度
 *    6、提供更多的插件支持
 */

module.exports = {
    cordova: false,//是否使用cordova
    platform: ["android", "web", "ios"],//部署时的目标平台，要注意的是，系统会自动生成一个名为dev的平台来提供调试，使用的配置与web相同
    proxy: "/",//dev版本使用的HTTP请求代理地址（用于解决跨域请求问题），默认为/（供proxy-server使用）
    "package": {//项目的简介，本项目中的内容会出现在core.config中
        name: "EasyHybrid演示项目",
        author: "赤菁风铃"
    },
    patch: {//用于为系统添加方法或者统一不同平台之间的接口差距，以保证页面开发逻辑的统一
        include: [],
        exclude: []
    },
    plugin: {//系统中使用的工具函数
        include: [],
        exclude: []
    },
    util: {//系统中使用到的实用工具，请注意exclude EventEmmiter和util会导致代码异常
        include: [],
        exclude: []
    },
    ui: {//系统中使用到的UI组件，请注意exclude UIObject和UIView会导致代码异常
        include: [],
        exclude: []
    },
    sources: {//需要额外添加的其它CSS或者JS库，当cordova，当为true时,请在此添加cordova-plugin.js，cordova在创建工程时会自动将他们添加到工程中,cordova.js会自动添加
        css: [],
        js: []
    }
};