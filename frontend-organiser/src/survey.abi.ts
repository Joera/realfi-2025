export const SURVEY_STORE_ABI = [
    {
        type: 'function',
        name: 'createSurvey',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'surveyId', type: 'string' },
            { name: 'ipfsCid', type: 'string' }
        ],
        outputs: []
    },
    {
        type: 'function',
        name: 'getSurvey',
        stateMutability: 'view',
        inputs: [{ name: 'surveyId', type: 'string' }],
        outputs: [
            { name: 'ipfsCid', type: 'string' },
            { name: 'owner', type: 'address' },
            { name: 'createdAt', type: 'uint256' }
        ]
    },
    {
        type: 'function',
        name: 'isOwner',
        stateMutability: 'view',
        inputs: [
            { name: 'authSigAddress', type: 'address' },
            { name: 'surveyId', type: 'string' }
        ],
        outputs: [{ type: 'bool' }]
    },
    {
        type: 'function',
        name: 'validateCard',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'nullifier', type: 'string' },
            { name: 'signature', type: 'bytes' },
            { name: 'batchId', type: 'string' },
            { name: 'surveyId', type: 'string' }
        ],
        outputs: [{ type: 'bool' }]
    },
    {
        type: 'event',
        name: 'SurveyCreated',
        inputs: [
            { name: 'owner', type: 'address', indexed: true },
            { name: 'surveyId', type: 'string', indexed: false },
            { name: 'ipfsCid', type: 'string', indexed: false },
            { name: 'timestamp', type: 'uint256', indexed: false }
        ]
    },
    {
        type: 'function',
        name: 'getOwnerSurveys',
        stateMutability: 'view',
        inputs: [
            { name: 'owner', type: 'address' }
        ],
        outputs: [
            { name: '', type: 'string[]' }
        ]
    }
] as const;
