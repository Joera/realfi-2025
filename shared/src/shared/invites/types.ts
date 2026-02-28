export interface CardData {
    nullifier: string;
    batchId: string;
    signature: string;
    surveyOwner: string;
    surveyId: string;
}

export interface CardSecret {
    nullifier: string
    signature: string
    url: string;
    svgString: string
}