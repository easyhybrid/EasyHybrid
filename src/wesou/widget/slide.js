module.exports = function (core) {
    var _transform = core.dom.prefixStyle('transform'),
        _transition = {
            transitionTimingFunction: core.dom.prefixStyle('transitionTimingFunction'),
            transitionDuration: core.dom.prefixStyle('transitionDuration'),
            transitionDelay: core.dom.prefixStyle('transitionDelay')
        },
        opened = false,
        root = core.root,
        current = "shop",
        slide = new core.ui.UIButtonGroup("slide");

    slide.append(new core.ui.UIObject("<div class='slide-header'>www.wesou.cn</div>"));
    var shop = new core.ui.UIButton("<div class='slide-shop slide-item'>搜索</div>");
    shop.on("click", function () {
        if (current !== "shop") {
            current = "shop";
            core.href("shop/index");
        }
        slide.hide();
    });
    slide.append("shop", shop);
    var subscribe = new core.ui.UIButton("<div class='slide-subscribe slide-item'>订阅</div>");
    subscribe.on("click", function () {
        if (current !== "subscribe") {
            current = "subscribe";
            core.href("subscribe/index");
        }
        slide.hide();
    });
    slide.append("subscribe", subscribe);
    var notice = new core.ui.UIButton("<div class='slide-notice slide-item'>发布</div>");
    notice.on("click", function () {
        if (current !== "notice") {
            current = "notice";
            core.href("notice/index");
        }
        slide.hide();
    });
    slide.append("notice", notice);
    var compass = new core.ui.UIButton("<div class='slide-compass slide-item'>深入</div>");
    compass.on("click", function () {
        if (current !== "compass") {
            current = "compass";
            core.href("compass/index");
        }
        slide.hide();
    });
    slide.append("compass", compass);
    var more = new core.ui.UIButton("<div class='slide-more slide-item'>更多</div>");
    more.on("click", function () {
        if (current !== "more") {
            current = "more";
            core.href("more/index");
        }
        slide.hide();
    });
    slide.append("more", more);

    slide.show = function (type) {
        if (type) {
            current = type;
            slide.active(type);
        }
        if (!opened) {
            root.style[_transition.transitionDuration] = "200ms";
            root.style[_transform] = 'translate(227px,0px)';
            setTimeout(function () {
                root.style[_transition.transitionDuration] = "0ms";
                opened = true;
            }, 300);
        }
    };

    slide.hide = function () {
        if (opened) {
            root.style[_transition.transitionDuration] = "200ms";
            root.style[_transform] = 'translate(0px,0px)';
            setTimeout(function () {
                root.style[_transition.transitionDuration] = "0ms";
                opened = false;
            }, 300);
        }
    };
    slide.attach(root);
    return slide;

};