// From: https://stately.ai/registry/editor/3d2c8fb7-500b-480d-b46a-7dccbed9b147?machineId=4c194f5d-c804-419f-8ba8-440559ed2bb7&mode=Design

import { createMachine } from "xstate";

export const machine = createMachine({
  context: {},
  id: "chat",
  initial: "knowledgeLevel",
  states: {
    knowledgeLevel: {
      on: {
        Beginner: {
          target: "beginnerLevel",
        },
        Intermediate: {
          target: "intermediateLevel",
        },
        Advanced: {
          target: "expertLevel",
        },
      },
      description:
        "# 🌟 Welcome to the AI IP BOT! \n\nBefore we dive into the world of Intellectual Property, I'd love to tailor our conversation to your level of familiarity with IP concepts. Could you let me know which category best describes your current understanding?\n\n🌱 **Beginner**: I'm new to IP and would appreciate some basic guidance. \n\n👩‍🎓 **Intermediate**: I have some knowledge but would like to learn more. \n\n🧠**Advanced**: I'm well-versed in IP and looking for expert insights.",
    },
    beginnerLevel: {
      on: {
        "I get it, let's start!": {
          target: "userGoal",
        },
      },
      description:
        "# 🌱 Foundational Guide to Intellectual Property (IP) for Beginners\n\n## What is Intellectual Property (IP)?\n\n**Definition**: IP refers to creations of the mind, such as inventions, literary and artistic works, designs, symbols, names, and images used in commerce.\n\n## Types of IP\n\n1. **Patents**: Protect inventions or discoveries. Example: A new type of solar panel.\n2. **Trademarks**: Protect brand names, logos, and slogans. Example: The Nike \"Swoosh\" logo.\n3. **Copyrights**: Protect literary, artistic, and musical works. Example: The novel Harry Potter.\n4. **Trade Secrets**: Protect confidential business information. Example: The recipe for Coca-Cola.\n\n## Why is IP Important?\n\n- **Protection**: Prevents others from using your creation without permission.\n- **Monetization**: Allows you to earn money from your creation.\n- **Recognition**: Credits you as the creator and maintains your reputation.\n\n## How to Protect Your IP\n\n1. **Identify Your IP**: Understand what type of IP you have.\n2. **Register Your IP**: Apply for patents, trademarks, or copyrights.\n3. **Enforce Your Rights**: Take legal action if someone infringes your IP.\n\n## Common Misconceptions\n\n- **Myth**: Once I create something, it's automatically protected worldwide.\n- **Reality**: IP laws vary by country; registration is often required.\n\n## Tips for Beginners\n\n- **Educate Yourself**: Learn more about IP laws relevant to your creation.\n- **Seek Professional Advice**: Consult with an IP lawyer for guidance.\n- **Stay Vigilant:** Monitor for potential infringements of your IP.\n\nThis guide provides a foundational understanding of IP for beginners, using simple explanations and relatable examples. It's a starting point for anyone new to the world of intellectual property.",
    },
    intermediateLevel: {
      on: {
        "I get it, let's start!": {
          target: "userGoal",
        },
      },
      description:
        "# 👩‍🎓 Intermediate Guide to Intellectual Property (IP)\n\n## Understanding IP Rights\n\n- **Scope & Limitations**: Learn the extent and boundaries of IP protection.\n- **Jurisdictional Variations**: Understand how IP laws differ across countries.\n\n## Types of IP: A Deeper Dive\n\n1. **Patents**: Explore utility, design, and plant patents.\n   - *Utility Patents*: Protect functional aspects of inventions.\n   - *Design Patents*: Protect the ornamental design of an item.\n   - *Plant Patents*: Protect new and distinct plant varieties.\n2. **Trademarks**: Understand service marks, collective marks, and certification marks.\n   - *Service Marks*: Identify services rather than goods.\n   - *Collective Marks*: Used by members of a group.\n   - *Certification Marks*: Signify compliance with standards.\n3. **Copyrights**: Delve into moral rights and derivative works.\n   - *Moral Rights*: Protect the personal and reputational value of a work.\n   - *Derivative Works*: New works based on existing copyrighted material.\n4. **Trade Secrets**: Learn about non-disclosure agreements and trade secret misappropriation.\n\n## IP Registration Process\n\n- **Patent Prosecution**: Navigating the patent application process.\n- **Trademark Examination**: Understanding the trademark registration process.\n- **Copyright Registration**: Benefits and procedures for registering copyrights.\n\n## IP Enforcement Strategies\n\n- **Cease and Desist Letters**: First step in addressing infringement.\n- **Litigation**: Understanding lawsuits and legal proceedings.\n- **Alternative Dispute Resolution**: Exploring mediation and arbitration.\n\n# IP in the Digital Age\n\n- **Online Infringement**: Tackling piracy and unauthorized use on the internet.\n- **Domain Names**: Understanding the intersection of trademarks and domain names.\n\n## IP Management\n\n- **IP Audits**: Assessing and managing your IP portfolio.\n- **Licensing Agreements**: Generating revenue through IP licensing.\n- **IP Valuation**: Determining the monetary value of your IP assets.\n\n## Advanced Tips\n\n- **Stay Informed**: Keep up with changes in IP laws and practices.\n- **Network**: Connect with other IP professionals and creators.\n- **Continued Learning**: Attend workshops, seminars, and courses on IP.\n\nThis intermediate guide offers a more in-depth look at IP, providing insights into the nuances and complexities of protecting and managing intellectual property. It's designed for individuals who have a basic understanding of IP and are looking to expand their knowledge.",
    },
    expertLevel: {
      on: {
        "I get it, let's start!": {
          target: "userGoal",
        },
      },
      description:
        "# 🧠 Expert Guide to Intellectual Property (IP)\n\n## Advanced IP Concepts\n\n- **Doctrine of Equivalents**: A legal rule in patent law that allows a court to hold a party liable for patent infringement even if the infringing device or process does not fall within the literal scope of a patent claim, but nevertheless is equivalent to the claimed invention.\n- **Fair Use Doctrine**: In copyright law, a doctrine that permits limited use of copyrighted material without acquiring permission from the rights holders. It includes purposes such as criticism, comment, news reporting, teaching, scholarship, and research.\n- **Secondary Meaning**: In trademark law, when a descriptive mark acquires distinctiveness through long-term use and consumer recognition. Exhaustion Doctrine: The idea that once a patented item is sold, the patent holder's exclusive rights to control the use and sale of that item are exhausted.\n\n## IP Law Legal Articles\n\n- **Article 6bis of the Paris Convention (1967)**: Protects well-known trademarks and obliges member countries to grant them special protection.\n- **Berne Convention for the Protection of Literary and Artistic Works**: Establishes minimum standards for the protection of the rights of authors and other creators of copyrighted works.\n- **TRIPS Agreement (Trade-Related Aspects of Intellectual Property Rights)**: An international agreement that sets down minimum standards for many forms of intellectual property regulation.\n- **Madrid Protocol**: Allows a trademark owner to seek registration in any of the member countries using a single application.\n\n## IP in International Context\n\n- **Cross-border Infringement Issues**: Handling IP rights in a globalized world.\n- **International IP Agreements**: Exploring treaties like the Berne Convention, Madrid Protocol, and TRIPS Agreement.\n- **Jurisdictional Challenges**: Navigating IP disputes in international courts.\n\n## Advanced IP Management\n\n- **IP Portfolio Optimization**: Strategies for maximizing the value of an IP portfolio.\n- **Licensing and Franchising**: Advanced strategies for monetizing IP.\n- **IP Risk Management**: Identifying and mitigating potential threats to IP assets.\n\n## Recent Developments in IP Law\n\n- **AI and IP**: Understanding the implications of artificial intelligence on IP rights.\n- **Biotechnology Patents**: Navigating the complex landscape of biotech IP.\n- **Digital Transformation**: The impact of digitization on IP strategies and management.\n\n## Expert Tips\n\n- **Stay Updated**: Regularly review IP law journals and publications.\n- **Engage with the IP Community**: Join IP forums, attend conferences, and participate in webinars.\n- **Continued Education**: Consider advanced courses, certifications, and training in IP law.\n\nThis expert guide delves deep into advanced IP concepts, legal articles, and the latest developments in IP law. It's tailored for professionals who are well-versed in IP and are looking to stay at the forefront of the field.\n\n# International view\n\n## Advanced Concepts in IP\n\n- **International Treaties**: Understanding the Paris Convention, Berne Convention, TRIPS Agreement, and Madrid Protocol.\n- **Cross-Border Enforcement**: Strategies for enforcing IP rights internationally.\n\n## U.S. Copyright and IP Law\n\n- **Fair Use Doctrine**: Analyzing the four factors of fair use.\n- **DMCA**: Navigating the Digital Millennium Copyright Act provisions.\n- **First Sale Doctrine**: Understanding its implications on copyright.\n- **Patentable Subject Matter**: Exploring the boundaries of what can be patented.\n\n## European IP Law\n\n- **EU Directives & Regulations**: Impact on harmonization of IP laws.\n- **GDPR**: Understanding its implications on IP, especially trade secrets.\n- **Unitary Patent System**: Navigating the upcoming changes in EU patent law.\n\n## Asian IP Law\n\n- **China's IP Landscape**: Navigating IP protection and enforcement in China.\n- **Japan's Patent System**: Understanding Japan's unique approach to IP.\n- **India's IP Reforms**: Recent changes and their implications.\n\n## African IP Law\n\n- **OAPI and ARIPO**: Understanding regional IP systems in Africa.\n- **Challenges and Opportunities**: Navigating IP in diverse legal landscapes.\n\n## Cutting-Edge IP Issues\n\n- **AI and IP**: Debates on AI-generated works and inventorship.\n- **Biotechnology Patents**: Navigating ethical and legal complexities.\n- **Blockchain and IP**: Exploring the use of blockchain in IP management.\n\n## IP Policy and Advocacy\n\n- **Policy Development**: Influencing IP laws and regulations.\n- **IP Education**: Promoting awareness and understanding of IP rights.\n\n## Advanced IP Management\n\n- **Global IP Strategy**: Developing a comprehensive approach to IP.\n- **IP Due Diligence**: Conducting thorough IP investigations in transactions.\n- **IP Litigation**: Mastering complex litigation strategies.\n\n## Expert Tips\n\n- **Continuous Research**: Stay abreast of evolving IP laws and technologies.\n- **Global Networking**: Engage with international IP organizations and forums.\n- **Thought Leadership**: Contribute to scholarly articles and speak at conferences.\n\nThis expert guide delves into the complexities of IP law, offering insights into advanced topics and international perspectives. It's tailored for professionals who are well-versed in IP and seek to deepen their expertise, particularly in the context of U.S., European, Asian, and African IP laws.",
    },
    userGoal: {
      on: {
        Protection: {
          target: "ipType",
        },
        Monetization: {
          target: "ipType",
        },
        Organization: {
          target: "ipType",
        },
      },
      description: "# 🎯 What's your main goal with bIPQuantum today?",
    },
    ipType: {
      on: {
        "Patentable invention": {
          target: "protectionType",
        },
        Trademark: {
          target: "protectionType",
        },
        Copyright: {
          target: "protectionType",
        },
        "Trade secret": {
          target: "protectionType",
        },
        "Blockchain intellectual property": {
          target: "protectionType",
        },
      },
      description:
        "# 💭 What type of Intellectual Property do you want to protect?",
    },
    protectionType: {
      on: {
        Digital: {
          target: "selectCertificate",
        },
        Physical: {
          target: "selectCertificate",
        },
        Both: {
          target: "selectCertificate",
        },
      },
      description:
        "# 🛡️ Are you seeking protection in the digital realm, physical realm, or both?",
    },
    selectCertificate: {
      on: {
        "bIP certificate": {
          target: "bipCertificate",
        },
        "US Copyright Certificate": {
          target: "usCopyright",
        },
      },
      description:
        "# 📜 What kind of certificate are you looking for?\n\n1. **bIP Certificate:** a Blockchain Intellectual Property Certificate, as offered by Artziyou, is a digital certificate that leverages blockchain technology to provide secure and immutable proof of evidence ownership and authenticity for your intellectual property. It ensures transparency, traceability, and protection against infringement in the digital realm and completes a US copyright certificate.\n2. **US Copyright Certificate**: a conventional form of legal recognition provided by the United States Copyright Office. It serves as official documentation that establishes your rights as the creator of a work, offering legal protection primarily in the physical realm and traditional channels.",
    },
    bipCertificate: {
      type: "final",
      description:
        "# 🎉 Congratulations on successfully listing your Intellectual Property on Artizstore! \n\nYour entry is a significant step towards harnessing the full potential of your creative work. Please be aware that the Artizyou team may request additional validation to ensure the highest standards of quality and authenticity for our marketplace. This process is part of our commitment to maintaining a trusted and secure platform for all the members. We appreciate your cooperation and are here to assist you every step of the way. Welcome to the Artizyou community!",
    },
    usCopyright: {
      type: "final",
    },
  },
});