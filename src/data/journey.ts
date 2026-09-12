export interface ProofMedia {
  src: string;
  alt: string;
  caption?: string;
  objectPosition?: string;
  aspectRatio?: string;
}

export interface JourneyMetric {
  value: number;
  label: string;
}

export interface JourneyCommunity {
  id: string;
  title: string;
  role: string;
  period: string;
  description: string;
  featured?: boolean;
  metrics?: JourneyMetric[];
  proofMedia?: ProofMedia[];
}

export interface JourneyRecognition {
  id: string;
  label: string;
  title: string;
  status: string;
  period: string;
  highlight: [string, string];
  detail: string;
  description: string;
  variant: "scholarship" | "finalist";
  proofMedia?: ProofMedia[];
}

export interface JourneyCollaboration {
  id: string;
  title: string;
  role: string;
  period: string;
  description: string;
  organizations: [string, string];
  proofMedia?: ProofMedia[];
}

export interface JourneyEducation {
  id: string;
  label: string;
  school: string;
  program: string;
  degree?: string;
  start: string;
  end: string;
  location: string;
  progress: number;
  mark?: ProofMedia;
  markFit?: "cover" | "contain";
}

export interface JourneyCertification {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export interface JourneyData {
  community: JourneyCommunity[];
  recognition: JourneyRecognition[];
  collaboration: JourneyCollaboration[];
  education: JourneyEducation[];
  certifications: JourneyCertification[];
}

export const journey: JourneyData = {
  community: [
    {
      id: "ncsa",
      title: "National Cyber Security Awareness",
      role: "Project Manager",
      period: "Jul 2025 — Dec 2025",
      featured: true,
      description: "Led a national-scale cybersecurity initiative, coordinating a 24-member committee across partnerships, speakers, sponsorships, and event execution.",
      metrics: [
        { value: 24, label: "Team members" },
        { value: 258, label: "Registrations" },
        { value: 187, label: "Attendees" }
      ],
      proofMedia: [
        {
          src: "/images/journey/ncsa.jpg",
          alt: "National Cyber Security Awareness event documentation",
          caption: "National Cyber Security Awareness · 2025",
          objectPosition: "50% 42%",
          aspectRatio: "16 / 9"
        }
      ]
    }
  ],
  recognition: [
    {
      id: "malaka",
      label: "Scholarship",
      title: "Malaka Project Scholarship",
      status: "Awardee",
      period: "Aug 2025 — Aug 2026",
      highlight: ["FULL-TUITION", "2,000+"],
      detail: "Selected after competing with 2,000+ applicants.",
      description: "Earned the scholarship after pitching and defending an academic essay before a panel of public figures and academicians.",
      variant: "scholarship",
      proofMedia: [
        {
          src: "/images/journey/malaka.jpg",
          alt: "Presenting the Malaka Project scholarship essay",
          caption: "Malaka Project Scholarship · 2025",
          objectPosition: "62% 28%",
          aspectRatio: "4 / 5"
        }
      ]
    },
    {
      id: "bakti-bca",
      label: "National Finalist",
      title: "Bakti BCA\nGenera-Z Berbakti",
      status: "Top 8 Finalist",
      period: "Apr 2026 — Jun 2026",
      highlight: ["TOP", "08"],
      detail: "Selected among teams from leading Indonesian universities.",
      description: "Developed and presented a community development proposal before a national judging panel.",
      variant: "finalist",
      proofMedia: [
        {
          src: "/images/journey/genera-z.jpg",
          alt: "Bakti BCA Genera-Z Berbakti finalist documentation",
          caption: "Genera-Z Berbakti · Top 8",
          objectPosition: "40% 47%",
          aspectRatio: "2 / 1"
        }
      ]
    }
  ],
  collaboration: [
    {
      id: "benchmarking",
      title: "Benchmarking Day",
      role: "Moderator",
      period: "Aug 2025 — Nov 2025",
      description: "Moderated an inter-university benchmarking and networking session focused on community development, organizational practices, and cross-campus collaboration.",
      organizations: ["CSC BINUS", "RISTEK Universitas Indonesia"],
      proofMedia: [
        {
          src: "/images/journey/benchmarking.jpg",
          alt: "Moderating Benchmarking Day between CSC BINUS and RISTEK UI",
          caption: "Benchmarking Day · CSC BINUS × RISTEK UI",
          objectPosition: "50% 50%",
          aspectRatio: "16 / 9"
        }
      ]
    }
  ],
  education: [
    {
      id: "binus",
      label: "Education",
      school: "BINUS University",
      program: "Cyber Security",
      degree: "Bachelor’s Degree",
      start: "2023",
      end: "2027",
      location: "West Jakarta, Indonesia",
      progress: 0.72,
      mark: {
        src: "/images/journey/binus-logo.webp",
        alt: "BINUS University mark",
        aspectRatio: "1024 / 725"
      }
    },
    {
      id: "zenius",
      label: "Internship",
      school: "Zenius Education",
      program: "Internship",
      start: "February 2026",
      end: "Current",
      location: "East Jakarta, Indonesia",
      progress: 0.58,
      markFit: "contain",
      mark: {
        src: "/images/journey/zenius-logo.png",
        alt: "Zenius Education mark"
      }
    }
  ],
  certifications: []
};
