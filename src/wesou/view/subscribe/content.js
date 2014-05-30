module.exports = function (core, data, cb) {
    cb(core.ui.create({
        type: core.ui.UIButton,
        args: "<div class='absolute full-screen view'>建设中</div>",
        click: function () {
            core.back();
        }
    }));
};