/**
 * Created by 清月_荷雾 on 14-2-16.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * 核心工具类
 * @note 其它模块不要引入本文件，这是最高级文件
 */

var util = require("./util"),//引入util工具类
    plugin = {}, //引入插件工具类
    ui = {},//UI相关工具类
    view = {},//页面列表
    tpl = {},//模型列表
    nav = {},//导航条列表
    backStack = [],//回退栈
    current = null,//当前页面
    root = util.createDom(''
        + '<div class="absolute full-screen" style="z-index: 10000;">'
        + '    <div class="absolute full-screen hidden" style="z-index: 40000"></div>'
        + '</div>'
    ),//页面的根元素
    prevent = root.firstChild;//用于在页面切换过程中阻止事件的元素

document.body.appendChild(root);//绑定root元素

/**
 * 注册页面数据
 * @param type 注册类型（可以是视图、模板、导航条、用户工具）
 * @param [name] 页面名称
 * @param obj 注册的对象
 */
function register(type, name, obj) {
    if (obj === undefined) {
        name = "";
        obj = name;
    }
    if (type === "view") {//注入视图对象
        view[name] = obj;
    }
    else if (type === "nav") {//注入导航栏对象
        nav[name] = obj;
    } else if (type === "tpl") {//注入模板对象
        tpl [name] = obj;
    } else if (type === "plugin") {//注入插件（包括系统预留插件和用户自定义插件，所有用户自定义的工具都应当写在plugin里面）
        util.merge(plugin, obj);
    } else if (type === "ui") {//注入ui组件（包括系统预留的ui组件和用户自定义的ui组件）
        util.merge(ui, obj);
    } else {
        console.log("未知的注册类型：" + type);
    }
}
exports.register = register;

/**
 * 导航页面到name
 * @param name 页面的名称，为back时回退页面
 * @param data 导航数据
 */
function href(name, data) {
    if (name === "back") {//回退快捷方式
        back(data);
        return;
    }
    //取出构造函数并执行校验
    var createFunc = view[name];
    if (!createFunc || typeof (createFunc) !== "function") {
        console.log("名称为：" + name + "的页面不存在");
        return;
    }
    try {
        util.removeClass(prevent, "hidden");//打开阻止层
        createFunc(exports, data, function (item) {
            item.load(root, function () {
                if (current) {
                    backStack.push(current);//缓存当前页
                    current.detach();//从dom树上摘除当前页
                }
                util.addClass(prevent, "hidden");//关闭阻止层
                current = item;//重新指定当前页
                if (!item.hasBack()) {//检查回退标识并释放资源
                    for (var i = 0; i < backStack.length; i++) {
                        backStack[i].destroy(true);
                    }
                    backStack = [];
                }
            });//激活当前页
        });//构造页面（这一步可能出现异常）
    } catch (e) {
        util.addClass(prevent, "hidden");//关闭阻止层
        console.log("创建页面时出错：" + e.message);
    }
}
exports.href = href;

/**
 * 回退页面
 * @param data 导航数据
 */
function back(data) {
    data = data || {};
    if (backStack.length === 0 || !current || !current.hasBack()) {//已经回退完毕
        return;
    }
    var item = current;
    util.removeClass(prevent, "hidden");//打开阻止层
    current = backStack.pop();//获取上一页面
    current.attach(root);//恢复当前页
    current.emit("back", data);//触发回退页面的back事件
    item.unload(function () {
        item.destroy(true);//销毁页面元素，并清理元素内部的事件，释放内存
        util.addClass(prevent, "hidden");//关闭阻止层
    });//删除上一页
}
exports.back = back;

/**
 * 激活导航条
 * @param navName 导航条名称
 * @param itemName 导航条项目
 */
function active(navName, itemName) {
    if (!(navName in nav)) {
        console.log("所加载的导航条不存在");
        return;
    }
    nav[navName].show();
    nav[navName].active(itemName);
}
exports.active = active;

/**
 * 渲染模板函数
 * @param tplName 模板名
 * @param [data] 数据
 * @returns {*} html字符串
 */
function render(tplName, data) {
    if (tpl.hasOwnProperty(tplName) && typeof tpl[tplName].render === "function") {
        return tpl[tplName].render(data);
    }
    console.log("渲染页面失败");
    return "";
}
exports.render = render;

exports.util = util;//暴露util接口
exports.plugin = plugin;//暴露插件接口
exports.ui = ui;//暴露ui组件接口