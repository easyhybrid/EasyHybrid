/**
 * Created by 清月_荷雾 on 14-2-16.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * 核心工具类（所有相关插件会注入到此文件中）
 */

var ui = exports.ui = {},//UI元素
    widget = exports.widget = {},//组件
    view = exports.view = {},//页面
    util = require("./util/util"),
    dom = require("./util/dom"),
    UIObject = require("./ui/UIObject").UIObject,
    root = new UIObject('<div class="absolute full-screen" style="z-index: 10000;"></div>');
var prevent = false,//用于在页面切换过程中阻止事件的元素
    backStack = [],//回退栈
    current = null,//当前页面
    transformStyles = ["horizontal-in", "vertical-in", "pop-in", "fade-in", "horizontal-out", "vertical-out", "pop-out", "fade-out"].join(" "),//要清除的样式
    zindex = 10001;//页面的z-index
//init
root.attach(document.body);



//
//
//var util = exports.util = require("./util/util"),//基础工具函数（此工具无法被排除）
//    dom = exports.dom = require("./util/dom"),//DOM操作工具（此工具无法被排除）
//    ui = exports.ui = {},//ui元素类（构建页面所需要的元素类）
//    widget = exports.widget = {},//公用组件（比如菜单，loading，常规错误处理）等放在这里面
//    view = exports.view = {},//视图类（用于保存实现页面的基本逻辑）
//    root = exports.root = dom.parse('<div class="absolute full-screen" style="z-index: 10000;"></div>')[0],//页面的根元素;
//    prevent = false,//用于在页面切换过程中阻止事件的元素
//    backStack = [],//回退栈
//    current = null,//当前页面
//    transformStyles = ["horizontal-in", "vertical-in", "pop-in", "fade-in", "horizontal-out", "vertical-out", "pop-out", "fade-out"].join(" "),//要清除的样式
//    zindex = 10001;//页面的z-index
//
//exports.plugin = require("./plugin/plugin"); //基础插件工具（此工具无法被排除）
//document.body.appendChild(root);//绑定root元素
//
/**
* 注册相关插件
* @param type 注册类型（请注意规避plugin、ui、view、widget、root、register、href、back、config）另外请确保plugin与util不会重复，否则会发生覆盖
* @param obj 注册的对象
*/
function register(type, obj) {
    if (type === "ui") {//注入UI相关工具
        util.merge(ui, obj);
    } else if (type === "widget") {//注入公用组件
        widget[obj] = arguments[2];
    } else if (type === "view") {//注入视图
        view[obj] = arguments[2];
    } else {//注册其它使用工具或者插件，请注意是系统保留控件，请不要使用这几个名字
        //排除所有与系统函数重名的插件，加快效率
        if (type in exports) {
            return;
        }
        exports[type] = obj;
    }
}
exports.register = register;

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
    if (prevent) {
        return;
    }
    data = data || null;
    options = options || {};
    //取出构造函数并执行校验
    var createFunc = view[name];
    if (!createFunc || typeof (createFunc) !== "function") {
        window.console.log("名称为：" + name + "的页面不存在");
        return;
    }
    try {
        var i = 0;
        prevent = true;
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
                prevent = false;
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
        prevent = false;
        window.console.log("创建页面时出错：" + e.message);
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
    if (prevent || backStack.length === 0 || !current || current.style === "none") {//已经回退完毕
        return false;
    }
    prevent = true;
    var item = current;
    var style = options.style || item.style || "none";//页面样式
    current = backStack.pop();//获取上一页面
    dom.removeClass(current._dom, transformStyles);
    if (style !== "frame") {
        current.attach(root);//恢复当前页
    }
    current.emit("back", data);//触发回退页面的back事件
    function done() {
        item.emitAll("unload");
        item.destroy(true);//销毁页面元素，并清理元素内部的事件，释放内存
        prevent = false;
    }

    dom.removeClass(item._dom, transformStyles);
    var transform = options.transform || item.transform || "none";

    if (transform !== "none") {
        dom.addClass(item._dom, transform + "-out");
        setTimeout(done, 400);
    } else {
        done();
    }
    return true;
}
exports.back = back;
