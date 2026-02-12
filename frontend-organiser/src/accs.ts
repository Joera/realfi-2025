
export const accsForSurveyOwner = (surveyId: string) => {

        const rawCondition: any = {
            chain: "base",
            contractAddress: import.meta.env.VITE_SURVEYSTORE_CONTRACT,
            functionName: "isOwner",

            functionParams: [":userAddress", surveyId],

            functionAbi: {
            name: "isOwner",
            inputs: [
                { name: "authSigAddress", type: "address" },
                { name: "surveyId", type: "string" }
            ],
            outputs: [
                { name: "", type: "bool" }
            ],
            stateMutability: "view",
            type: "function"
            },

            returnValueTest: {
                key: "",
                comparator: "=",
                value: "true"
            }
        };

        return [rawCondition]
    }

export const accsForUser = () => {
    const rawCondition: any = {
        chain: "base",
        contractAddress: import.meta.env.VITE_SURVEYSTORE_CONTRACT,
        functionName: "isNullifierUsed",
        
        functionParams: [":nullifier", ":batchId"], // Both are placeholders
        
        functionAbi: {
            name: "isNullifierUsed",
            inputs: [
                { name: "nullifier", type: "string" },
                { name: "batchId", type: "string" }
            ],
            outputs: [
                { name: "", type: "bool" }
            ],
            stateMutability: "view",
            type: "function"
        },
        
        returnValueTest: {
            key: "",
            comparator: "=",
            value: "true"
        }
    };

    return [rawCondition];
}