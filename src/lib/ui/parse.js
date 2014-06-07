/**
 * Created by 清月_荷雾 on 14-2-10.
 * author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * @note 快速创建页面的方法
 */

function create(obj) {
    obj = obj || "<div></div>";
    if (obj instanceof UIObject) {
        return obj;
    }
    if (typeof obj === "string") {
        return new UIObject(obj);
    }
    var UIType = obj.type || UIObject;
    var result = new UIType(obj.args);

    for (var x in obj) {
        if (obj.hasOwnProperty(x) && x !== "children" && x !== "args" && x !== "type" && x !== "listeners") {
            result.on(x, obj[x]);
        }
    }
    if (obj.listeners) {
        var listeners = obj.listeners;
        if (!util.isArray(listeners)) {
            listeners = [listeners];
        }
        for (var j = 0; j < listeners.length; j++) {
            result.bind(listeners[j].target ? listeners[j].target : result._dom, listeners[j].type, listeners[j].listener);
        }
    }
    if (obj.children) {
        var children = obj.children;
        if (!util.isArray(children)) {
            children = [children];
        }
        for (var i = 0; i < children.length; i++) {
            result.append(create(children[i]));
        }
    }
    return result;
}

exports.create = create;