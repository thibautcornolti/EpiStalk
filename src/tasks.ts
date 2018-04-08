var cron = require('cron')
var intra = require('./intra')
import { isMaster } from '../vars'

async function plan() {
    intra.fillDb("nicolas.polomack@epitech.eu");
    new cron.CronJob("0 */12 * * *", () => {
        if (isMaster)
            intra.fillDb();
    }, null, true);
}

export = plan
