/**
 * Created by 清月_荷雾 on 14-2-16.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * 核心工具类（所有相关插件会注入到此文件中）
 */

var core = {},//核心类
    util = core.util = require("./util/util"),
    dom = core.dom = require("./util/dom"),
    ui = core.ui = {},//页面框架对象
    widget = core.widget = {},//页面公用组件
    view = core.view = {},//所有视图
    transforms = {//页面切换样式（默认提供了fade、pop、horizontal、vertical四种样式，可自定义）
        fade: {
            href: "fade-in",
            back: "fade-out"
        },
        pop: {
            href: "pop-in",
            back: "pop-out"
        },
        horizontal: {
            href: "horizontal-in",
            back: "horizontal-out"
        },
        vertical: {
            href: "vertical-in",
            back: "vertical-out"
        },
        none: {
            href: "",
            back: ""
        }
    },
    transformString = "",
    root = core.root = dom.parse('<div class="absolute full-screen" style="z-index: 10000;"></div>')[0],
    prevent = false,
    zindex = 10001,
    backStack = [],//回退栈
    current = null; //当前页面
/**
 * 重新生成transformString
 * @private
 */
function _fixTransformString() {
    var arr = [], i;
    for (i in transforms) {
        if (transforms.hasOwnProperty(i)) {
            arr.push(transforms[i].href);
            arr.push(transforms[i].back);
        }
    }
    transformString = arr.join(" ");
}

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
    } else if (type === "transform") {//注入切换样式
        transforms[obj] = arguments[2];
        _fixTransformString();
    } else {//注册其它使用工具或者插件，请注意是系统保留控件，请不要使用这几个名字
        //排除所有与系统函数重名的插件，加快效率
        if (type in core) {
            return;
        }
        core[type] = obj;
    }
}
core.register = register;

/**
 * 导航页面到name
 * @param name 页面的名称，为back时回退页面
 * @param [data] 导航数据
 * @param [style] {string} 页面的切换类型
 * @param [transform] {string} 页面切换的样式
 */
function href(name, data, style, transform) {
    if (prevent) {
        return;
    }
    if (name === "back") {//回退快捷方式
        back(data, style, transform);
        return;
    }
    try {
        var createFunc = view[name],
            i = 0;
        prevent = true;
        createFunc(core, data, function (item) {
            dom.style(item._dom, "z-index", zindex++);
            style = item._style = style || "none";//页面样式

            function done() {
                var arr, j;
                item.emit("load");
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
                            arr = backStack.splice(i, backStack.length - i);
                            for (j = 0; j < arr.length; j++) {
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

            dom.removeClass(item._dom, transformString);
            transform = item._transform = transform || "none";
            if (transform !== "none") {
                dom.addClass(item._dom, transforms[transform].href);
                setTimeout(done, 400);
                item.attach(root);
            } else {
                item.attach(root);
                done();
            }
        });
    } catch (e) {
        prevent = false;
        window.console.log("创建页面时出错：" + e.message);
    }
}
core.href = href;

/**
 * 回退页面
 * @param data 导航数据
 * @param [style] {string} 页面的切换类型
 * @param [transform] {string} 页面切换的样式
 */
function back(data, style, transform) {
    if (prevent || backStack.length === 0 || !current || current.style === "none") {//已经回退完毕
        return false;
    }
    prevent = true;

    var item = current;
    style = style || item._style || "none";//页面样式
    current = backStack.pop();//获取上一页面
    dom.removeClass(current._dom, transformString);
    if (style !== "frame") {
        current.attach(root);//恢复当前页
    }
    current.emit("back", data);//触发回退页面的back事件
    function done() {
        item.emit("unload");
        item.destroy(true);//销毁页面元素，并清理元素内部的事件，释放内存
        prevent = false;
    }

    dom.removeClass(item._dom, transformString);
    transform = transform || item._transform || "none";

    if (transform !== "none") {
        dom.addClass(item._dom, transforms[transform].back);
        setTimeout(done, 400);
    } else {
        done();
    }
    return true;
}
core.back = back;

//init
core.plugin = require("./plugin/plugin");
_fixTransformString();
document.body.appendChild(root);
module.exports = core;
