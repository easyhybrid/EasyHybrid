/**
 * Created by 清月_荷雾 on 14-2-10.
 * author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * @note 快速创建页面的方法
 */
var core = require("../core"),
    ui = core.ui,
    util = require("../util/util"),
    dom = require("../util/dom"),
    UIObject = require("./UIObject").UIObject,
    rhttp = /^http:/i,
    ruiprefix = /^UI[A-Z]]/;

/**
 * 根据一个配置对象创建一个UIObject类对象
 * @param obj {*} 要创建的对象
 * @param [names] {} 根据名称返回对象引用
 * @returns {*}
 */
function create(obj, names) {
    if (obj instanceof UIObject) {
        return obj;
    }
    if (!obj || typeof obj === "string" || obj.nodeType) {
        return new UIObject(obj);
    }
    var type, UIType, result;
    if (typeof (type = obj.type) === "string") {
        if (!ruiprefix.test(type)) {
            type = "UI" + type[0].toUpperCase() + type.slice(1);
        }
        UIType = ui[type] || UIObject;
    } else {
        UIType = type || UIObject;
    }
    result = new UIType(obj.args);
    util.each(obj, function (x, item) {
        if (x !== "children" && x !== "args" && x !== "type" && x !== "listeners" && x !== "name") {
            result.on(x, item);
        }
    });
    if (obj.listeners) {
        var listeners = obj.listeners;
        if (!util.isArray(listeners)) {
            listeners = [listeners];
        }
        util.each(listeners, function (j, item) {
            result.bind(item.target, item.type || "click", item.listener, item.selector, item.data);
        });
    }
    if (obj.name) {
        names[obj.name] = result;
    }
    if (obj.children) {
        var children = obj.children;
        if (!util.isArray(children)) {
            children = [children];
        }
        util.each(children, function (i, item) {
            result.append(create(item, names));
        });
    }
    return result;
}

exports.create = create;

/**
 * 根据属性创建一个元素
 * @param elem {HTMLElement}
 * @param [names] 根据名称返回对象引用
 * @returns {UIObject}
 */
function createItem(elem, names) {
    if (!elem) {
        return new UIObject();
    }
    var attrs = elem.attributes,
        i = attrs.length,
        results = {}, href,
        name, role, UIType, obj;

    while (i--) {
        name = attrs[i].name;
        if (name.indexOf("data-") === 0) {
            results[name.slice(5).toLowerCase()] = dom.attr(elem, name);
        }
    }

    if (dom.nodeName(elem, "a")) {
        href = dom.attr(elem, "href");
        obj = new ui.UIButton(elem);
        if (rhttp.test(href)) {
            obj.on("click", function () {
                core.browser.open(href);
            });
        } else if (href === "back") {
            obj.on("click", function (data, e) {
                e.preventDefault();
                core.href(href, results, results.style, results.transform);
            });
        } else {
            obj.on("click", function (data, e) {
                e.preventDefault();
                core.href(href, results, results.style || "back", results.transform || "horizontal");
            });
        }
        return;
    }

    if (!( role = results.role)) {
        UIType = UIObject;
    } else if (!ruiprefix.test(role)) {
        role = "UI" + role[0].toUpperCase() + role.slice(1);
        UIType = ui[role] || UIObject;
    } else {
        UIType = ui[role] || UIObject;
    }
    if (UIType === UIObject) {
        obj = new UIObject(elem);
    } else {
        results.html = elem;
        obj = new UIType(results);
    }
    if (results.name) {
        names[results.name] = obj;
    }
    return obj;
}

/**
 * 根据date-attr将一个DOM对象转换成一个UIObject对象（保持树结构）
 * @param elem {HTMLElement} 要创建的对象
 * @param [names] {} 根据名称返回对象引用
 * @returns {*}
 */
function tree(elem, names) {
    if (typeof elem === "string") {
        elem = dom.parse(elem)[0];
    }
    var root = createItem(elem, names),
        arr = [].slice.call(elem.childNodes);
    util.each(arr, function (i, item) {
        if (item.nodeType === 3 && util.trim(item.textContent)) {
            root.add(new UIObject(item));
        } else if (item.nodeType === 1 && (dom.attr(item, "data-tree") === "false" || dom.find("[data-role],[data-name],a", item).length === 0)) {
            root.add(load(item, names));
        } else if (item.nodeType === 1) {
            root.add(tree(item, names));
        }
    });
    return root;
}
exports.tree = tree;

/**
 * 根据date-attr将一个DOM对象转换成一个UIObject对象
 * 此方法将不会建立一个树形结构，但是会有更多快的速度和更小的内存占用
 * @param elem {HTMLElement} 要创建的对象
 * @param [names] {} 根据名称返回对象引用
 * @returns {*}
 */
function load(elem, names) {
    if (typeof elem === "string") {
        elem = dom.parse(elem)[0];
    }
    var root = createItem(elem, names);
    util.each(dom.find("[data-role],[data-name],a", elem), function (i, item) {
        root.add(createItem(item, names));
    });
    return root;
}
exports.load = load;
