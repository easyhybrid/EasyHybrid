/**
 * Created by 赤菁风铃 on 14-3-1.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 * @note 地理信息
 */

var lastPosition = null,
    EARTH_RADIUS = 6378137.0,    //单位M
    PI = Math.PI,
    base = require("./plugin");

/**
 * 计算两个经纬度之间的实际距离
 * @param pos1 经纬度1
 * @param pos2 经纬度2
 */
exports.distance = function (pos1, pos2) {
    return getFlatternDistance(pos1.latitude, pos1.longitude, pos2.latitude, pos2.longitude);
};

exports.position = function (successCallback, errorCallback, options) {
    options = parseParameters(options);
    var timeoutTimer = {
        timer: null
    };
    var win = function (p) {
        clearTimeout(timeoutTimer.timer);
        if (!(timeoutTimer.timer)) {
            return;
        }
        p = format(p);
        lastPosition = p;
        successCallback(p);
    };
    var fail = function (e) {
        clearTimeout(timeoutTimer.timer);
        timeoutTimer.timer = null;
        if (errorCallback) {
            errorCallback(e.code, e.message);
        }
    };

    if (lastPosition && options.maximumAge && (((new Date()).getTime() - lastPosition.timestamp.getTime()) <= options.maximumAge)) {
        successCallback(lastPosition);
    } else if (options.timeout === 0) {
        fail({
            code: 3,
            message: "您请求立刻返回结果，但是当前没有缓冲位置"
        });
    } else {
        if (options.timeout !== Infinity) {
            timeoutTimer.timer = createTimeout(fail, options.timeout);
        } else {
            timeoutTimer.timer = true;
        }
        base.exec(win, fail, "Geolocation", "getLocation", [options.enableHighAccuracy, options.maximumAge]);
    }
    return timeoutTimer;

};

function format(p) {
    var pos = {
        latitude: p.latitude,
        longitude: p.longitude,
        accuracy: p.accuracy,
        altitude: (p.altitude !== undefined ? p.altitude : null),
        heading: ( p.heading !== undefined ? p.heading : null),
        velocity: ( p.velocity !== undefined ? p.velocity : null),
        altitudeAccuracy: ( p.altitudeAccuracy !== undefined ? p.altitudeAccuracy : null)
    };
    if (pos.velocity === null || pos.velocity === 0) {
        pos.heading = NaN;
    }
    return {
        coords: pos,
        timestamp: (p.timestamp === undefined ? new Date() : ((p.timestamp instanceof Date) ? p.timestamp : new Date(p.timestamp)))
    };
}

function parseParameters(options) {
    var opt = {
        maximumAge: 0,
        enableHighAccuracy: false,
        timeout: Infinity
    };

    if (options) {
        if (options.maximumAge !== undefined && !isNaN(options.maximumAge) && options.maximumAge > 0) {
            opt.maximumAge = options.maximumAge;
        }
        if (options.enableHighAccuracy !== undefined) {
            opt.enableHighAccuracy = options.enableHighAccuracy;
        }
        if (options.timeout !== undefined && !isNaN(options.timeout)) {
            if (options.timeout < 0) {
                opt.timeout = 0;
            } else {
                opt.timeout = options.timeout;
            }
        }
    }

    return opt;
}

function createTimeout(errorCallback, timeout) {
    var t = setTimeout(function () {
        clearTimeout(t);
        t = null;
        errorCallback(3, "请求超时");
    }, timeout);
    return t;
}


function getRad(d) {
    return d * PI / 180.0;
}

function getFlatternDistance(lat1, lng1, lat2, lng2) {
    if (typeof lat1 !== 'number') {
        lat1 = parseFloat(lat1);
    }
    if (typeof lng1 !== 'number') {
        lng1 = parseFloat(lng1);
    }
    if (typeof lat2 !== 'number') {
        lat2 = parseFloat(lat2);
    }
    if (typeof lng2 !== 'number') {
        lng2 = parseFloat(lng2);
    }
    var f = getRad((lat1 + lat2) / 2);
    var g = getRad((lat1 - lat2) / 2);
    var l = getRad((lng1 - lng2) / 2);

    var sg = Math.sin(g);
    var sl = Math.sin(l);
    var sf = Math.sin(f);

    var s, c, w, r, d, h1, h2;
    var fl = 1 / 298.257;

    sg = sg * sg;
    sl = sl * sl;
    sf = sf * sf;

    s = sg * (1 - sl) + (1 - sf) * sl;
    c = (1 - sg) * (1 - sl) + sf * sl;

    w = Math.atan(Math.sqrt(s / c));
    if (w === 0) {
        return 0;
    }
    r = Math.sqrt(s * c) / w;
    d = 2 * w * EARTH_RADIUS;
    h1 = (3 * r - 1) / 2 / c;
    h2 = (3 * r + 1) / 2 / s;

    return d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
}


