"use strict";
var cron = require('cron');
var intra = require('./intra');
new cron.CronJob("0 0 * * *", function () {
    intra.fillDb();
}, null, true);
module.exports = undefined;
//# sourceMappingURL=tasks.js.map