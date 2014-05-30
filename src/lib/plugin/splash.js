var base = require("./plugin");

/**
 * 显示splash
 */
exports.show = function () {
    base.exec(null, null, "SplashScreen", "show", []);
};

/**
 * 隐藏splash
 */
exports.hide = function () {
    base.exec(null, null, "SplashScreen", "hide", []);
};
