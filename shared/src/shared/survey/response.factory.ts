export const prepareAnswers = (answers: any) => {

        return answers.map((answer: any) => {

        const answerValue = Array.isArray(answer.answer)
        ? answer.answer.join(',')
        : String(answer.answer);

        // Determine correct type based on question
        if (answer.questionType === 'radio') {
        // Radio: option index as integer
            const optionIndex = parseInt(answerValue, 10);
            return {
                questionId: answer.questionId,
                questionText: answer.questionText,
                questionType: answer.questionType,
            answer: { "%allot": optionIndex }
            };
        }
        else if (answer.questionType === 'scale') {
        // Scale: rating as integer
            const rating = parseInt(answerValue, 10);
            return {
                questionId: answer.questionId,
                questionText: answer.questionText,
                questionType: answer.questionType,
                answer: { "%allot": rating }
            };
        }
        else if (answer.questionType === 'checkbox') {
        // Checkbox: selected options array
        // Schema has question_id_0, question_id_1, etc.
            const selected = answerValue.split(',').map( (v: any) => parseInt(v.trim(), 10));
            return {
                questionId: answer.questionId,
                questionText: answer.questionText,
                questionType: answer.questionType,
                answer: selected // Array of selected indices
            };
        }
        else {
        // Text: plain string
            return {
                questionId: answer.questionId,
                questionText: answer.questionText,
                questionType: answer.questionType,
                answer: answerValue
            };
        }
    });
}

export const createUserDataObject = (uuid: string, answers: any, surveyId: string) => {

    const preparedAnswers = prepareAnswers(answers)

    const dataObject: Record<string, any> = {
        _id: uuid,
        surveyId
    };

    preparedAnswers.forEach((answer: any) => {
        if (answer.questionType === 'checkbox') {
        // [0, 2] → question_id_0: { "%allot": 1 }, question_id_1: { "%allot": 0 }, etc.
            const selectedIndices = answer.answer;
            const maxIndex = Math.max(...selectedIndices, 0);
            for (let i = 0; i <= maxIndex; i++) {
                const fieldName = `${answer.questionId}_${i}`;
                dataObject[fieldName] = { "%allot": selectedIndices.includes(i) ? 1 : 0 };
            }
        } else {
            dataObject[answer.questionId] = answer.answer;
        }
    });

    return dataObject
}