import { BaseProvider } from './BaseProvider.js';
import { logs } from 'named-logs';
const console = logs('rocketh-provider');
export class TransactionHashTrackerProvider extends BaseProvider {
    transactionHashes = [];
    constructor(provider) {
        super(provider);
    }
    async _request(args) {
        console.debug(`calling ${args.method} with ${args.params?.length || 0} arguments`);
        const response = await this.provider.request(args);
        if (args.method === 'eth_sendRawTransaction' || args.method === 'eth_sendTransaction') {
            this.transactionHashes.push(response);
        }
        return response;
    }
}
//# sourceMappingURL=TransactionHashTracker.js.map