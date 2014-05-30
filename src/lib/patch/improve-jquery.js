/**
 * Created by 赤菁风铃 on 14-3-1.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 *
 * @note 提供与Jquery相似的开发方式
 * @note 引入此扩展会造成以下改动：
 */

var dom = require("../util/dom"),
    util = require("../util/util"),
    core = require("../core"),
    rootDomian = new UIObject(document),
    UIObject = require("../ui/UIObject").UIObject,
    jQuery = (function (window, undefined) {//初始化jquery对象
        var document = window.document,
            version = "@VERSION",
            arr = [],
            slice = [].slice,
            jQuery = function (domain, selector, context) {//由于jQuery函数在内部使用，处理new的操作交由外层进行，以简化代码书写
                this.domain = domain || rootDomian;
                this.init(selector, context);
            };

        jQuery.fn = jQuery.prototype = {
            // The current version of jQuery being used
            jquery: version,

            constructor: jQuery,

            // Start with an empty selector
            selector: "",

            // The default length of a jQuery object is 0
            length: 0,

            toArray: function () {
                return slice.call(this);
            },

            // Get the Nth element in the matched element set OR
            // Get the whole matched element set as a clean array
            get: function (num) {
                return num != null ?

                    // Return just the one element from the set
                    ( num < 0 ? this[ num + this.length ] : this[ num ] ) :

                    // Return all the elements in a clean array
                    slice.call(this);
            },

            // Take an array of elements and push it onto the stack
            // (returning the new matched element set)
            pushStack: function (elems) {

                // Build a new jQuery matched element set
                var ret = jQuery.merge(this.constructor(), elems);

                // Add the old object onto the stack (as a reference)
                ret.prevObject = this;
                ret.context = this.context;

                // Return the newly-formed element set
                return ret;
            },

            // Execute a callback for every element in the matched set.
            // (You can seed the arguments with an array of args, but this is
            // only used internally.)
            each: function (callback, args) {
                return jQuery.each(this, callback, args);
            },

            map: function (callback) {
                return this.pushStack(jQuery.map(this, function (elem, i) {
                    return callback.call(elem, i, elem);
                }));
            },

            slice: function () {
                return this.pushStack(slice.apply(this, arguments));
            },

            first: function () {
                return this.eq(0);
            },

            last: function () {
                return this.eq(-1);
            },

            eq: function (i) {
                var len = this.length,
                    j = +i + ( i < 0 ? len : 0 );
                return this.pushStack(j >= 0 && j < len ? [ this[j] ] : []);
            },

            end: function () {
                return this.prevObject || this.constructor(null);
            },

            // For internal use only.
            // Behaves like an Array's method, not like a jQuery method.
            push: push,
            sort: arr.sort,
            splice: arr.splice
        };

        return jQuery;
    })(window, undefined);


/**
 * 添加全局jQuery方法，此方法用于进行全局绑定，请注意用此函数绑定的事件需要手工销毁
 * @param selector
 * @param context
 * @returns {jQuery}
 */
core.jQuery = function (selector, context) {
    return new jQuery(null, selector, context);
};

/**
 * 为UIObject对象添加初始化Jquery的功能，此方法将会返回一个jQuery的副本，并限定当前UIObject为最大上下文，使用其绑定的事件将会在对象销毁时一同销毁
 */
UIObject.prototype.initJquery = function () {
    var self = this,
        F = function (selector, context) {
            return new jQuery(self, selector, context);
        };
    F.fn = F.prototype = jQuery.fn;
    return F;
};
