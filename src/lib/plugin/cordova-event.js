/**
 * Created by 赤菁风铃 on 14-3-1.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 * @note 用于接受并发起和cordova相关的事件
 */

var EventEmmiter = require("../util/EventEmitter").EventEmitter;

module.exports = new EventEmmiter();