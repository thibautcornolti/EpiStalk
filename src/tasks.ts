var cron = require('cron')
var intra = require('./intra')
import { isMaster } from '../vars'

async function plan() {
    new cron.CronJob("0 */12 * * *", () => {
        if (isMaster)
            intra.fillDb();
    }, null, true);
}

export = plan
