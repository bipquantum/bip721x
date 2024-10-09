import { createMachine } from "xstate";

// Define types for the context and events (adjust as necessary)
type MachineContext = {};
type MachineEvent = { type: string };

export const botStateMachine = createMachine({
  context: {},
  id: "chat",
  initial: "anyIpRelatedQueries",
  states: {
    anyIpRelatedQueries: {
      on: {
        "booking a meeting with ip lawyer": {
          target:
            "areYouFamiliarWithTheConceptsOfIntellectualPropertyAndCopyrightLaw",
        },
        "ip knowledge level": {
          target: "welcomeToAiIpBot",
        },
      },
      description: "Prompt the user with any IP related queries.",
    },
    areYouFamiliarWithTheConceptsOfIntellectualPropertyAndCopyrightLaw: {
      on: {
        "self filling": {
          target: "selfFilling",
        },
        "manual filling": {
          target: "manualFilling",
        },
        "short description and consulation schdule": {
          target: "shortDescriptionAndConsultationSchedule",
        },
        payment: {
          target: "expertIpLegalConsultation",
        },
      },
      description:
        "Ask the user if they are familiar with concepts of IP and copyright law.",
    },
    welcomeToAiIpBot: {
      on: {
        beginner: {
          target: "foundationalGuideToIntellectualProperty",
        },
        intermediate: {
          target: "intermediateGuideToIntellectualProperty",
        },
        advanced: {
          target: "expertGuideToIntellectualProperty",
        },
      },
      description:
        "Welcome the user and ask about their familiarity with IP concepts.",
    },
    selfFilling: {
      type: "final",
      description: "Proceed with self filling.",
    },
    manualFilling: {
      type: "final",
      description: "Proceed with manual filling.",
    },
    shortDescriptionAndConsultationSchedule: {
      type: "final",
      description: "Proceed with short description and consultation schedule.",
    },
    expertIpLegalConsultation: {
      type: "final",
      description: "Provide details for expert IP legal consultation.",
    },
    foundationalGuideToIntellectualProperty: {
      on: {
        next: {
          target: "whatsYourMainGoalWithBipQuantumToday",
        },
      },
      description:
        "Provide a foundational guide to Intellectual Property for beginners.",
    },
    intermediateGuideToIntellectualProperty: {
      on: {
        next: {
          target: "whatsYourMainGoalWithBipQuantumToday",
        },
      },
      description: "Provide an intermediate guide to Intellectual Property.",
    },
    expertGuideToIntellectualProperty: {
      on: {
        next: {
          target: "whatsYourMainGoalWithBipQuantumToday",
        },
      },
      description: "Provide an expert guide to advanced IP concepts.",
    },
    whatsYourMainGoalWithBipQuantumToday: {
      on: {
        "patentable invention": {
          target:
            "forYourIntellectualPropertyAreYouSeekingProtectionInTheDigitalRealm",
        },
        trademark: {
          target:
            "forYourIntellectualPropertyAreYouSeekingProtectionInTheDigitalRealm",
        },
        copyright: {
          target:
            "forYourIntellectualPropertyAreYouSeekingProtectionInTheDigitalRealm",
        },
        "trade secret": {
          target:
            "forYourIntellectualPropertyAreYouSeekingProtectionInTheDigitalRealm",
        },
        "blockchain intellectual property": {
          target: "ipDetails",
        },
      },
      description: "Ask the user about their main goal with bIPQuantum.",
    },
    forYourIntellectualPropertyAreYouSeekingProtectionInTheDigitalRealm: {
      on: {
        next: {
          target: "selectCertificate",
        },
      },
      description:
        "Ask if the user is seeking protection in the digital realm, physical realm, or both.",
    },
    ipDetails: {
      on: {
        "start submission": {
          target: "raiseMoneyAndSupport",
        },
      },
      description: "Collect IP details for blockchain intellectual property.",
    },
    selectCertificate: {
      type: "final",
      description: "Ask the user to select a certificate.",
    },
    raiseMoneyAndSupport: {
      on: {
        submitted: {
          target:
            "congratulationsOnSuccessfullyListingYourIntellectualProperty",
        },
        no: {
          target: "thankYou",
        },
      },
      description: "Ask the user if they want to raise money and support.",
    },
    congratulationsOnSuccessfullyListingYourIntellectualProperty: {
      type: "final",
      description: "Congratulate the user on successfully listing their IP.",
    },
    thankYou: {
      type: "final",
      description: "Thank the user.",
    },
  },
});