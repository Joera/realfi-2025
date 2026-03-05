import { Question, Survey } from "../index.js";

export const prepareAnswers = (answers: any, surveyConfig: Survey) => {
    const questionMap = new Map<string, Question>();
    
    if (surveyConfig.groups) {
        surveyConfig.groups.forEach(group => {
            group.questions.forEach(q => {
                questionMap.set(q.id, q);
            });
        });
    }

    return answers.map((answer: any) => {
        const question = questionMap.get(answer.questionId);
        
        if (answer.questionType === 'radio') {
            // Find the index of the selected option
            const optionIndex = question?.options?.findIndex(opt => opt === answer.answer) ?? -1;
            return {
                questionId: answer.questionId,
                questionText: answer.questionText,
                questionType: answer.questionType,
                answer: optionIndex >= 0 ? optionIndex : 0
            };
        } else if (answer.questionType === 'scale') {
            const rating = parseInt(String(answer.answer), 10);
            return {
                questionId: answer.questionId,
                questionText: answer.questionText,
                questionType: answer.questionType,
                answer: isNaN(rating) ? 0 : rating
            };
        } else if (answer.questionType === 'checkbox') {
            const selected = Array.isArray(answer.answer)
                ? answer.answer.map((val: any) => question?.options?.indexOf(val) ?? -1).filter((i: number) => i >= 0)
                : [];
            return {
                questionId: answer.questionId,
                questionText: answer.questionText,
                questionType: answer.questionType,
                answer: selected
            };
        } else {
            return {
                questionId: answer.questionId,
                questionText: answer.questionText,
                questionType: answer.questionType,
                answer: String(answer.answer)
            };
        }
    });
}
    
const ensureAllot = (content: string | number | { "%allot": string | number }): { "%allot": string } => {
    if (content && typeof content === "object" && "%allot" in content) {
        return { "%allot": String(content["%allot"]) };
    }
    return { "%allot": String(content ?? "") };
}

export const createUserDataObject = (uuid: string, answers: any, survey: Survey) => {

    const preparedAnswers = prepareAnswers(answers, survey);
    const dataObject: Record<string, any> = { _id: uuid, surveyId: survey.id };
    
    preparedAnswers.forEach((answer: any) => {
        if (answer.questionType === 'checkbox') {
            const selectedIndices = answer.answer;
            const maxIndex = Math.max(...selectedIndices, 0);

            for (let i = 0; i <= maxIndex; i++) {
                const fieldName = `${answer.questionId}_${i}`;
                dataObject[fieldName] = { 
                    "%allot": selectedIndices.includes(i) ? "1" : "0"  // Strings, not integers
                };
            }

        } else if (answer.questionType === 'text') {
        // Text is plaintext, no wrapping
            dataObject[answer.questionId] = String(answer.answer);
        } else {
            dataObject[answer.questionId] = ensureAllot(answer.answer);
        }
    });
    
    return dataObject;
}