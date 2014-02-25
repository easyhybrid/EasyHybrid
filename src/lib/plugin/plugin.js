/**
 * Created by 清月_荷雾 on 14-2-16.
 * @author 清月_荷雾(441984145@qq.com)
 *        赤菁风铃(liuxuanzy@qq.com)
 * 插件工具类
 * @note 用户自己定义的插件和系统定义的插件均可注入到这个对象内
 * @note 可以在plugin内使用util，但是不推荐使用ui对象
 */
var mime = require("../util/mime");

function upload(uri, target, params, callBack) {
    var options = new FileUploadOptions();
    options.fileKey = "Filedata";
    for (var x in mime) {
        if (!mime.hasOwnProperty(x)) {
            continue;
        }
        if (uri.indexOf(x) > 0) {
            options.mimeType = mime[x];
            options.fileName = new Date().formatDate("yyyy-MM-dd HH:mm:ss") + Math.random().toString().replace(".", "") + "." + x;
            break;
        }
    }
    options.mimeType = options.mimeType || "application/octet-stream";
    options.fileName = options.fileName || new Date().formatDate("yyyy-MM-dd HH:mm:ss") + Math.random().toString().replace(".", "") + ".buffer";
    options.params = params;
    var ft = new FileTransfer();
    ft.upload(uri, target, function (data) {
        callBack(true, data);
    }, function () {
        callBack(false);
    }, options);
}

exports.upload = upload;