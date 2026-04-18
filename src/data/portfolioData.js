export const portfolioData = {
  personal: {
    fullName: "Govardhan Reddy Chigicherla",
    title: "Senior Salesforce Developer",
    tagline: "Building Scalable Enterprise CRM Solutions | 4x Certified",
    bio: "Salesforce Developer with 4+ years of experience designing scalable CRM solutions using Apex, Lightning Web Components, and Salesforce integrations. Salesforce Platform Developer II certified with strong expertise in automation, integrations, and performance optimization. Experienced in Sales Cloud, Health Cloud and Experience cloud implementations with a track record of improving system performance, building multiple integrations and automating business processes. Seeking opportunities to contribute to enterprise Salesforce projects in global environments.",
    email: "govardhan.salesforcedeveloper@gmail.com",
    linkedin: "https://www.linkedin.com/in/govardhan-reddy-chigicherla-51b380221/",
    github: "", // Optional, can be added later
    trailhead: "https://www.salesforce.com/trailblazer/greddy169",
    resume: "/Govardhan_Resume.pdf", 
    photo: "/profile-photo.png" 
  },
  technicalExpertise: [
    {
      category: "Salesforce Core",
      items: ["Apex", "LWC", "Apex Triggers", "REST API Integration", "Batch Apex", "SOQL", "Aura Components", "Platform Events", "Flows", "Salesforce Security", "Visualforce", "Reports & Dashboards"]
    },
    {
      category: "Salesforce Clouds",
      items: ["Sales Cloud", "Health Cloud", "Experience Cloud"]
    },
    {
      category: "Tools",
      items: ["VS Code", "Git CI/CD", "Copado", "Workbench", "Data Loader"]
    },
    {
      category: "Web Technologies",
      items: ["HTML", "JavaScript", "CSS", "JSON", "Redux"]
    },
    {
      category: "Methodologies",
      items: ["Scrum", "Agile"]
    }
  ],
  experience: [
    {
      id: 1,
      role: "Associate Consultant (Salesforce Developer)",
      company: "Infosys Ltd",
      duration: "Sep 2025 - Present",
      description: "Developing integrations and enterprise CRM solutions."
    },
    {
      id: 2,
      role: "Salesforce Developer",
      company: "Lean Agilenautics",
      duration: "Mar 2022 – Aug 2025",
      description: "Built scalable integrations, custom LWCs, and automation flows leading to significant operational improvements."
    },
    {
      id: 3,
      role: "Salesforce Developer/Administrator Intern",
      company: "Panoramic Health",
      duration: "March 2022 - August 2022",
      description: "Assisted in CRM implementations, data migrations, and flow automations."
    }
  ],
  certifications: [
    {
      id: 1,
      name: "Salesforce Certified Platform Developer I",
      date: "2023",
      image: "/cert-pd1.pdf" 
    },
    {
      id: 2,
      name: "Salesforce Certified Platform Developer II",
      date: "2024",
      image: "/cert-pd2.pdf" 
    },
    {
      id: 3,
      name: "Copado Certified Fundamentals I",
      date: "2023",
      image: "/Copado-Certified-FUNDAMENTALS-I.pdf" 
    },
    {
      id: 4,
      name: "Salesforce Certified Associate",
      date: "2023",
      image: "/cert-Associate.pdf" 
    }
  ],
  clientProjects: [
    {
      id: 1,
      name: "Order Processing Integration System - AT&T",
      description: "Developed and managed robust integrations to consume JSON data from external systems, syncing seamlessly with Salesforce.",
      technologies: ["Apex", "LWC", "REST API", "JSON", "Redux"],
      impact: [
        "Built Lightning Web Components (LWC) with Redux-based state management to manage integration responses and improve UI responsiveness.",
        "Implemented JSON parsing and transformation logic in Apex to map external payloads to Salesforce objects.",
        "Developed backend logic to store processed integration data and update corresponding Salesforce records.",
        "Delivered UI enhancements and functional improvements for business users using LWC."
      ],
      links: { live: "", github: "" }
    },
    {
      id: 2,
      name: "CRM Integration and Automation System - Smart Logistics",
      description: "Engineered scalable Apex solutions and API integrations to process large datasets and optimize location-based services.",
      technologies: ["Apex", "Batch Jobs", "Google Maps API", "Salesforce Flows"],
      impact: [
        "Integrated Google Maps APIs to optimize address callouts using latitude and longitude and developed a Nearby Business Address feature.",
        "Engineered scalable Apex solutions (classes, triggers, and batch jobs) to process large datasets and ensure high data integrity.",
        "Designed and implemented Salesforce Flows to streamline business account creation and reduce manual operational effort.",
        "Executed large-scale data migration and resolved critical production issues to maintain system reliability."
      ],
      links: { live: "", github: "" }
    },
    {
      id: 3,
      name: "Healthcare CRM Implementation - Panoramic Health",
      description: "Implemented custom Salesforce solutions and third-party integrations to automate scheduling and optimize data entry.",
      technologies: ["Apex", "LWC", "Zoom API", "Data Loader"],
      impact: [
        "Seamlessly integrated Salesforce with Zoom, automating meeting scheduling and participant data synchronization.",
        "Engineered and optimized Apex classes, triggers, LWC, and flows resulting in a 15% reduction in processing time.",
        "Achieved and maintained over 75% code coverage through comprehensive Apex test class development.",
        "Optimized data entry procedures through process automation and intuitive interface design, enhancing user adoption."
      ],
      links: { live: "", github: "" }
    }
  ],
  personalProjects: [
    {
      id: 4,
      name: "LWC Component Library",
      description: "Developed reusable Lightning Web Components for improving UI consistency and performance.",
      technologies: ["LWC", "JavaScript", "Salesforce"],
      impact: [
        "Created a library of 15+ reusable UI components.",
        "Improved frontend rendering speed by utilizing Lightning Data Service.",
        "Standardized the look and feel across multiple custom applications."
      ],
      links: { live: "", github: "" }
    }
  ]
};
