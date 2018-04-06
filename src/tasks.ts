var cron = require('cron')
var intra = require('./intra')

function plan() {
    new cron.CronJob("0 */12 * * *", () => {
        intra.fillDb();
    }, null, true);
}

export = plan
