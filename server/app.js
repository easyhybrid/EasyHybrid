/**
 * 初始化网站并加载数据
 */

var http = require('http');
var path = require('path');
var connect = require("connect");
var util = require("util");
var formidable = require("formidable");
var url = require("url");
var jade = require('jade');


var app = connect();
app.use(connect.logger("dev"));//用户访问记录
app.use(connect.compress({level: 9}));//启用返回值gzip压缩（由于文件下载比较大）
app.use(connect.static(path.join(__dirname, '../build')));//启用静态文件模块
app.use(connect.favicon());//当网站不指定icon时，返回一个icon
app.use(connect.query());//处理get请求参数
app.use(connect.urlencoded());//解析以urlencoded格式传输的内容
app.use(function (req, res, next) { //处理文件上传
    var str = req.headers['content-type'] || '';
    if ('multipart/form-data' != str.split(';')[0].toLowerCase()) {
        next();
        return;
    }
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        req.body = fields;
        req.files = files;
        next();
    });
});
app.use(function (req, res, next) {
    var pathname = url.parse(req.url).pathname.split("/");
    pathname.shift();
    pathname[0] = pathname[0] || "index";
    pathname[1] = pathname[1] || "index";
    req.render = function (source, options, func) {
        if (!func) {
            func = options;
            options = source;
            source = pathname.join("/");
        }
        if (!func) {
            func = options;
            options = {};
        }
        if (!source) {
            source = pathname;
        }
        else if (source.indexOf("/") < 0) {
            source = pathname[0] + "/" + source;
        }
        source = path.join(__dirname, "view", source + ".jade");
        jade.renderFile(source, options, func);
    };
    try {
        var model = require("./controller/" + pathname[0]);
        model[ pathname[1]](req, res);
    } catch (e) {
        next(e);
    }
});
var port = process.env.PORT || 3000;
http.createServer(app).listen(port, function () {
    console.log('webservice is start ' + port);
});


