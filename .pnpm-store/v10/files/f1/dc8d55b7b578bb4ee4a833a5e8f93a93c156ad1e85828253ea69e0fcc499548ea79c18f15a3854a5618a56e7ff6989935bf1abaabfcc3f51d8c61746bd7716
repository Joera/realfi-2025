import { logs } from 'named-logs';
export const logger = logs('rocketh');
const loggerProgressIndicator = {
    start(msg) {
        if (msg) {
            logger.log(msg);
        }
        return this;
    },
    stop() {
        return this;
    },
    succeed(msg) {
        if (msg) {
            logger.log(msg);
        }
        return this;
    },
    fail(msg) {
        if (msg) {
            logger.error(msg);
        }
        return this;
    },
};
let lastSpin = loggerProgressIndicator;
export function spin(message) {
    lastSpin = lastSpin.start(message);
    return lastSpin;
}
//# sourceMappingURL=logging.js.map