import { Question, QuestionGroup, Survey } from "../survey/types.js";


export const tallyResults = (rawResults: any[], groups: QuestionGroup[]) => {
    const talliedResults: Record<string, any> = {};
    
    // Build question map for quick lookup
    const questionMap = new Map<string, Question>();
    if (groups) {
        groups.forEach(group => {
            group.questions.forEach(q => {
                questionMap.set(q.id, q);
            });
        });
    }
    
    // Tally each question
    questionMap.forEach((question, questionId) => {

        if (question.type === 'text') {
            // Collect all text responses
            const responses = rawResults
                .map(result => result[questionId])
                .filter(val => val && val.trim());
            
            talliedResults[questionId] = {
                question: question.question,
                type: 'text',
                responses,
                count: responses.length
            };
        } else if (question.type === 'radio') {
            // Count each option
            const counts: Record<number, number> = {};

                        rawResults.forEach(result => {
                const value = parseInt(result[questionId], 10);
                counts[value] = (counts[value] || 0) + 1;
            });
            
            talliedResults[questionId] = {
                question: question.question,
                type: 'radio',
                options: question.options,
                counts,
                total: rawResults.length
            };
        } else if (question.type === 'scale') {
            // Calculate average and distribution
            const values = rawResults                
                .map(result => parseInt(result[questionId], 10))
                .filter(val => !isNaN(val));
            
            const average = values.length > 0 
                ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)
                : 0;
            
            talliedResults[questionId] = {
                question: question.question,
                type: 'scale',
                range: question.scaleRange,
                average,
                responses: values.length,
                total: rawResults.length
            };

        } else if (question.type === 'checkbox') {
            // Count selections per option
            const counts: Record<number, number> = {};
            
            if (question.options) {
                for (let i = 0; i < question.options.length; i++) {
                    const fieldName = `${questionId}_${i}`;
                    counts[i] = rawResults.filter(result => 
                        parseInt(result[fieldName], 10) === 1
                    ).length;
                }
            }
            
            talliedResults[questionId] = {
                question: question.question,
                                type: 'checkbox',
                options: question.options,
                counts,
                total: rawResults.length
            };
        }
    });
    
    return talliedResults;
};