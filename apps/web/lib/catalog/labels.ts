import type { AssertionType, JourneyAction } from "@journeylens/contracts";

export const ACTION_LABELS: Record<JourneyAction, string> = {
  navigate: "Navigate",
  click: "Click",
  type: "Type",
  select: "Select",
  scroll: "Scroll",
  wait: "Wait",
};

export const ASSERTION_LABELS: Record<AssertionType, string> = {
  visible: "Is visible",
  hidden: "Is hidden",
  text: "Contains text",
  url: "URL contains",
  count: "Element count",
};
