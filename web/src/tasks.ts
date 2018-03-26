var cron = require('cron')
var intra = require('./intra')

new cron.CronJob("0 0 * * *", () => {
    intra.fillDb();
}, null, true);

export = undefined
