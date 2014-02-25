var channel = require('cordova/channel');
channel.join(function () {
    require("hybrid/index").init();
}, [channel.onNativeReady]);
