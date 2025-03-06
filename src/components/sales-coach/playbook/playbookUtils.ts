
interface Objection {
  objection: string;
  response: string;
}

export const generateDynamicObjections = (product: string, company: string, persona: string): Objection[] => {
  const productKeywords = product.toLowerCase();
  const isSubscription = productKeywords.includes("subscription") || productKeywords.includes("saas");
  const isTech = productKeywords.includes("software") || productKeywords.includes("platform") || productKeywords.includes("app");
  const isService = productKeywords.includes("service") || productKeywords.includes("consulting");
  
  const objections = [
    {
      objection: "It's too expensive",
      response: isSubscription 
        ? "Response: Focus on ROI and how our subscription model spreads costs over time"
        : "Response: Focus on ROI and long-term cost savings"
    },
    {
      objection: company ? `We already use ${company.includes(" ") ? company.split(" ")[0] : "a similar solution"}`
        : "We're happy with our current solution",
      response: isTech 
        ? "Response: Highlight our platform's unique features and superior integration capabilities"
        : "Response: Highlight unique benefits and differentiation from competitors"
    },
    {
      objection: isTech ? "We don't have IT resources to implement this" : "We don't have time to implement something new",
      response: isTech 
        ? "Response: Emphasize our dedicated implementation team and quick technical onboarding"
        : "Response: Emphasize quick onboarding and minimal disruption to operations"
    }
  ];

  if (persona) {
    objections.push({
      objection: `I need to consult with ${persona.includes("manager") ? "senior leadership" : "my team"} first`,
      response: `Response: Offer a collaborative demo with ${persona.includes("manager") ? "their team" : "key stakeholders"} to accelerate the decision process`
    });
  }

  return objections;
};

export const generateValueProps = (product: string): string[] => {
  const productKeywords = product.toLowerCase();
  const props = [];

  if (productKeywords.includes("automation") || productKeywords.includes("workflow")) {
    props.push("Increases efficiency by automating repetitive tasks");
  } else {
    props.push("Increases efficiency by streamlining workflows");
  }

  if (productKeywords.includes("cost") || productKeywords.includes("saving")) {
    props.push("Reduces operational costs by up to 30% through optimization");
  } else {
    props.push("Reduces costs through automation and resource optimization");
  }

  if (productKeywords.includes("customer") || productKeywords.includes("client") || productKeywords.includes("service")) {
    props.push("Improves customer satisfaction with faster response times and better service delivery");
  } else {
    props.push("Improves overall performance with better resource allocation");
  }

  if (productKeywords.includes("data") || productKeywords.includes("analytics")) {
    props.push("Provides actionable insights through advanced analytics");
  }

  if (productKeywords.includes("compliance") || productKeywords.includes("security")) {
    props.push("Ensures regulatory compliance and enhances security measures");
  }

  return props.slice(0, 4);
};

export const generateSalesScript = (product: string, company: string, persona: string): string[] => {
  const steps = [
    "Introduction: Build rapport and establish credibility",
    "Discovery: Understand pain points and current processes"
  ];

  if (company) {
    steps.push(`Company Background: Acknowledge ${company}'s market position and challenges`);
  }

  steps.push("Solution Presentation: Align product benefits with specific needs");

  if (persona) {
    steps.push(`Personalized Value: Address specific concerns for ${persona} role`);
  }

  steps.push("Objection Handling: Address concerns proactively");
  steps.push("Closing: Clear next steps and timeline");
  
  return steps;
};
