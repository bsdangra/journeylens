import type { Persona } from "@journeylens/contracts";

export const personas: Persona[] = [
  {
    id: "first-time-shopper",
    name: "First-time Shopper",
    description: "A user unfamiliar with the website or its shopping process.",
    goals: [
      "Understand how to browse products",
      "Find and purchase a product",
      "Understand each checkout step",
    ],
    evaluationFocus: [
      "Discoverability",
      "Navigation clarity",
      "Instruction clarity",
    ],
  },
  {
    id: "time-conscious-shopper",
    name: "Time-conscious Shopper",
    description: "A user who wants to complete purchases quickly.",
    goals: [
      "Find a product quickly",
      "Complete checkout with minimal effort",
    ],
    evaluationFocus: [
      "Interaction efficiency",
      "Number of steps",
      "Response time",
    ],
  },
  {
    id: "accessibility-conscious-shopper",
    name: "Accessibility-conscious Shopper",
    description: "A user who depends on accessible interactions and clear feedback.",
    goals: [
      "Navigate using accessible controls",
      "Understand form labels and validation",
      "Receive clear interaction feedback",
    ],
    evaluationFocus: [
      "Keyboard accessibility",
      "Accessible labels",
      "Focus management",
      "Error feedback",
    ],
  },
];

export function getPersonas(personaIds?: string[]): Persona[] {
  if (!personaIds || personaIds.length === 0) {
    return personas;
  }
  const filtered = personas.filter((p) => personaIds.includes(p.id));
  return filtered.length > 0 ? filtered : personas;
}
