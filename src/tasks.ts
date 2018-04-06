var cron = require('cron')
var intra = require('./intra')

async function plan() {
    new cron.CronJob("0 */12 * * *", () => {
        intra.fillDb();
    }, null, true);
}

export = plan
