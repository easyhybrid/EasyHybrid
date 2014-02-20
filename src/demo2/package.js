/**
 * Created by 清月_荷雾 on 14-2-20.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * 编译文件配置
 * @note 本文件用于配置本项目中所使用或不使用的插件,以减少代码在编译后的大小，请注意包含在优先级高于不包含高于没有指定
 */

module.exports = {
    cordova: {
        enable: false,//是否使用cordova，当为true时，plugin和patch下所有以cordova-开头的插件将会被exclude，同时会在非web和dev版本的index.html中追加cordova相关文件
        version: "3.0.1",//使用的版本应当大于3.0
        plugins: []//需要加载的插件列表
    },
    enable: true,//是否开启项目，当为false时，将不会编译此项目
    "package": {//项目的简介
        name: "EasyHybrid演示项目",
        author: "赤菁风铃"
    },
    patch: {//用于为系统添加方法或者统一不同平台之间的接口差距，以保证页面开发逻辑的统一
        include: [],
        exclude: []
    },
    platform: ["android", "web", "ios"],//部署时的目标平台，要注意的是，系统会自动生成一个名为dev的平台来提供调试，使用的配置与web相同
    plugin: {//系统中使用的工具函数
        include: [],
        exclude: []
    },
    sources: [//需要额外添加的远程CSS或者JS库
    ],
    ui: {//系统中使用到的UI组件，请注意UIObject和UIView将会被忽略
        include: [],
        exclude: []
    }
};