var path = require('path');
var util = require("util");
var url = require("url");
var http = require('http');
var connect = require("connect");
var httpProxy = require("http-proxy");

module.exports = function (grunt) {
    //入口函数，使用connect新建一个server 可以用来在开发时对远程数据进行请求
    grunt.task.registerMultiTask("proxy-server", "an javascript proxy server by connect", function () {
        var port = this.data.port;//监听的端口
        var project = this.target;//项目名称
        //请求的使用的代理服务器
        var proxy = httpProxy.createProxyServer({
            target: this.data.target,
            headers: {
                host: this.data.host
            }
        });
        //绑定请求错误
        proxy.on('error', function (err, req, res) {
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            res.end('Something went wrong. And we are reporting a custom error message.');
        });
        var done = this.async();//异步完成函数
        var app = connect();//生成connect对象
        app.use(connect.logger("dev"));//用户访问记录
        app.use(connect.compress({level: 9}));//启用返回值gzip压缩（由于文件下载比较大）
        app.use(connect.static(path.join(process.cwd(), 'build', project, "dev")));//启用静态文件模块
        app.use(connect.favicon());//当网站不指定icon时，返回一个icon
        app.use(function (req, res) {//对请求进行代理
            proxy.web(req, res);
        });
        http.createServer(app).listen(port || 3000, function () {
            console.log("proxy server for " + project + " is running on port " + port);
            done();
        });
    });
};
