import { randomUUID } from "crypto";
import { NillionService } from "./nillion.service.js";

const surveyResultsCollectionId = randomUUID();

const surveyResultsCollection = {
  _id: surveyResultsCollectionId,
  type: 'owned',
  name: 'Survey Results Collection',
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'array',
    uniqueItems: true,
    items: {
      type: 'object',
      properties: {
        _id: { 
          type: 'string', 
          format: 'uuid' 
        },
        surveyId: { 
          type: 'string' // Filter by this for specific surveys
        },
        answers: {
          // Array of answer objects - secret shared
          type: 'array',
          items: {
            type: 'object',
            properties: {
              questionId: { 
                type: 'string' 
              },
              questionText: {
                // Store the full question for reference
                type: 'string'
              },
              questionType: {
                // Type of question for proper parsing
                type: 'string',
                enum: ['radio', 'checkbox', 'text', 'scale']
              },
              answer: {
                // Secret shared answer - can be string, array, or number
                type: "object",
                properties: {
                  "%share": { 
                    type: "string" 
                  }
                },
                required: ["%share"]
              }
            },
            required: ['questionId', 'questionText', 'questionType', 'answer']
          }
        }
      },
      required: ['_id', 'surveyId', 'answers']
    }
  }
};


const main = async () => {

    console.log("collection_id", surveyResultsCollectionId);

    const nill = new NillionService();

    await nill.init();
    const res = await nill.createCollection(surveyResultsCollection);
    console.log(res)
}

main(); 