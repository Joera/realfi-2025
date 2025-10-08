import { SurveyConfig } from "../components/survey";

export const minaSurveyConfig: SurveyConfig = {
  title: "Welcome to S3ntiment",
  description: "You’ve been invited to take part in a short, anonymous Web3 onboarding survey, created for the RealFi Hackathon 2025 — where we’re exploring how communities can share honest feedback without losing privacy. Your responses are completely anonymous. No login, no name, no wallet tracking. Just authentic voices, processed privately through Nillion’s blind computation network. It takes less than 2 minutes. Be curious, be honest — and have fun!",
  questions: [
    {
      id: "reason",
      question: "What brings you here today?",
      type: "checkbox",
      options: [
        "Curiosity about crypto art",
        "Meeting like-minded people",
        "Supporting an artist",
        "Exploring new tech",
        "Just here for fun"
      ],
      required: true
    },
    {
      id: "box",
      question: "How would you describe yourself in this space?",
      type: "checkbox",
      options: [
        "Collector",
        "Artist",
        "Builder / developer",
        "Curious newcomer",
        "Other"
      ],
      required: true
    },
    {
      id: "experience",
      question: "Have you ever bought or collected a crypto art piece (NFT)?",
      type: "radio",
      options: [
        "Yes, many times",
        "Once or twice",
        "Used a dApp",
        "Not yet, but planning to",
        "No, but I’m curious",
        "No interest"
      ],
      required: true
    },
    {
      id: "motivation",
      question: "What’s your motivation to collect (or want to collect) crypto art?",
      type: "checkbox",
      options: [
        "Supporting artists",
        "Investment opportunity",
        "I love the art itself",
        "Being part of a movement",
        "Curiosity about technology"
      ],
      required: true
    },
    // {
    //   id: "playground",
    //   question: "Have you attended a Playground event before?",
    //   type: "radio",
    //   options: [
    //     "Yes, multiple times",
    //     "Once before",
    //     "This is my first",
    //     "I’ve heard about it but never joined",
    //     "No, new to this"
    //   ],
    //   required: true
    // },
    // {
    //   id: "vibe",
    //   question: "How did you experience the vibe at this event so far?",
    //   type: "scale",
    //   scaleRange: {
    //     min: 1,
    //     max: 10,
    //     minLabel: "not my vibe",
    //     maxLabel: "absolutely loved it)"
    //   },
    //   required: true
    // },
    {
      id: "events",
      question: "What kind of events would you like to see more often?",
      type: "checkbox",
      options: [
        "Artist showcases / exhibitions",
        "Educational sessions / workshops",
        "Social mixers / networking",
        "Parties / performances",
        "Panels & discussions"
      ],
      required: true
    },
    {
      id: "best",
      question: "What’s the best thing about events like this",
      type: "radio",
      options: [
        "Meeting people",
        "The art",
        "The vibe",
        "Learning something new",
        "Feeling part of something"
      ],
      required: true
    },
    {
      id: "onboarding",
      question: "Would you like help setting up a wallet or buying your first NFT?",
      type: "radio",
      options: [
        "Yes please!",
        "Maybe later",
        "I already know how",
        "Not interested",
        "Not sure yet"
      ],
      required: true
    },
    // {
    //   id: "additional_feedback",
    //   question: "Any additional thoughts on this event",
    //   type: "text",
    //   required: false
    // },
    {
      id: "anonimity",
      question: "How important is it to you that your answers stay completely anonymous?", // did you answer more freely, knowing that this surevy is completely anonymous and private?
      type: "scale",
      scaleRange: {
        min: 1,
        max: 10,
        minLabel: "not important at all",
        maxLabel: "extremely important"
      },
      required: true
    },
    
  ]
}
