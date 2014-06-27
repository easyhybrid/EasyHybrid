/**
 * Created by 清月_荷雾 on 14-2-10.
 * author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * 一个可以进行数据缓存的分页控件
 * @note 如果不进行数据缓存，或者进行其它复杂操作，请使用UIScroll
 */

var util = require("../util/util"),
    UIScroll = require('./UIScroll').UIScroll;

/**
 * 分页数据缓存控件
 * @param options
 * @constructor
 */
function UIPager(options) {
    if (!options || typeof options === "string" || options.nodeType) {
        options = {
            html: options
        };
    }
    options.event = true;
    UIScroll.call(this, options);
    var me = this;
    me._options = {};
    me.size = options.size || 20;
    me.max = options.max || 50;
    me.reset();
    me.on(options.direction || "bottom", function () {
        me.load();
    });
}

util.inherits(UIPager, UIScroll);

/**
 * 重置控件
 */
UIPager.prototype.reset = function () {
    var me = this;
    me.cache = [];
    me.current = 0;
    me.loading = false;
    me.index = 1;
    me.uuid = util.uuid();
    me.finish = false;
    me.clear(true);
};

UIPager.prototype.load = function () {
    var me = this;

    if (me.finish || me.loading || me.index > me.max || me.index === me.max && me.cache.length > 0) {
        return;
    }
    me.emit("start");
    me.loading = true;

    //缓冲数据，并形成闭包
    var uuid = me.uuid;
    var current = me.index;
    var loaded = 0;

    //事件回调
    function done(data) {
        me.loading = false;
        if (uuid !== me.uuid) {
            return;
        }
        if (!data || data.length === 0 || current === 1 && data.length <= me.size) {
            me.finish = true;
        }
        util.each(data, function (i, item) {
            me.cache.push(item);
            if (loaded === true || loaded >= me.size) {
                return;
            }
            loaded++;
            me.emit("build", me.current++, item);
        });
        if (loaded !== true) {
            me.emit("finish");
        }
    }

    while (me.current < me.cache.length) {
        loaded = true;
        me.emit("build", me.current, me.cache[me.current++]);
    }
    if (loaded === true) {
        me.emit("finish");
    }
    me.emit("load", me.index, me.index++ === 1 ? me.size * 2 : me.size, done);
    if (me.index === 2) {
        me.index++;
    }
};

exports.UIPager = UIPager;
