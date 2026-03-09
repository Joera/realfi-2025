import { IServices } from "./services";

interface UserData {


}

export class User {

    public data: UserData;
    public services: IServices;

    constructor(services: IServices, data: UserData) {
        this.data = data;
        this.services = services
    }

    // do we need this on a survey class ??? 
    async createUnlinkableAccount(surveyId: string) {

        const signature = await this.services.waap.signMessage(`Create unlinkable account to participate in S3ntiment survey ${surveyId}`);

        const unlinkableKey = this.services.oprf.getSecp256k1(signature);

        console.log(unlinkableKey);

        // oprf.transport-union.dev 
    }

    isParticipant() {


    }



}