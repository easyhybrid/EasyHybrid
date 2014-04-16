/**
 * Created by 清月_荷雾 on 14-2-16.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * 核心工具类
 * @note 其它模块不要引入本文件，这是最高级文件
 */

//region 插件相关

var utils = {},//实用工具(零散，公用以及与WEB直接相关的工具会直接放在这里，请注意这不是硬性规定，util，ui，plugin的关系是对等的)
    util = require("./util/util"),//引入本对象所必须的工具信息
    plugins = {}, //插件工具（通常和平台相关或者来源自cordova的工具会出现在这里，请注意这不是硬性规定，util，ui，plugin的关系是对等的）
    ui = {};//UI相关工具（通常用来构成页面结构的控件会出现在UI目录中，请注意这不是硬性规定，util，ui，plugin的关系是对等的）

/**
 * 注册相关插件
 * @param type 注册类型（可以是实用工具、插件工具或者UI相关工具）
 * @param obj 注册的对象
 */
function register(type, obj) {
    if (type === "util") {//实用工具
        util.merge(utils, obj);
    } else if (type === "plugin") {//注入插件工具
        util.merge(plugins, obj);
    } else if (type === "ui") {//注入UI相关工具
        util.merge(ui, obj);
    } else {
        console.log("未知的注册类型：" + type);
    }
}
exports.register = register;
exports.util = utils;//暴露实用工具
exports.plugin = plugins;//暴露插件工具
exports.ui = ui;//暴露UI相关工具

//endregion 插件相关

//region 视图相关功能

var view = {},//页面列表（只接受能生成UIView、UIView的子类以及与UIView有相同结构的对象的函数，给core.href和core.back函数使用）
    widget = {},//页面组件对象
    dom = require("./util/dom"),//DOM操作工具
    backStack = [],//回退栈
    current = null,//当前页面
    zindex = 10001,
    transformStyles = ["horizontal-in", "vertical-in", "pop-in", "fade-in", "horizontal-out", "vertical-out", "pop-out", "fade-out"].join(" "),//所有需要在重新加载时移除的样式
    root = dom.createDom(''
        + '<div class="absolute full-screen" style="z-index: 10000;">'
        + '    <div class="absolute full-screen hidden" style="z-index: 40000"></div>'
        + '</div>'
    ),//页面的根元素
    prevent = root.firstChild;//用于在页面切换过程中阻止事件的元素

document.body.appendChild(root);//绑定root元素
exports.root = root;//根元素

/**
 * 导航页面到name
 * @param name 页面的名称，为back时回退页面
 * @param [data] 导航数据
 * @param [options] 配置参数
 */
function href(name, data, options) {
    if (name === "back") {//回退快捷方式
        back(data, options);
        return;
    }
    data = data || null;
    options = options || {};
    //取出构造函数并执行校验
    var createFunc = view[name];
    if (!createFunc || typeof (createFunc) !== "function") {
        console.log("名称为：" + name + "的页面不存在");
        return;
    }
    try {
        var i = 0;
        dom.removeClass(prevent, "hidden");//打开阻止层
        createFunc(exports, data, function (item) {
            item._dom.style.zIndex = zindex++;
            var style = item.style = options.style || "none";//页面样式
            function done() {
                item.emitAll("load");
                //从dom树上摘除当前页
                if (style !== "frame" && current) {
                    current.detach();
                }
                if (style === "switch" && current && current.style === "switch") {
                    current.destroy(true);
                    current = null;
                } else if (style === "switch") {
                    for (i = backStack.length - 1; i >= 0; i++) {
                        if (backStack[i].style === "switch") {
                            var arr = backStack.splice(i, backStack.length - i);
                            for (var j = 0; j < arr.length; j++) {
                                arr[j].destroy(true);
                            }
                            current.destroy(true);
                            current = null;
                            break;
                        }
                    }
                }
                if (current) {
                    backStack.push(current);//缓存当前页
                }
                current = item;//重新指定当前页
                //检查回退标识并释放资源
                if (style === "none") {
                    for (i = 0; i < backStack.length; i++) {
                        backStack[i].destroy(true);
                    }
                    backStack = [];
                }
                dom.addClass(prevent, "hidden");//关闭阻止层
            }

            dom.removeClass(item._dom, transformStyles);
            var transform = item.transform = options.transform || "none";
            if (transform !== "none") {
                dom.addClass(item._dom, transform + "-in");
                setTimeout(done, 400);
                item.attach(root);
            } else {
                item.attach(root);
                done();
            }
        });//构造页面（这一步可能出现异常）
    } catch (e) {
        dom.addClass(prevent, "hidden");//关闭阻止层
        console.log("创建页面时出错：" + e.message);
    }
}
exports.href = href;

/**
 * 回退页面
 * @param data 导航数据
 * @param [options] 配置参数
 */
function back(data, options) {
    options = options || {};
    if (backStack.length === 0 || !current || current.style === "none") {//已经回退完毕
        return;
    }
    var item = current;
    var style = options.style || item.style || "none";//页面样式
    dom.removeClass(prevent, "hidden");//打开阻止层
    current = backStack.pop();//获取上一页面
    dom.removeClass(current._dom, transformStyles);
    if (style !== "frame") {
        current.attach(root);//恢复当前页
    }
    current.emit("back", data);//触发回退页面的back事件
    function done() {
        item.emitAll("unload");
        item.destroy(true);//销毁页面元素，并清理元素内部的事件，释放内存
        dom.addClass(prevent, "hidden");//关闭阻止层
    }

    dom.removeClass(item._dom, transformStyles);
    var transform = options.transform || item.transform || "none";

    if (transform !== "none") {
        dom.addClass(item._dom, transform + "-out");
        setTimeout(done, 400);
    } else {
        done();
    }
}
exports.back = back;

/**
 * 注册视图函数
 * @param {string} name 视图名通常会是user/index这样的名字
 * @param {function} createFunc 视图函数
 */
function registerView(name, createFunc) {
    view[name] = createFunc;
}
exports.registerView = registerView;

/**
 * 获取一个导航条
 * @param name 导航条名称
 */
function getWidget(name) {
    return widget[name] || null;
}
exports.getWidget = getWidget;

/**
 * 注册导航条函数
 * @param name 导航条名称
 * @param obj 导航条对象
 */
function registerWidget(name, obj) {
    widget[name] = obj;
    obj.attach(root);
}
exports.registerWidget = registerWidget;
//endregion 视图相关功能
