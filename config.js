// Everything you'd edit lives here. Used by index.html, signature.html and render.html.
window.PROFILE = {
  // Public URL where this folder is hosted (trailing slash). Signature images load from here,
  // so Gmail needs it to be live before you paste the signature.
  baseUrl: "https://jashan-ai-sys.github.io/card/",

  name: "Jashanprit Singh",
  firstName: "Jashanprit",
  initials: "JS",
  role: "Freelance AI Engineer",
  tagline: "AI voice agents · Chatbots · Automation",
  location: "India · Working remotely",
  // Drop a portrait at assets/photo.jpg (portrait crop, ~1200×1600). Without it a monogram is used.
  photo: "assets/photo.jpg",

  email: "singhjashanprit86@gmail.com",
  website: "https://jashan-ai-sys.github.io/",
  links: [
    { id: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/jashanprit-singh-/" },
    { id: "github", label: "GitHub", url: "https://github.com/Jashan-ai-sys" },
    { id: "globe", label: "Portfolio", url: "https://jashan-ai-sys.github.io/" },
  ],

  currently: "Building AI voice agents and chatbots for businesses, tested for safety before they meet your customers.",

  work: [
    {
      title: "Payment recovery voice agent",
      tags: ["Voice AI", "Hindi", "Twilio", "Cloud Run"],
      text: "Built for the Razorpay AI Buildathon. Spots subscription payments at risk, decides when to call, and phones the customer in Hindi with a payment link sent during the call.",
      url: "https://github.com/Jashan-ai-sys/dunning-agent",
      hue: 24,
    },
    {
      title: "Multi-agent customer support",
      tags: ["Multi-agent", "MCP", "Gemini"],
      text: "A team of AI agents resolves support tickets: one scores risk, one plans, one checks the plan against policy, one carries it out, and every step lands in an audit log.",
      url: "https://github.com/Jashan-ai-sys/ShopWave-MultiAgent-Customer-Support-System",
      hue: 215,
    },
    {
      title: "Sales call intelligence",
      tags: ["Whisper", "Llama", "RAG", "FastAPI"],
      text: "Turns sales-call recordings into transcripts, detects intent, sentiment and objections, finds the turning points, and shows a score and coaching notes.",
      url: "https://github.com/Jashan-ai-sys/AI-Sales-Call-Intelligence-System",
      hue: 150,
    },
  ],

  // Scripted "digital persona" answers. Chips show in this order. Keys match at word starts;
  // lower matchOrder is checked first (so "hire you to build" is a hiring question).
  persona: [
    { q: "What do you build?", matchOrder: 5,
      keys: ["what do you", "what can you", "services", "offer", "about you", "yourself", "build", "make", "chatbot", "agent", "call", "automat", "integrat", "crm"],
      a: "Three things: AI voice agents (inbound and outbound calls, lead qualification, reminders, support lines), chatbots that answer from your own documents and hand off to your team, and automation for reports, data entry, CRM updates and portals." },
    { q: "Show me your work", matchOrder: 4,
      keys: ["your work", "show me", "project", "portfolio", "example", "case stud", "past work"],
      a: "A Hindi payment-recovery voice agent, a multi-agent support system with an audit log, and a sales-call analyser. Tap “Work in slides” on the profile for each one, or see the portfolio." },
    { q: "Can it run on our servers?", matchOrder: 2,
      keys: ["server", "host", "on-prem", "on prem", "private", "aws", "docker", "deploy", "data"],
      a: "Yes. Open-source models can run on your own servers, deployed with Docker or on AWS, so your data stays with you." },
    { q: "How do you test them?", matchOrder: 3,
      keys: ["test", "safe", "eval", "jailbreak", "injection", "hallucinat", "accura", "reliab", "quality"],
      a: "Before launch: does it stay on topic and on script, refuse what it should, avoid leaking data or inventing answers, and hold up against prompt-injection and jailbreak attempts." },
    { q: "How do I hire you?", matchOrder: 1,
      keys: ["hire", "price", "pricing", "cost", "budget", "quote", "rates", "charge", "contact", "email", "available", "availability"],
      a: "Email works best: singhjashanprit86@gmail.com. Share what you want automated and I'll reply with an approach and an estimate." },
  ],
  personaFallback: "I'm a scripted preview, so I only know the basics. For anything else, email singhjashanprit86@gmail.com and the real Jashanprit will answer.",
};
