var cron = require('cron')
var intra = require('./intra')
import { clearAccounts } from './account'
import { isMaster } from '../vars'

async function plan() {
    clearAccounts();
    new cron.CronJob("0 */12 * * *", () => {
        if (isMaster)
            intra.fillDb();
    }, null, true);

    new cron.CronJob("0 * * * *", () => {
        if (isMaster)
            clearAccounts();
    }, null, true);
}

export = plan
