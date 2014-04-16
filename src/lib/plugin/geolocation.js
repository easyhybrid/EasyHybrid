/**
 * Created by 赤菁风铃 on 14-3-1.
 * @author 清月_荷雾(441984145@qq.com)
 *         赤菁风铃(liuxuanzy@qq.com)
 * @note 地理信息
 */

var EARTH_RADIUS = 6378137.0;    //单位M
var PI = Math.PI;

function getRad(d) {
    return d * PI / 180.0;
}
/**
 * approx distance between two points on earth ellipsoid
 * @param {Object} lat1 纬度1
 * @param {Object} lng1 经度1
 * @param {Object} lat2
 * @param {Object} lng2
 */
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


/**
 * 计算两个经纬度之间的实际距离
 * @param pos1 经纬度1
 * @param pos2 经纬度2
 */
exports.distance = function (pos1, pos2) {
    return getFlatternDistance(pos1.latitude, pos1.longitude, pos2.latitude, pos2.longitude);
};

exports.gps = function (success, fail) {
    //    success({
    //        latitude: 27,
    //        longitude: 118
    //    });
    //    return;
    navigator.geolocation.getCurrentPosition(function (p) {
        success({
            latitude: p.coords.latitude,
            longitude: p.coords.longitude
        });
    }, fail);
};