import { QuestionGroup, Survey } from "@s3ntiment/shared"

export const stripScoring = (surveyConfig: Survey) => { 

        const scoring: Record<string, any> = {}
        const safeGroups = surveyConfig.groups?.map((group: any) => {
            const { scoring: groupScoring, ...safeGroup } = group
            if (groupScoring) {
                // key by groupId to keep it locatable later
                scoring[group.id] = groupScoring
            }
            return safeGroup
        })

        const safeConfigWithScoring = { ...surveyConfig, groups: surveyConfig.groups } // scoring still attached
        const safeConfig = { ...surveyConfig, groups: safeGroups } // scoring stripped


        return { safeConfigWithScoring, safeConfig, scoring  }

}

export const calculateScore = (scoring: Record<string, any>, userData: Record<string, any>, groups: QuestionGroup[]) => {
    let score = 0
    let max = 0

    
    for (const [groupId, groupScoring] of Object.entries(scoring)) {
        const group = groups.find(g => g.id === groupId)
        if (!group) continue

        for (const [questionId, s] of Object.entries(groupScoring)) {
            const { correctAnswer, points } = s as { correctAnswer: number, points: number }
            const question = group.questions.find(q => q.id === questionId)
            if (!question || !question.options) continue

            max += points
            const correctText = question.options[correctAnswer]
            if (userData[questionId] === correctText) score += points
        }
    }

    return { score, max, pct: max > 0 ? Math.round((score / max) * 100) : 0 }
}