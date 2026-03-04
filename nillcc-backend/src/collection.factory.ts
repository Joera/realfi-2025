import { Question, Survey } from '@s3ntiment/shared';
import { randomUUID } from 'crypto';


export const createStandardSurveyCollectionSchema = (config: Survey) => {
    
    
    const properties: Record<string, any> = {
        _id: { type: "string", format: "uuid" },
        // surveyId: { type: "string" },
    };

    if (!config.groups) {
        return {
            _id: config.id,
            name: config.id || config.title || 'untitled',
            type: "standard",
            schema: { type: "object", properties }
        };
    }

    for (const group of config.groups) {
        for (const question of group.questions) {
            addQuestionProperties(properties, question);
        }
    }

    return {
        _id: config.id,
        name: config.id || config.title || 'untitled',
        type: "owned",
        schema: { type: "object", properties }
    };
}

export const createOwnedSurveyCollectionSchema = (config: Survey) => {
    const properties: Record<string, any> = {
        _id: { type: "string", format: "uuid" },
        // surveyId: { type: "string" },
    };

    if (!config.groups) {
        return {
            _id: config.id,
            name: config.id || config.title || 'untitled',
            type: "owned",
            schema: { type: "object", properties }
        };
    }

    for (const group of config.groups) {
        for (const question of group.questions) {
            addQuestionProperties(properties, question);
        }
    }

    return {
        _id: config.id,
        name: config.id || config.title || 'untitled',
        type: "owned",
        schema: { type: "object", properties }
    };

    // return {
    //     _id: randomUUID(),
    //     name: "test-owned",
    //     type: "owned",
    //     schema: {
    //         type: "object",
    //         properties: {
    //             _id: { type: "string", format: "uuid" },
    //             name: { type: "string" },
    //             email: {
    //                 type: "object",
    //                 properties: { "%share": { type: "string" } },
    //                 required: ["%share"]
    //             }
    //         },
    //         required: ["_id"]
    //     }
    // }
}

function addQuestionProperties(properties: Record<string, any>, question: Question) {
    switch (question.type) {
        case "radio":
        case "scale":
            // Single integer - SUM works
            properties[question.id] = {
                type: "object",
                properties: { "%share": { type: "integer" } }
            };
            break;

        case "checkbox":
            // Each option separate - SUM per option
            if (question.options) {
                for (let i = 0; i < question.options.length; i++) {
                    properties[`${question.id}_${i}`] = {
                        type: "object",
                        properties: { "%share": { type: "integer" } }  // 0 or 1
                    };
                }
            }
            break;

        case "text":
            // No blind compute, only ACL
            properties[question.id] = { type: "string" };
            break;
    }
}
