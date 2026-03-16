import { Survey } from "@s3ntiment/shared"

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


        return { safeConfigWithScoring, safeConfig  }

}