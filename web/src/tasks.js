var cron = require('cron')
var intra = require('./intra.js')

new cron.CronJob("0 0 * * *", () => {
    intra.fillDb();
}, null, true);
