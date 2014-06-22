/**
 * Created by 清月_荷雾 on 14-2-8.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 * @note 本文件包括了大部分与DOM相关的工具函数（IE10+（PC及WP7/8）、Firefox和Webkit浏览器(PC及Android 2.3+,IOS 5+)）
 */
var util = require("./util"),
    slice = [].slice,
    strundefined = typeof undefined,
    dom = {};

//浏览器状态判断（只包括IE10+（PC及WP7/8）、Firefox和Webkit浏览器(PC及Android 2.3+,IOS 5+)）
dom.support = (function () {
    var fragment = document.createDocumentFragment(),
        div = fragment.appendChild(document.createElement("div")),
        input = document.createElement("input"),
        select = document.createElement("select"),
        opt = select.appendChild(document.createElement("option")),
        pixelPositionVal, boxSizingReliableVal,
        docElem = document.documentElement,
        container = document.createElement("div"),
        support = {};

    fragment.appendChild(document.createElement("div"));
    //WebKit:如果input的name属性出现在checked属性之后，会造成checked属性失效
    input.setAttribute("type", "radio");
    input.setAttribute("checked", "checked");
    input.setAttribute("name", "t");
    div.appendChild(input);
    //WebKit(Safari 5.1, iOS 5.1, Android 4.x, Android 2.3):这些浏览器在进行节点复制时，不会复制节点的checked属性
    support.checkClone = div.cloneNode(true).cloneNode(true).lastChild.checked;
    //IE10-11:这些浏览器在进行节点复制时，不会复制textarea和checkbox的defaultValue
    div.innerHTML = "<textarea>x</textarea>";
    support.noCloneChecked = !!div.cloneNode(true).lastChild.defaultValue;
    //WebKit(iOS 5.1, Android 4.x, Android 2.3):这些浏览器上，checkbox/radio的默认值为""，而其它浏览器"on"
    input = document.createElement("input");
    input.type = "checkbox";
    support.checkOn = input.value !== "";
    //IE10：IE10需要通过访问option的上一级元素来更新option的selected属性
    support.optSelected = opt.selected;
    //WebKit:当select被设置成disabled，WebKit会设置select里面的option为disabled
    select.disabled = true;
    support.optDisabled = !opt.disabled;
    //IE10:如果设置一个input的type为radio会造成其value被重置
    input = document.createElement("input");
    input.value = "t";
    input.type = "radio";
    support.radioValue = input.value === "t";
    //IE10:如果一个节点来自cloneNode，如果设置属性的值为""，会错误的重置被clone节点的属性
    div = document.createElement("div");
    div.style.backgroundClip = "content-box";
    div.cloneNode(true).style.backgroundClip = "";
    support.clearCloneStyle = div.style.backgroundClip === "content-box";
    //Webkit处理获取页面元素大小和位置时的几个问题
    container.style.cssText = "border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;position:absolute";
    container.appendChild(div);
    function computePixelPositionAndBoxSizingReliable() {
        div.style.cssText =
        "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" +
        "box-sizing:border-box;display:block;margin-top:1%;top:1%;" +
        "border:1px;padding:1px;width:4px;position:absolute";
        div.innerHTML = "";
        docElem.appendChild(container);

        //noinspection JSCheckFunctionSignatures
        var divStyle = window.getComputedStyle(div, null);
        pixelPositionVal = divStyle.top !== "1%";
        boxSizingReliableVal = divStyle.width === "4px";

        docElem.removeChild(container);
    }

    util.merge(support, {
        pixelPosition: function () {
            computePixelPositionAndBoxSizingReliable();
            return pixelPositionVal;
        },
        boxSizingReliable: function () {
            if (boxSizingReliableVal == null) {
                computePixelPositionAndBoxSizingReliable();
            }
            return boxSizingReliableVal;
        },
        reliableMarginRight: function () {
            var ret,
                marginDiv = div.appendChild(document.createElement("div"));
            marginDiv.style.cssText = div.style.cssText =
                                      "-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" +
                                      "box-sizing:content-box;display:block;margin:0;border:0;padding:0";
            marginDiv.style.marginRight = marginDiv.style.width = "0";
            div.style.width = "1px";
            docElem.appendChild(container);
            //noinspection JSCheckFunctionSignatures
            ret = !parseFloat(window.getComputedStyle(marginDiv, null).marginRight);
            docElem.removeChild(container);
            return ret;
        }
    });
    support.focusinBubbles = "onfocusin" in window;

    support.nativeTouchScroll = div.style["-webkit-overflow-scrolling"] !== undefined
        && (navigator.userAgent.match(/(iPad).*OS\s([\d_]+)/) || navigator.userAgent.match(/(iPhone\sOS)\s([\d_]+)/));
    return support;
})();

//HTML相关工具函数
(function () {
    var support = dom.support,
        rcheckableType = /^(?:checkbox|radio)$/i,
        rmsPrefix = /^-ms-/,
        rdashAlpha = /-([\da-z])/gi ,
        fcamelCase = function (all, letter) {
            return letter.toUpperCase();
        },
        rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
        rhtml = /<|&#?\w+;/,
        rtagName = /<([\w:]+)/,
        wrapMap = {
            thead: [ 1, "<table>", "</table>" ],
            col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
            tr: [ 2, "<table><tbody>", "</tbody></table>" ],
            td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
            _default: [ 0, "", "" ]
        },
        rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi;

    function getAll(context, tag) {
        return dom.find(tag || "*", context);
    }

    function fixInput(src, dest) {
        var nodeName = dest.nodeName.toLowerCase();
        if (nodeName === "input" && rcheckableType.test(src.type)) {
            dest.checked = src.checked;
        } else if (nodeName === "input" || nodeName === "textarea") {
            dest.defaultValue = src.defaultValue;
        }
    }

    /**
     * 判断文档是否是XML
     * @param doc {*}文档
     */
    dom.isXML = function (doc) {
        var documentElement = doc && (doc.ownerDocument || doc).documentElement;
        return documentElement ? documentElement.nodeName !== "HTML" : false;
    };

    /**
     * 判断一个对象是不是window对象
     * @param obj
     * @returns {boolean}
     */
    dom.isWindow = function (obj) {
        return obj != null && obj === obj.window;
    };

    /**
     * 将-连接的CSS属性转换成浏览器认识的属性
     * @param str {string}
     * @returns {string}
     */
    dom.camelCase = function (str) {
        return str.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
    };

    /**
     * 判断节点名是否与给定值相同
     * @param elem {Element} 节点
     * @param name {string} 名字
     * @returns {boolean}
     */
    dom.nodeName = function (elem, name) {
        return !!(elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase());
    };

    /**
     * 将字符串使用指定上下文转成元素数组（请注意所有的scripts节点不会执行，框架不推荐将js写在模板中）
     * @param data {string} HTML字符串
     * @param [context] {*} 上下文
     * @returns [Array]
     */
    dom.parse = function (data, context) {
        if (!data || typeof data !== "string") {
            return null;
        }
        context = context || document;
        var parsed = rsingleTag.exec(data) ,
            tmp, tag, wrap, j, nodes;
        if (parsed) {
            return [context.createElement(parsed[1])];
        }
        if (!rhtml.test(data)) {
            return [context.createTextNode(data)];
        }
        tmp = context.createElement("div");
        tag = ( rtagName.exec(data) || [ "", "" ] )[ 1 ].toLowerCase();
        wrap = wrapMap[ tag ] || wrapMap._default;
        tmp.innerHTML = wrap[ 1 ] + data.replace(rxhtmlTag, "<$1></$2>") + wrap[ 2 ];
        j = wrap[ 0 ];
        while (j--) {
            tmp = tmp.lastChild;
        }
        nodes = util.toArray(tmp.childNodes);
        tmp.textContent = "";
        return nodes;
    };

    /**
     * 克隆一个元素(请注意克隆不能克隆任何事件)
     * @param elem {Element} 要复制的元素
     * @returns {Element}
     */
    dom.clone = function (elem) {
        var i, l, srcElements, destElements,
            clone = elem.cloneNode(true);
        if ((!support.checkClone || !support.noCloneChecked ) && ( elem.nodeType === 1 || elem.nodeType === 11 ) && !dom.isXML(elem)) {
            destElements = getAll(clone);
            srcElements = getAll(elem);
            for (i = 0, l = srcElements.length; i < l; i++) {
                fixInput(srcElements[ i ], destElements[ i ]);
            }
            fixInput(elem, clone);
        }
        return clone;
    };

    /**
     * 销毁元素
     * @param elem {Element} 要销毁的元素
     */
    dom.destroy = function (elem) {
        dom.event.clean(getAll(elem));
        dom.event.clean([elem]);
        var garbageBin = document.getElementById('LeakGarbageBin');
        if (!garbageBin) {
            garbageBin = document.createElement('div');
            garbageBin.id = 'LeakGarbageBin';
            garbageBin.style.display = 'none';
            document.body.appendChild(garbageBin);
        }
        garbageBin.appendChild(elem);
        garbageBin.textContent = '';
    };
    /**
     * 清空元素内容
     * @param elem
     */
    dom.empty = function (elem) {
        dom.event.clean(getAll(elem));
        elem.textContent = "";
    };

    wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
    wrapMap.th = wrapMap.td;
})();

//HTML核心查询工具（提供与sizzle相同的接口）
(function () {
    //noinspection JSUnresolvedVariable
    var docElem = window.document.documentElement,
        matches = docElem.matchesSelector ||
                  docElem.webkitMatchesSelector ||
                  docElem.mozMatchesSelector ||
                  docElem.oMatchesSelector ||
                  docElem.msMatchesSelector,
        selector_sortOrder = function (a, b) {
            if (a === b) {
                return 0;
            }
            var compare = b.compareDocumentPosition &&
                          a.compareDocumentPosition &&
                          a.compareDocumentPosition(b);
            if (compare) {
                /*jshint bitwise:false */
                //noinspection JSBitwiseOperatorUsage
                if (compare & 1) {
                    if (a === document || dom.contains(document, a)) {
                        return -1;
                    }
                    if (b === document || dom.contains(document, b)) {
                        return 1;
                    }
                    return 0;
                }
                //noinspection JSBitwiseOperatorUsage
                return compare & 4 ? -1 : 1;
                /*jshint bitwise:true */
            }
            return a.compareDocumentPosition ? -1 : 1;
        };

    /**
     * 在指定上下文查找符合表达式的元素
     * @param selector {string} 表达式
     * @param [context] {Element|undefined} 元素
     * @param [results] {Array|undefined} 原始元素（可以是空数组，也可以其它是添加到结果里面的元素，引用传递）
     * @param [seed] {Array|undefined} 搜索范围（如果传递此参数，将只匹配数组中的这些元素，而不是去页面中查找）
     * @return {Array}
     */
    dom.find = function (selector, context, results, seed) {
        var elem, nodeType,
            i = 0;
        results = results || [];
        context = context || document;
        if (!selector || typeof selector !== "string") {
            return results;
        }
        if ((nodeType = context.nodeType) !== 1 && nodeType !== 9) {
            return [];
        }
        if (seed) {
            while ((elem = seed[i++])) {
                if (dom.find.matchesSelector(elem, selector)) {
                    results.push(elem);
                }
            }
        } else {
            util.merge(results, slice.call(context.querySelectorAll(selector), 0));
        }
        return results;
    };

    /**
     * 获取元素的文本
     * @param elem {Element} 要获取的元素
     * @returns {*}
     */
    dom._text = function (elem) {
        var ret = "",
            nodeType = elem.nodeType;
        if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
            return elem.textContent;
        } else if (nodeType === 3 || nodeType === 4) {
            return elem.nodeValue;
        }
        return ret;
    };

    /**
     * 获取或者设置元素的文本
     * @param elem {Element} 要操作的元素
     * @param [value] {string} 要设置的值
     */
    dom.text = function (elem, value) {
        if (arguments.length > 1) {
            dom.empty(elem);
            elem.appendChild((elem && elem.ownerDocument || document).createTextNode(value));
        } else if (elem) {
            return dom._text(elem);
        }
    };

    /**
     * 检查一个元素是否包含另外一个元素
     * @param a {Element|HTMLDocument} 包含元素
     * @param b {Element} 被包含元素
     * @returns {boolean}
     */
    dom.contains = function (a, b) {
        var adown = a.nodeType === 9 ? a.documentElement : a,
            bup = b && b.parentNode;
        return a === bup || !!( bup && bup.nodeType === 1 && adown.contains(bup) );
    };

    /**
     * 对DOM数组进行排序并去除重复项
     * @param results {Array}
     */
    dom.unique = function (results) {
        return util.unique(results, false, selector_sortOrder);
    };

    /**
     * 在指定数组中找到所有匹配的元素
     * @param expr {string} 表达式
     * @param elements {Array} 元素数组
     * @returns {Array}
     */
    dom.find.matches = function (expr, elements) {
        return dom.find(expr, null, null, elements);
    };

    /**
     * 检查元素是否匹配表达式(此函数会匹配目标所在的context，对于在DOM树中的元素，为document，否则为元素所在的树或者文档片段)
     * @param elem {Element} 要匹配的元素
     * @param expr {string} 匹配表达式
     * @returns {*}
     */
    dom.find.matchesSelector = function (elem, expr) {
        return matches.call(elem, expr);
    };

    /**
     * 获取元素的特征值
     * @param elem {Element} DOM节点
     * @param name {string} 要获取或设置的特征名
     * @returns {string}
     */
    dom.find.attr = function (elem, name) {
        return elem.getAttribute(name);
    };
})();

//处理常用DOM属性相关如：设置或者删除特征、属性、获取表单值，获取data-attribute，获取或设置元素的class以及设置
(function () {
    var support = dom.support,
        attrHooks = {},
        rbool = /^(?:checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped)$/i,
        propFix = {
            "for": "htmlFor",
            "class": "className"
        },
        propHooks = {
            tabIndex: {
                get: function (elem) {
                    return elem.hasAttribute("tabindex") || rfocusable.test(elem.nodeName) || elem.href ?
                           elem.tabIndex :
                           -1;
                }
            }
        },
        valHooks = {
            option: {
                get: function (elem) {
                    var val = dom.find.attr(elem, "value");
                    return val != null ?
                           val :
                           util.trim(dom.text(elem));
                }
            },
            select: {
                get: function (elem) {
                    var value, option,
                        options = elem.options,
                        index = elem.selectedIndex,
                        one = elem.type === "select-one" || index < 0,
                        values = one ? null : [],
                        max = one ? index + 1 : options.length,
                        i = index < 0 ?
                            max :
                            one ? index : 0;
                    for (; i < max; i++) {
                        option = options[ i ];
                        if (option.selected &&
                            ( support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null ) &&
                            ( !option.parentNode.disabled || !dom.nodeName(option.parentNode, "optgroup") )) {
                            value = dom.val(option);
                            if (one) {
                                return value;
                            }
                            values.push(value);
                        }
                    }
                    return values;
                },

                set: function (elem, value) {
                    var optionSet, option,
                        options = elem.options,
                        values = util.isArray(value) ? value : [value],
                        i = options.length;
                    while (i--) {
                        option = options[ i ];
                        if ((option.selected = values.indexOf(option.value) >= 0)) {
                            optionSet = true;
                        }
                    }
                    if (!optionSet) {
                        elem.selectedIndex = -1;
                    }
                    return values;
                }
            }
        },
        rreturn = /\r/g,
        rmultiDash = /([A-Z])/g,
        rfocusable = /^(?:input|select|textarea|button)$/i;

    /**
     * 获取或者设置元素的特征
     * @param elem {Element} DOM节点
     * @param name {string} 要获取或设置的特征名
     * @param [value] {string|null|undefined} 要获取或设置的特征值，当值为null时表示删除，当值为undefined时表示获取，其它表示设置
     */
    dom.attr = function (elem, name, value) {
        var hooks, ret, propName, nType;
        if (!elem || (nType = elem.nodeType) === 3 || nType === 8 || nType === 2) {
            return;
        }
        if (typeof elem.getAttribute === strundefined) {
            return dom.prop(elem, name, value);
        }
        if (nType !== 1 || !dom.isXML(elem)) {
            name = name.toLowerCase();
            hooks = attrHooks[ name ];
        }

        if (value !== undefined) {
            if (value === null) {
                propName = propFix[ name ] || name;
                if (rbool.test(name)) {
                    elem[ propName ] = false;
                }
                elem.removeAttribute(name);
            } else if (hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== undefined) {
                return ret;
            } else {
                elem.setAttribute(name, value + "");
            }
            return value;
        } else if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
            return ret;

        } else {
            ret = dom.find.attr(elem, name);
            return ret == null ? undefined : ret;
        }
    };
    /**
     * 获取或者设置元素的属性
     * @param elem {Element} DOM节点
     * @param name {string} 要获取或设置的属性名
     * @param [value] {*|undefined} 要获取或设置的属性值，当值为undefined时表示获取，其它表示设置
     */
    dom.prop = function (elem, name, value) {
        var ret, hooks, notxml, nType;
        if (!elem || (nType = elem.nodeType) === 3 || nType === 8 || nType === 2) {
            return;
        }
        notxml = nType !== 1 || !dom.isXML(elem);
        if (notxml) {
            name = propFix[ name ] || name;
            hooks = propHooks[ name ];
        }
        if (value !== undefined) {
            return hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== undefined ?
                   ret :
                   ( elem[ name ] = value );

        } else {
            return hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null ?
                   ret :
                   elem[ name ];
        }
    };
    /**
     * 获取或者设置元素的值
     * @param elem {Element} DOM节点
     * @param [value] {string|undefined}要获取或设置的元素值，当值为undefined时表示获取，其它表示设置
     */
    dom.val = function (elem, value) {
        var nType , hooks, ret;
        if (!elem || (nType = elem.nodeType) === 3 || nType === 8 || nType === 2) {
            return;
        }
        //noinspection JSUnresolvedVariable
        hooks = valHooks[ elem.type ] || valHooks[ elem.nodeName.toLowerCase() ];
        if (arguments.length < 2) {
            if (hooks && "get" in hooks && (ret = hooks.get(elem, "value")) !== undefined) {
                return ret;
            }
            //noinspection JSUnresolvedVariable
            ret = elem.value;
            return typeof ret === "string" ?
                   ret.replace(rreturn, "") :
                   ret == null ? "" : ret;
        }
        if (value == null) {
            value = "";
        } else if (typeof value === "number") {
            value += "";
        }
        if (!hooks || !("set" in hooks) || hooks.set(elem, value, "value") === undefined) {
            //noinspection JSUndefinedPropertyAssignment
            elem.value = value;
        }
        return value;
    };
    /**
     * 添加样式
     * @param elem {HTMLElement} 要设置的元素
     * @param classname {string} 样式名
     */
    dom.addClass = function (elem, classname) {
        var classes , nType, cur, j, clazz;
        if (!elem || (nType = elem.nodeType) === 3 || nType === 8 || nType === 2) {
            return;
        }
        classes = ( classname || "" ).match(/\S+/g) || [];
        cur = elem.nodeType === 1 && ( elem.className ? ( " " + elem.className + " " ).replace(/[\t\r\n\f]/g, " ") : " ");

        if (cur) {
            for (j = 0; j < classes.length; j++) {
                clazz = classes[j];
                if (cur.indexOf(" " + clazz + " ") < 0) {
                    cur += clazz + " ";
                }
            }
            elem.className = cur.trim();
        }
    };
    /**
     * 删除样式
     * @param elem {HTMLElement} 要设置的元素
     * @param classname {string} 样式名
     */
    dom.removeClass = function (elem, classname) {
        var classes , nType, cur, j, clazz;
        if (!elem || (nType = elem.nodeType) === 3 || nType === 8 || nType === 2) {
            return;
        }
        classes = ( classname || "" ).match(/\S+/g) || [];
        cur = elem.nodeType === 1 && ( elem.className ? ( " " + elem.className + " " ).replace(/[\t\r\n\f]/g, " ") : " ");

        if (cur) {
            for (j = 0; j < classes.length; j++) {
                clazz = classes[j];
                while (cur.indexOf(" " + clazz + " ") >= 0) {
                    cur = cur.replace(" " + clazz + " ", " ");
                }
            }
            elem.className = cur.trim();
        }
    };
    /**
     * 获取或者设置data-attribute
     * @param elem {Element} DOM节点
     * @param name {string} 要获取或设置的data-attribute名（不带data-）
     * @param value {string|undefined} 要获取或设置的data-attribute值，当值为undefined时表示获取，其它表示设置
     */
    dom.data = function (elem, name, value) {
        return dom.attr(elem, "data-" + name.replace(rmultiDash, "-$1").toLowerCase(), value);
    };

    util.each([ "radio", "checkbox" ], function () {
        valHooks[ this ] = {
            set: function (elem, value) {
                if (util.isArray(value)) {
                    return ( elem.checked = value.indexOf(dom.val(elem) >= 0) );
                }
            }
        };
        if (!support.checkOn) {
            valHooks[ this ].get = function (elem) {
                return elem.getAttribute("value") === null ? "on" : elem.value;
            };
        }
    });

    if (!support.optSelected) {
        propHooks.selected = {
            get: function (elem) {
                var parent = elem.parentNode;
                if (parent && parent.parentNode) {
                    //IE10浏览器需要通过此方式来更新option的选中状态
                    /*jshint -W030 */
                    //noinspection BadExpressionStatementJS
                    parent.parentNode.selectedIndex;
                    /*jshint +W030 */
                }
                return null;
            }
        };
    }

    util.each([
        "tabIndex",
        "readOnly",
        "maxLength",
        "cellSpacing",
        "cellPadding",
        "rowSpan",
        "colSpan",
        "useMap",
        "frameBorder",
        "contentEditable"
    ], function () {
        propFix[ this.toLowerCase() ] = this;
    });

    util.each(rbool.source.match(/\w+/g), function (i, name) {
        attrHooks[name] = {
            get: function (elem, name) {
                if (!dom.isXML(elem)) {
                    return dom.find.attr(elem) != null ? name.toLowerCase() : undefined;
                }
                return null;
            },
            set: function (elem, value, name) {
                if (value === false) {
                    dom.attr(elem, name, null);
                } else {
                    elem.setAttribute(name, name);
                }
                return name;
            }
        };
    });

})();

//处理CSS
(function () {
    var support = dom.support,
        cssProps = {
            "float": "cssFloat"
        },
        cssHooks,
        pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source,
        rrelNum = new RegExp("^([+-])=(" + pnum + ")", "i"),
        rnumnonpx = new RegExp("^(" + pnum + ")(?!px)[a-z%]+$", "i"),
        rmargin = /^margin/,
        cssNumber = {
            "columnCount": true,
            "fillOpacity": true,
            "flexGrow": true,
            "flexShrink": true,
            "fontWeight": true,
            "lineHeight": true,
            "opacity": true,
            "order": true,
            "orphans": true,
            "widows": true,
            "zIndex": true,
            "zoom": true
        },
        cssPrefixes = [ "Webkit", "O", "Moz", "ms" ],
        cssNormalTransform = {
            letterSpacing: "0",
            fontWeight: "400"
        },
        docElem = window.document.documentElement,
        rnumsplit = new RegExp("^(" + pnum + ")(.*)$", "i"),
        rdisplayswap = /^(none|table(?!-c[ea]).+)/,
        cssExpand = [ "Top", "Right", "Bottom", "Left" ],
        cssShow = { position: "absolute", visibility: "hidden", display: "block" };

    //noinspection JSUnusedLocalSymbols
    function setPositiveNumber(elem, value, subtract) {
        var matches = rnumsplit.exec(value);
        return matches ?
               Math.max(0, matches[ 1 ] - ( subtract || 0 )) + ( matches[ 2 ] || "px" ) :
               value;
    }

    function vendorPropName(style, name) {
        if (name in style) {
            return name;
        }
        var capName = name[0].toUpperCase() + name.slice(1),
            origName = name,
            i = cssPrefixes.length;
        while (i--) {
            name = cssPrefixes[ i ] + capName;
            if (name in style) {
                return name;
            }
        }
        return origName;
    }

    function getStyles(elem) {
        return elem.ownerDocument.defaultView.getComputedStyle(elem, null);
    }

    function curCSS(elem, name, computed) {
        var width, minWidth, maxWidth, ret,
            style = elem.style;
        computed = computed || getStyles(elem);
        if (computed) {
            ret = computed[ name ];
            if (!dom.contains(elem.ownerDocument, elem)) {
                ret = dom.style(elem, name);
            }
            if (rnumnonpx.test(ret) && rmargin.test(name)) {
                width = style.width;
                minWidth = style.minWidth;
                maxWidth = style.maxWidth;
                style.minWidth = style.maxWidth = style.width = ret;
                ret = computed.width;
                style.width = width;
                style.minWidth = minWidth;
                style.maxWidth = maxWidth;
            }
        }
        return ret !== undefined ? ret + "" : ret;
    }

    function swap(elem, options, callback, args) {
        var ret, name,
            old = {};
        for (name in options) {
            if (options.hasOwnProperty(name)) {
                old[ name ] = elem.style[ name ];
                elem.style[ name ] = options[ name ];
            }
        }
        ret = callback.apply(elem, args || []);
        for (name in options) {
            if (options.hasOwnProperty(name)) {
                elem.style[ name ] = old[ name ];
            }
        }
        return ret;
    }

    function augmentWidthOrHeight(elem, name, extra, isBorderBox, styles) {
        var i = extra === ( isBorderBox ? "border" : "content" ) ? 4 : name === "width" ? 1 : 0,
            val = 0;

        for (; i < 4; i += 2) {
            if (extra === "margin") {
                val += dom.css(elem, extra + cssExpand[ i ], true, styles);
            }

            if (isBorderBox) {
                if (extra === "content") {
                    val -= dom.css(elem, "padding" + cssExpand[ i ], true, styles);
                }

                if (extra !== "margin") {
                    val -= dom.css(elem, "border" + cssExpand[ i ] + "Width", true, styles);
                }
            } else {
                val += dom.css(elem, "padding" + cssExpand[ i ], true, styles);

                if (extra !== "padding") {
                    val += dom.css(elem, "border" + cssExpand[ i ] + "Width", true, styles);
                }
            }
        }

        return val;
    }

    function getWidthOrHeight(elem, name, extra) {
        var valueIsBorderBox = true,
            val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
            styles = getStyles(elem),
            isBorderBox = dom.css(elem, "boxSizing", false, styles) === "border-box";

        if (val <= 0 || val == null) {
            val = curCSS(elem, name, styles);
            if (val < 0 || val == null) {
                val = elem.style[ name ];
            }
            if (rnumnonpx.test(val)) {
                return val;
            }
            valueIsBorderBox = isBorderBox && ( support.boxSizingReliable() || val === elem.style[ name ] );
            val = parseFloat(val) || 0;
        }
        return ( val +
                 augmentWidthOrHeight(
                     elem,
                     name,
                         extra || ( isBorderBox ? "border" : "content" ),
                     valueIsBorderBox,
                     styles
                 )
                   ) + "px";
    }

    function addGetHookIf(conditionFn, hookFn) {
        return {
            get: function () {
                if (conditionFn()) {
                    delete this.get;
                    return;
                }
                return (this.get = hookFn).apply(this, arguments);
            }
        };
    }

    function getOffsetParent(elem) {
        var offsetParent = elem.offsetParent || docElem;

        while (offsetParent && ( !dom.nodeName(offsetParent, "html") && dom.css(offsetParent, "position") === "static" )) {
            offsetParent = offsetParent.offsetParent;
        }
        return offsetParent || docElem;
    }

    function getWindow(elem) {
        if (dom.isWindow(elem)) {
            return elem;
        } else {
            return  elem.nodeType === 9 && elem.defaultView;
        }
    }

    /**
     * 获取或者设置元素的style
     * @param elem {HTMLElement} DOM节点
     * @param name {string} 要获取或设置的样式名
     * @param [value] {string|undefined} 要获取或设置的样式值，当值为undefined时表示获取，其它表示设置
     * @param [extra] {bool} 是否强制返回数值，如果为false则当属性值转化成数字时，如果结果为NaN或者Infinity则返回字符串
     */
    dom.style = function (elem, name, value, extra) {
        if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
            return;
        }
        var ret, type, hooks,
            origName = dom.camelCase(name),
            style = elem.style;
        name = cssProps[ origName ] || ( cssProps[ origName ] = vendorPropName(style, origName) );
        hooks = cssHooks[ name ] || cssHooks[ origName ];
        if (value !== undefined) {
            type = typeof value;
            if (type === "string" && (ret = rrelNum.exec(value))) {
                value = ( ret[1] + 1 ) * ret[2] + parseFloat(dom.css(elem, name));
                type = "number";
            }
            if (value == null || value !== value) {
                return;
            }
            if (type === "number" && !cssNumber[ origName ]) {
                value += "px";
            }
            if (!support.clearCloneStyle && value === "" && name.indexOf("background") === 0) {
                style[ name ] = "inherit";
            }
            if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value, extra)) !== undefined) {
                style[ name ] = value;
            }
        } else {
            if (hooks && "get" in hooks && (ret = hooks.get(elem, false, extra)) !== undefined) {
                return ret;
            }
            return style[ name ];
        }
    };
    /**
     * 获取元素的计算出的样式
     * @param elem {HTMLElement} DOM节点
     * @param name {string} 要的样式名
     * @param extra {bool} 是否强制返回数值，如果为false则当属性值转化成数字时，如果结果为NaN或者Infinity则返回字符串
     * @param styles {*|undefined} 元素的当前样式，可以不传，如果要获取一个元素的多个属性时，可以使用此参数加快速度
     */
    dom.css = function (elem, name, extra, styles) {
        var val, num, hooks,
            origName = dom.camelCase(name);
        name = cssProps[ origName ] || ( cssProps[ origName ] = vendorPropName(elem.style, origName) );
        hooks = cssHooks[ name ] || cssHooks[ origName ];

        if (hooks && "get" in hooks) {
            val = hooks.get(elem, true, extra);
        }
        if (val === undefined) {
            val = curCSS(elem, name, styles);
        }
        if (val === "normal" && name in cssNormalTransform) {
            val = cssNormalTransform[ name ];
        }
        if (extra === "" || extra) {
            num = parseFloat(val);
            return extra === true || util.isNumeric(num) ? num || 0 : val;
        }
        return val;
    };
    /**
     * 获取元素的绝对位置位置
     * @param elem {Element} 要获取的元素
     * @returns {{top: number, left: number}}
     */
    dom.position = function (elem) {
        var offsetParent, offset,
            parentOffset = { top: 0, left: 0 };

        if (dom.css(elem, "position") === "fixed") {
            offset = elem.getBoundingClientRect();
        } else {
            offsetParent = getOffsetParent(elem);
            offset = dom.offset(elem);
            if (!dom.nodeName(offsetParent, "html")) {
                parentOffset = dom.offset(offsetParent);
            }
            parentOffset.top += dom.css(offsetParent, "borderTopWidth", true);
            parentOffset.left += dom.css(offsetParent, "borderLeftWidth", true);
        }
        return {
            top: offset.top - parentOffset.top - dom.css(elem, "marginTop", true),
            left: offset.left - parentOffset.left - dom.css(elem, "marginLeft", true)
        };
    };

    /**
     * 获取元素的offset
     * @param elem {Element} 要获取的元素
     * @returns {{top: number, left: number}}
     */
    dom.offset = function (elem) {
        var docElem, win,
            box = { top: 0, left: 0 },
            doc = elem && elem.ownerDocument;
        if (!doc) {
            return box;
        }
        docElem = doc.documentElement;

        if (!dom.contains(docElem, elem)) {
            return box;
        }

        if (typeof elem.getBoundingClientRect !== strundefined) {
            box = elem.getBoundingClientRect();
        }
        win = getWindow(doc);
        return {
            top: box.top + win.pageYOffset - docElem.clientTop,
            left: box.left + win.pageXOffset - docElem.clientLeft
        };
    };

    cssHooks = {
        opacity: {
            get: function (elem, computed) {
                if (computed) {
                    var ret = curCSS(elem, "opacity");
                    return ret === "" ? "1" : ret;
                }
            }
        }
    };

    util.each([ "height", "width" ], function (i, name) {
        cssHooks[ name ] = {
            get: function (elem, computed, extra) {
                if (computed) {
                    return rdisplayswap.test(dom.css(elem, "display")) && elem.offsetWidth === 0 ?
                           swap(elem, cssShow, function () {
                               return getWidthOrHeight(elem, name, extra);
                           }) :
                           getWidthOrHeight(elem, name, extra);
                }
            },
            set: function (elem, value, extra) {
                var styles = extra && getStyles(elem);
                return setPositiveNumber(elem, value, extra ?
                                                      augmentWidthOrHeight(
                                                          elem,
                                                          name,
                                                          extra,
                                                              dom.css(elem, "boxSizing", false, styles) === "border-box",
                                                          styles
                                                      ) : 0
                );
            }
        };
    });

    cssHooks.marginRight = addGetHookIf(support.reliableMarginRight,
        function (elem, computed) {
            if (computed) {
                return swap(elem, { "display": "inline-block" }, curCSS, [ elem, "marginRight" ]);
            }
        }
    );

    util.each({
        margin: "",
        padding: "",
        border: "Width"
    }, function (prefix, suffix) {
        if (!rmargin.test(prefix)) {
            cssHooks[ prefix + suffix ] = {
                set: setPositiveNumber
            };
        }
    });

    util.each([ "top", "left" ], function (i, prop) {
        cssHooks[ prop ] = addGetHookIf(support.pixelPosition,
            function (elem, computed) {
                if (computed) {
                    computed = curCSS(elem, prop);
                    return rnumnonpx.test(computed) ?
                           dom.position(elem)[ prop ] + "px" :
                           computed;
                }
            }
        );
    });
})();

//事件绑定
(function () {

    var noData = {
            "applet ": true,
            "embed ": true,
            "object ": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
        },
        support = dom.support,
        special = {// 需要特殊处理的事件列表
            load: {
                noBubble: true
            },
            focus: {
                trigger: function () {
                    if (this !== safeActiveElement() && this.focus) {
                        this.focus();
                        return false;
                    }
                },
                delegateType: "focusin"
            },
            blur: {
                trigger: function () {
                    if (this === safeActiveElement() && this.blur) {
                        this.blur();
                        return false;
                    }
                },
                delegateType: "focusout"
            },
            click: {
                trigger: function () {
                    if (this.type === "checkbox" && this.click && dom.nodeName(this, "input")) {
                        this.click();
                        return false;
                    }
                }
            }
        },
        fixHooks = {},
        rkeyEvent = /^key/,
        rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/,
        rtouchEvent = /^touch/,
        rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
        props = "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
        rnotwhite = /\S+/g,
        keyHooks = {
            props: "char charCode key keyCode".split(" "),
            filter: function (event, original) {
                if (event.which == null) {
                    event.which = original.charCode != null ? original.charCode : original.keyCode;
                }
                return event;
            }
        },
        mouseHooks = {
            props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
            filter: function (event, original) {
                var eventDoc, doc, body,
                    button = original.button;
                if (event.pageX == null && original.clientX != null) {
                    eventDoc = event.target.ownerDocument || document;
                    doc = eventDoc.documentElement;
                    body = eventDoc.body;

                    event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
                    event.pageY = original.clientY + ( doc && doc.scrollTop || body && body.scrollTop || 0 ) - ( doc && doc.clientTop || body && body.clientTop || 0 );
                }
                if (!event.which && button !== undefined) {
                    /*jshint bitwise:false */
                    //noinspection JSBitwiseOperatorUsage
                    event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
                    /*jshint bitwise:true */
                }

                return event;
            }
        },
        touchHooks = {
            props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement touches".split(" "),
            filter: function (event, original) {
                var eventDoc, doc, body,
                    button = original.button;
                if (event.pageX == null && original.clientX != null) {
                    eventDoc = event.target.ownerDocument || document;
                    doc = eventDoc.documentElement;
                    body = eventDoc.body;

                    event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
                    event.pageY = original.clientY + ( doc && doc.scrollTop || body && body.scrollTop || 0 ) - ( doc && doc.clientTop || body && body.clientTop || 0 );
                }
                if (!event.which && button !== undefined) {
                    /*jshint bitwise:false */
                    //noinspection JSBitwiseOperatorUsage
                    event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
                    /*jshint bitwise:true */
                }

                return event;
            }
        },
        dataCache = {};

    function returnTrue() {
        return true;
    }

    function returnFalse() {
        return false;
    }

    function safeActiveElement() {
        try {
            return document.activeElement;
        } catch (err) {
        }
    }

    dom.expando = "event" + util.uuid();
    dom.event = {
        /**
         * 获取元素的事件缓冲
         * @param elem {HTMLElement}
         * @param [name] {string} 要获取的数据的名字
         * @param [data] 数据，如果传递此参数，表示设置
         * @private
         */
        data: function (elem, name, data) {
            var nodeType, nd, expando, cache;
            if (!elem || !elem.nodeType || ((nodeType = elem.nodeType) !== 1 && nodeType !== 9)) {
                return;
            }
            nd = noData[ (elem.nodeName + " ").toLowerCase() ];
            if (nd === true || (nd && elem.getAttribute("classid") === nd )) {
                return;
            }
            expando = dom.attr(elem, dom.expando);
            if (!expando) {
                expando = dom.attr(elem, dom.expando, util.uuid());
            }
            cache = dataCache[expando] = dataCache[expando] || {};
            if (arguments.length === 1) {
                return cache;
            } else if (arguments.length === 2) {
                return cache[name];
            } else {
                return cache[name] = data;
            }
        },

        /**
         * 绑定事件
         * @param elem {Element} 要绑定的元素
         * @param types {string} 要绑定的事件
         * @param handler 要绑定的方法
         * @param selector {string} 委托选择器
         * @param data 要绑定的数据
         */
        bind: function (elem, types, handler, selector, data) {
            var elemData = dom.event.data(elem),
                events, eventHandle;
            if (!elemData || !types) {
                return;
            }
            handler.guid = handler.guid || util.uuid();
            if (!(events = elemData.events)) {
                events = elemData.events = {};
            }
            if (!(eventHandle = elemData.handle)) {
                eventHandle = elemData.handle = function (e) {
                    var args;
                    if (dom && dom.event.triggered !== e.type) {
                        if (arguments.length <= 1) {
                            dom.event.dispatch(elem, e);
                        } else {
                            args = slice.call(arguments);
                            args.unshift(elem);
                            dom.event.dispatch.apply(dom.event, args);
                        }
                    }
                };
            }
            types = types.match(rnotwhite) || [];
            util.each(types, function (t, origType) {
                var type, handlers, handleObj,
                    eventType = special[ origType ] || {};
                type = ( selector ? eventType.delegateType : eventType.bindType ) || origType;
                eventType = special[ type ] || {};
                handleObj = {
                    type: type,
                    origType: origType,
                    data: data,
                    handler: handler,
                    guid: handler.guid,
                    selector: selector
                };
                if (!(handlers = events[ type ])) {
                    handlers = events[ type ] = [];
                    handlers.delegateCount = 0;
                    if (!eventType.setup || eventType.setup.call(elem, data, eventHandle) === false) {
                        elem.addEventListener(type, eventHandle, false);
                    }
                }
                if (selector) {
                    handlers.splice(handlers.delegateCount++, 0, handleObj);
                } else {
                    handlers.push(handleObj);
                }
            });
        },
        /**
         * 解绑事件
         * @param elem {Element} 要绑定的元素
         * @param types {string} 要绑定的事件
         * @param handler 要绑定的方法
         * @param selector {string} 委托选择器
         */
        unbind: function (elem, types, handler, selector) {
            var elemData = dom.event.data(elem),
                events;
            if (!elemData || !(events = elemData.events)) {
                return;
            }
            if (!types) {
                util.each(events, function (type) {
                    dom.event.unbind(elem, type, handler, selector);
                });
                return;
            }
            types = types.match(rnotwhite) || [];
            util.each(types, function (t, origType) {
                var type, handleObj, origCount, handlers, j,
                    eventType = special[ origType ] || {};

                type = ( selector ? eventType.delegateType : eventType.bindType ) || origType;
                eventType = special[ type ] || {};
                handlers = events[ type ] || [];
                origCount = j = handlers.length;
                while (j--) {
                    handleObj = handlers[ j ];
                    if (origType === handleObj.origType &&
                        ( !handler || handler.guid === handleObj.guid ) &&
                        ( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector )) {
                        handlers.splice(j, 1);
                        if (handleObj.selector) {
                            handlers.delegateCount--;
                        }
                    }
                }
                if (origCount && !handlers.length) {
                    if (!eventType.teardown || eventType.teardown.call(elem, elemData.handle) === false) {
                        elem.removeEventListener(type, elemData.handle, false);
                    }
                    delete events[ type ];
                }
            });
        },
        /**
         * 触发事件（附加冒泡）
         * @param elem {Element} 要绑定的元素
         * @param event {*} 要触发的事件
         * @param data 触发时的数据
         * @param [onlyHandlers] {boolean} 是否只触发当前元素的事件
         */
        trigger: function (elem, event, data, onlyHandlers) {
            var i, cur, tmp, bubbleType, ontype, handle, eventType,
                eventPath = [ elem || document ],
                type = event.hasOwnProperty("type") ? event.type : event;

            cur = tmp = elem = elem || document;

            if (elem.nodeType === 3 || elem.nodeType === 8) {
                return;
            }

            if (rfocusMorph.test(type + dom.event.triggered)) {
                return;
            }

            ontype = "on" + type;

            event = event[ dom.expando ] ? event : new dom.Event(type, typeof event === "object" && event);

            event.isTrigger = onlyHandlers ? 2 : 3;

            event.result = undefined;
            if (!event.target) {
                event.target = elem;
            }

            data = data == null ? [ event ] : [ event, data ];

            eventType = special[ type ] || {};
            if (!onlyHandlers && eventType.trigger && eventType.trigger.apply(elem, data) === false) {
                return;
            }

            if (!onlyHandlers && !eventType.noBubble && !dom.isWindow(elem)) {
                bubbleType = eventType.delegateType || type;
                if (!rfocusMorph.test(bubbleType + type)) {
                    cur = cur.parentNode;
                }
                for (; cur; cur = cur.parentNode) {
                    eventPath.push(cur);
                    tmp = cur;
                }

                if (tmp === (elem.ownerDocument || document)) {
                    eventPath.push(tmp.defaultView || tmp.parentWindow || window);
                }
            }

            i = 0;
            while ((cur = eventPath[i++]) && !event.isPropagationStopped()) {
                event.type = i > 1 ? bubbleType : eventType.bindType || type;
                handle = (dom.event.data(cur, "events") || {} )[ event.type ] && dom.event.data(cur, "handle");
                if (handle) {
                    handle.apply(cur, data);
                }
                handle = ontype && cur[ ontype ];
                if (handle && handle.apply) {
                    event.result = handle.apply(cur, data);
                    if (event.result === false) {
                        event.preventDefault();
                    }
                }
            }
            event.type = type;
            if (!onlyHandlers && !event.isDefaultPrevented() && ontype && util.isFunction(elem[ type ]) && !dom.isWindow(elem)) {
                tmp = elem[ ontype ];
                if (tmp) {
                    elem[ ontype ] = null;
                }
                dom.event.triggered = type;
                elem[ type ]();
                dom.event.triggered = undefined;
                if (tmp) {
                    elem[ ontype ] = tmp;
                }
            }
            return event.result;
        },
        /**
         * 执行绑定的函数
         * @param elem {Element} 要绑定的元素
         * @param event 事件对象
         */
        dispatch: function (elem, event) {
            event = dom.event.fix(event);

            var i, j, ret, matched, handleObj,
                handlerQueue,
                args = slice.call(arguments),
                handlers = ( dom.event.data(elem, "events") || {} )[ event.type ] || [];

            args[0] = event;
            event.delegateTarget = elem;
            handlerQueue = dom.event.handlers(elem, event, handlers);
            i = 0;
            while ((matched = handlerQueue[ i++ ]) && !event.isPropagationStopped()) {
                event.currentTarget = matched.elem;
                j = 0;
                while ((handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped()) {
                    event.handleObj = handleObj;
                    event.data = handleObj.data;
                    ret = ( (special[ handleObj.origType ] || {}).handle || handleObj.handler ).apply(matched.elem, args);
                    if (ret !== undefined) {
                        if ((event.result = ret) === false) {
                            event.preventDefault();
                            event.stopPropagation();
                        }
                    }
                }
            }
            return event.result;
        },
        /**
         * 模拟事件触发流程
         * @param elem {Element} 要绑定的元素
         * @param type {string} 要触发的事件
         * @param event 事件对象
         * @param bubble {boolean} 是否冒泡
         */
        simulate: function (elem, type, event, bubble) {
            var e = new dom.Event(type, {
                isSimulated: true,
                originalEvent: {}
            });
            if (bubble) {
                dom.event.trigger(elem, e);
            } else {
                dom.event.dispatch(elem, e);
            }
            if (e.isDefaultPrevented()) {
                event.preventDefault();
            }
        },
        /**
         * 筛选所有匹配的事件handlers
         * @param elem {HTMLElement} 要执行的元素
         * @param event {Event} 事件
         * @param handlers {Array} 事件绑定的函数
         * @returns {Array}
         */
        handlers: function (elem, event, handlers) {
            //noinspection JSUnresolvedVariable
            var i, matches, sel, handleObj,
                handlerQueue = [],
                delegateCount = handlers.delegateCount,
                cur = event.target;

            if (delegateCount && cur.nodeType && (!event.button || event.type !== "click")) {
                for (; cur !== elem; cur = cur.parentNode || this) {
                    if (cur.disabled !== true || event.type !== "click") {
                        matches = [];
                        for (i = 0; i < delegateCount; i++) {
                            handleObj = handlers[ i ];
                            sel = handleObj.selector + " ";
                            if (matches[ sel ] === undefined) {
                                matches[ sel ] = dom.find(sel, elem, null, [ cur ]).length;
                            }
                            if (matches[ sel ]) {
                                matches.push(handleObj);
                            }
                        }
                        if (matches.length) {
                            handlerQueue.push({ elem: cur, handlers: matches });
                        }
                    }
                }
            }
            if (delegateCount < handlers.length) {
                handlerQueue.push({ elem: this, handlers: handlers.slice(delegateCount) });
            }
            return handlerQueue;
        },
        fix: function (event) {
            if (event[ dom.expando ]) {
                return event;
            }

            var i, prop, copy,
                type = event.type,
                originalEvent = event,
                fixHook = fixHooks[ type ];
            if (!fixHook) {
                fixHooks[ type ] = fixHook = rmouseEvent.test(type) ? mouseHooks :
                                             rkeyEvent.test(type) ? keyHooks :
                                             rtouchEvent.test(type) ? touchHooks : {};
            }
            copy = fixHook.props ? props.concat(fixHook.props) : props;
            event = new dom.Event(originalEvent);
            i = copy.length;
            while (i--) {
                prop = copy[ i ];
                event[ prop ] = originalEvent[ prop ];
            }
            if (!event.target) {
                event.target = document;
            }
            if (event.target.nodeType === 3) {
                event.target = event.target.parentNode;
            }
            return fixHook.filter ? fixHook.filter(event, originalEvent) : event;
        },
        clean: function (elems) {
            var elem, nodeType, nd, expando, cache, events,
                i = 0;
            for (; (elem = elems[ i ]) !== undefined; i++) {
                if (!elem || !elem.nodeType || ((nodeType = elem.nodeType) !== 1 && nodeType !== 9)) {
                    continue;
                }
                nd = noData[ (elem.nodeName + " ").toLowerCase() ];
                if (nd === true || (nd && elem.getAttribute("classid") === nd )) {
                    continue;
                }
                expando = dom.attr(elem, dom.expando);
                if (!expando || !(cache = dataCache[expando])) {
                    continue;
                }
                if (events = cache.events) {
                    /* jshint -W083 */
                    util.each(events, function (type) {
                        if (special[ type ]) {
                            dom.event.unbind(elem, type);
                        } else {
                            elem.removeEventListener(type, cache.handle, false);
                        }
                    });
                    /* jshint +W083 */
                    delete cache.events;
                }
                if (cache.handle) {
                    delete cache.handle;
                }
                delete dataCache[expando];
            }
        }
    };

    /**
     *
     * @param src
     * @param props
     */
    dom.Event = function (src, props) {
        if (src && src.type) {
            this.originalEvent = src;
            this.type = src.type;
            //noinspection JSUnresolvedVariable
            this.isDefaultPrevented = src.defaultPrevented || src.defaultPrevented === undefined && src.returnValue === false ?
                                      returnTrue :
                                      returnFalse;
        } else {
            this.type = src;
        }
        if (props) {
            util.merge(this, props);
        }
        this.timeStamp = src && src.timeStamp || util.now();
        this[ dom.expando ] = true;
    };

    dom.Event.prototype = {
        constructor: dom.Event,
        isDefaultPrevented: returnFalse,
        isPropagationStopped: returnFalse,
        isImmediatePropagationStopped: returnFalse,
        /**
         * 阻止默认行为
         */
        preventDefault: function () {
            var e = this.originalEvent;
            this.isDefaultPrevented = returnTrue;
            if (e && e.preventDefault) {
                e.preventDefault();
            }
        },
        /**
         * 阻止冒泡
         */
        stopPropagation: function () {
            var e = this.originalEvent;
            this.isPropagationStopped = returnTrue;
            if (e && e.stopPropagation) {
                e.stopPropagation();
            }
        },
        /**
         * 组织同时其它事件冒泡
         */
        stopImmediatePropagation: function () {
            var e = this.originalEvent;
            this.isImmediatePropagationStopped = returnTrue;
            if (e && e.stopImmediatePropagation) {
                e.stopImmediatePropagation();
            }
            this.stopPropagation();
        }
    };

    util.each({
        mouseenter: "mouseover",
        mouseleave: "mouseout",
        pointerenter: "pointerover",
        pointerleave: "pointerout"
    }, function (orig, fix) {
        special[ orig ] = {
            delegateType: fix,
            bindType: fix,
            handle: function (event) {
                var ret,
                    target = this,
                    related = event.relatedTarget,
                    handleObj = event.handleObj;
                if (!related || (related !== target && !dom.contains(target, related))) {
                    event.type = handleObj.origType;
                    ret = handleObj.handler.apply(this, arguments);
                    event.type = fix;
                }
                return ret;
            }
        };
    });

    if (!support.focusinBubbles) {
        util.each({ focus: "focusin", blur: "focusout" }, function (orig, fix) {
            var handler = function (event) {
                dom.event.simulate(fix, event.target, dom.event.fix(event), true);
            };

            special[ fix ] = {
                setup: function () {
                    var doc = this.ownerDocument || this,
                        attaches = dom.event.data(doc, fix);

                    if (!attaches) {
                        doc.addEventListener(orig, handler, true);
                    }
                    dom.event.data(doc, fix, ( attaches || 0 ) + 1);
                },
                teardown: function () {
                    var doc = this.ownerDocument || this,
                        attaches = dom.event.data(doc, fix) - 1;

                    if (!attaches) {
                        doc.removeEventListener(orig, handler, true);
                        dom.event.data(doc, fix, undefined);
                    } else {
                        dom.event.data(doc, fix, attaches);
                    }
                }
            };
        });
    }
})();

module.exports = dom;
