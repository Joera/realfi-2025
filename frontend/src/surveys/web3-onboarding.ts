import { SurveyConfig } from "../components/survey";

export const defaultSurveyConfig: SurveyConfig = {
  title: "Web3 Onboarding Experience",
  description: "Help us understand your journey into Web3. Your feedback will improve onboarding for future users.",
  questions: [
    {
      id: "experience_level",
      question: "How would you describe your experience with Web3?",
      type: "radio",
      options: [
        "Complete beginner - never used crypto/Web3",
        "Curious explorer - tried a few things",
        "Regular user - comfortable with wallets and dApps",
        "Power user - DeFi, NFTs, DAOs are second nature",
        "Developer - building in the space"
      ],
      required: true
    },
    {
      id: "biggest_challenge",
      question: "What was your biggest challenge getting started with Web3?",
      type: "checkbox",
      options: [
        "Understanding technical concepts",
        "Setting up a wallet",
        "Managing private keys/seed phrases",
        "Understanding gas fees",
        "Finding trustworthy resources",
        "Security concerns",
        "Regulatory/legal uncertainty",
        "Other"
      ],
      required: true
    },
    {
      id: "first_interaction",
      question: "What was your first meaningful Web3 interaction?",
      type: "radio",
      options: [
        "Bought cryptocurrency",
        "Created a wallet",
        "Used a dApp",
        "Minted or bought an NFT",
        "Participated in DeFi",
        "Joined a DAO",
        "Haven't had one yet"
      ],
      required: true
    },
    {
      id: "wallet_difficulty",
      question: "On a scale of 1-5, how difficult was setting up your first wallet?",
      type: "scale",
      scaleRange: {
        min: 1,
        max: 5,
        minLabel: "Very easy",
        maxLabel: "Very difficult"
      },
      required: true
    },
    {
      id: "improvement_areas",
      question: "Which aspects of Web3 onboarding need the most improvement?",
      type: "checkbox",
      options: [
        "Simpler terminology",
        "Better tutorials/guides",
        "More intuitive UX",
        "Better customer support",
        "Clearer security practices",
        "Account recovery options",
        "Lower entry costs"
      ],
      required: false
    },
    {
      id: "motivations",
      question: "What motivated you to explore Web3? (Select all that apply)",
      type: "checkbox",
      options: [
        "Financial opportunity",
        "Technology curiosity",
        "Community/social aspect",
        "Decentralization values",
        "Gaming/entertainment",
        "Professional development",
        "FOMO (fear of missing out)"
      ],
      required: false
    },
    {
      id: "additional_feedback",
      question: "Any additional thoughts on improving Web3 onboarding?",
      type: "text",
      required: false
    }
  ]
}
