import { randomUUID } from 'crypto';


export const surveyCollectionSchema = (surveySlug: string) => {

    return {
        _id: randomUUID(),                 
        name: `survey-${surveySlug}`,
        type: "standard",                  
        schema: {
            type: "object",
            properties: {
                _id: { type: "string", format: "uuid" },
                surveyId: { type: "string" },
                answers: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            questionId: { type: "string" },
                            answer: {
                                type: "object",
                                properties: { "%share": { type: "string" } }
                            }
                        }
                    }
                }
            }
        }
    };
};
