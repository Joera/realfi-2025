import { randomUUID } from "crypto";
import { SurveyConfig } from "./types";


export const createSurveyCollectionSchema = (surveySlug: string, config: SurveyConfig) => {
    const properties: Record<string, any> = {
        _id: { type: "string", format: "uuid" },
        surveyId: { type: "string" },
    };

    for (const question of config.questions) {
        switch (question.type) {
            case "radio":
            case "scale":
                // Single integer - SUM werkt
                properties[question.id] = {
                    type: "object",
                    properties: { "%share": { type: "integer" } }
                };
                break;

            case "checkbox":
                // Elke optie apart - SUM per optie
                for (let i = 0; i < question.options.length; i++) {
                    properties[`${question.id}_${i}`] = {
                        type: "object",
                        properties: { "%share": { type: "integer" } }  // 0 of 1
                    };
                }
                break;

            case "text":
                // Geen blind compute, alleen ACL
                properties[question.id] = { type: "string" };
                break;
        }
    }

    return {
        _id: randomUUID(),
        name: `survey-${surveySlug}`,
        type: "standard",
        schema: { type: "object", properties }
    };

    
}