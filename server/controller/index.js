var fs = require("fs");
var path = require("path");


//系统首页
exports.index = function (req, res) {
    var project = {};
    var flist = fs.readdirSync(path.join(__dirname, "../src"));
    flist.forEach(function (file) {
        if (file === "common") {
            return;
        }
        var stat = fs.lstatSync(path.join(__dirname, "../src", file));
        if (stat.isFile()) {
            return;
        }
        var plist = fs.readdirSync(path.join(__dirname, "../src", file));
        plist.forEach(function (p) {
            var stat = fs.lstatSync(path.join(__dirname, "../src", file, p));
            if (stat.isFile()) {
                return;
            }
            project[file] = project[file] || [];
            project[file].push(p);
        });
    });
    req.render(project, function (err, html) {
        res.end(html);
    });
};