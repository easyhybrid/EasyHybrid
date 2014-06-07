/**
 * Created by 赤菁风铃 on 14-6-6.
 */
module.exports = function (core) {
    var text = require("./tpl/index.html").render();
    console.log(text);
    console.log(core.dom.parse(text));

};