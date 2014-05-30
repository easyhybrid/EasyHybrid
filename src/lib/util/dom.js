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
            ret = !parseFloat(window.getComputedStyle(marginDiv, null).marginRight);
            docElem.removeChild(container);
            return ret;
        }
    });

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
        var ret = dom.find(tag || "*", context);
        return tag === undefined || tag && dom.nodeName(context, tag) ?
            util.merge([ context ], ret) :
            ret;
    }

    function fixInput(src, dest) {
        var nodeName = dest.nodeName.toLowerCase();
        if (nodeName === "input" && rcheckableType.test(src.type)) {
            dest.checked = src.checked;
        } else if (nodeName === "input" || nodeName === "textarea") {
            dest.defaultValue = src.defaultValue;
        }
    }

    util.merge(dom, {
        /**
         * 判断文档是否是XML
         * @param doc {*}文档
         */
        isXML: function (doc) {
            var documentElement = doc && (doc.ownerDocument || doc).documentElement;
            return documentElement ? documentElement.nodeName !== "HTML" : false;
        },
        /**
         * 判断一个对象是不是window对象
         * @param obj
         * @returns {boolean}
         */
        isWindow: function (obj) {
            return obj != null && obj === obj.window;
        },
        /**
         * 将-连接的CSS属性转换成浏览器认识的属性
         * @param str {string}
         * @returns {string}
         */
        camelCase: function (str) {
            return str.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
        },
        /**
         * 判断节点名是否与给定值相同
         * @param elem {Element} 节点
         * @param name {string} 名字
         * @returns {boolean}
         */
        nodeName: function (elem, name) {
            return !!(elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase());
        },
        /**
         * 将字符串使用指定上下文转成元素数组（请注意所有的scripts节点不会执行，框架不推荐将js写在模板中）
         * @param data {string} HTML字符串
         * @param [context] {*} 上下文
         * @returns [Array]
         */
        parse: function (data, context) {
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
        },
        /**
         * 克隆一个元素(请注意克隆不能克隆任何事件)
         * @param elem {Element} 要复制的元素
         * @returns {Element}
         */
        clone: function (elem) {
            var i, l, srcElements, destElements,
                clone = elem.cloneNode(true);
            if ((!support.checkClone || !support.noCloneChecked ) && ( elem.nodeType === 1 || elem.nodeType === 11 ) && !dom.isXML(elem)) {
                destElements = getAll(clone);
                srcElements = getAll(elem);
                for (i = 0, l = srcElements.length; i < l; i++) {
                    fixInput(srcElements[ i ], destElements[ i ]);
                }
            }
            return clone;
        },
        /**
         * 销毁元素
         * @param elem {Element} 要销毁的元素
         */
        destroy: function (elem) {
            var garbageBin = document.getElementById('LeakGarbageBin');
            if (!garbageBin) {
                garbageBin = document.createElement('div');
                garbageBin.id = 'LeakGarbageBin';
                garbageBin.style.display = 'none';
                document.body.appendChild(garbageBin);
            }
            garbageBin.appendChild(elem);
            garbageBin.textContent = '';
        }
    });

    wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
    wrapMap.th = wrapMap.td;
})();

//HTML核心查询工具（提供与sizzle相同的接口）
(function () {
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
            var compare = b.compareDocumentPosition && a.compareDocumentPosition && a.compareDocumentPosition(b);
            if (compare) {
                /*jshint bitwise:false */
                if (compare & 1) {
                    if (a === document || dom.contains(document, a)) {
                        return -1;
                    }
                    if (b === document || dom.contains(document, b)) {
                        return 1;
                    }
                    return 0;
                }
                return compare & 4 ? -1 : 1;
                /*jshint bitwise:true */
            }
            return a.compareDocumentPosition ? -1 : 1;
        };
    util.merge(dom, {
        /**
         * 在指定上下文查找符合表达式的元素
         * @param selector {string} 表达式
         * @param [context] {Element|undefined} 元素
         * @param [results] {Array|undefined} 原始元素（可以是空数组，也可以其它是添加到结果里面的元素，引用传递）
         * @param [seed] {Array|undefined} 搜索范围（如果传递此参数，将只匹配数组中的这些元素，而不是去页面中查找）
         * @return {Array}
         */
        find: function (selector, context, results, seed) {
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
        },
        /**
         * 获取元素的文本
         * @param elem {Element} 要获取的元素
         * @returns {*}
         */
        text: function (elem) {
            var ret = "",
                nodeType = elem.nodeType;
            if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
                return elem.textContent;
            } else if (nodeType === 3 || nodeType === 4) {
                return elem.nodeValue;
            }
            return ret;
        },
        /**
         * 检查一个元素是否包含另外一个元素
         * @param a {Element|HTMLDocument} 包含元素
         * @param b {Element} 被包含元素
         * @returns {boolean}
         */
        contains: function (a, b) {
            var adown = a.nodeType === 9 ? a.documentElement : a,
                bup = b && b.parentNode;
            return a === bup || !!( bup && bup.nodeType === 1 && adown.contains(bup) );
        },
        /**
         * 对DOM数组进行排序并去除重复项
         * @param results {Array}
         */
        unique: function (results) {
            return util.unique(results, false, selector_sortOrder);
        }
    });

    util.merge(dom.find, {
        /**
         * 在指定数组中找到所有匹配的元素
         * @param expr {string} 表达式
         * @param elements {Array} 元素数组
         * @returns {Array}
         */
        matches: function (expr, elements) {
            return dom.find(expr, null, null, elements);
        },
        /**
         * 检查元素是否匹配表达式(此函数会匹配目标所在的context，对于在DOM树中的元素，为document，否则为元素所在的树或者文档片段)
         * @param elem {Element} 要匹配的元素
         * @param expr {string} 匹配表达式
         * @returns {*}
         */
        matchesSelector: function (elem, expr) {
            return matches.call(elem, expr);
        },
        /**
         * 获取元素的特征值
         * @param elem {Element} DOM节点
         * @param name {string} 要获取或设置的特征名
         * @returns {string}
         */
        attr: function (elem, name) {
            return elem.getAttribute(name);
        }
    });
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

    util.merge(dom, {
        /**
         * 获取或者设置元素的特征
         * @param elem {Element} DOM节点
         * @param name {string} 要获取或设置的特征名
         * @param value {string|null|undefined} 要获取或设置的特征值，当值为null时表示删除，当值为undefined时表示获取，其它表示设置
         */
        attr: function (elem, name, value) {
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
        },
        /**
         * 获取或者设置元素的属性
         * @param elem {Element} DOM节点
         * @param name {string} 要获取或设置的属性名
         * @param value {*|undefined} 要获取或设置的属性值，当值为undefined时表示获取，其它表示设置
         */
        prop: function (elem, name, value) {
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
        },
        /**
         * 获取或者设置元素的值
         * @param elem {Element} DOM节点
         * @param value {string|undefined}要获取或设置的元素值，当值为undefined时表示获取，其它表示设置
         */
        val: function (elem, value) {
            var nType , hooks, ret;
            if (!elem || (nType = elem.nodeType) === 3 || nType === 8 || nType === 2) {
                return;
            }
            hooks = valHooks[ elem.type ] || valHooks[ elem.nodeName.toLowerCase() ];
            if (arguments.length < 2) {
                if (hooks && "get" in hooks && (ret = hooks.get(elem, "value")) !== undefined) {
                    return ret;
                }
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
        },
        /**
         * 添加样式
         * @param elem {HTMLElement} 要设置的元素
         * @param classname {string} 样式名
         */
        addClass: function (elem, classname) {
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
        },
        /**
         * 删除样式
         * @param elem {HTMLElement} 要设置的元素
         * @param classname {string} 样式名
         */
        removeClass: function (elem, classname) {
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
        },
        /**
         * 获取或者设置data-attribute
         * @param elem {Element} DOM节点
         * @param name {string} 要获取或设置的data-attribute名（不带data-）
         * @param value {string|undefined} 要获取或设置的data-attribute值，当值为undefined时表示获取，其它表示设置
         */
        data: function (elem, name, value) {
            return dom.attr(elem, "data-" + name.replace(rmultiDash, "-$1").toLowerCase(), value);
        }
    });

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

//处理项目样式
(function () {
    var support = dom.support,
        cssProps = dom.cssProps = {
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
        var i = extra === ( isBorderBox ? "border" : "content" ) ?
                4 :
                name === "width" ? 1 : 0,

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


    util.merge(dom, {
        /**
         * 获取或者设置元素的style
         * @param elem {HTMLElement} DOM节点
         * @param name {string} 要获取或设置的样式名
         * @param [value] {string|undefined} 要获取或设置的样式值，当值为undefined时表示获取，其它表示设置
         * @param [extra] {bool} 是否强制返回数值，如果为false则当属性值转化成数字时，如果结果为NaN或者Infinity则返回字符串
         */
        style: function (elem, name, value, extra) {
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
        },
        /**
         * 获取元素的计算出的样式
         * @param elem {HTMLElement} DOM节点
         * @param name {string} 要的样式名
         * @param extra {bool} 是否强制返回数值，如果为false则当属性值转化成数字时，如果结果为NaN或者Infinity则返回字符串
         * @param styles {*|undefined} 元素的当前样式，可以不传，如果要获取一个元素的多个属性时，可以使用此参数加快速度
         */
        css: function (elem, name, extra, styles) {
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
        },
        position: function (elem) {
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
        },
        offset: function (elem) {
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
        }
    });

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

module.exports = dom;
