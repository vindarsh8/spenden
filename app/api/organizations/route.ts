import { NextResponse } from "next/server";

type DemoOrg = {
  id: string;
  name: string;
  address: string;
  cities: string[];
  states: string[];
  pinCodes: string[];
  acceptedItems: string[];
  sourceUrl: string;
  reason: string;
};

const organizations: DemoOrg[] = [
  {
    id: "sads",
    name: "Share At Door Step",
    address: "India-wide donation service",
    cities: [],
    states: ["kerala", "tamil nadu", "karnataka", "maharashtra", "delhi"],
    pinCodes: [],
    acceptedItems: ["Clothes", "Books", "Electronics"],
    sourceUrl: "https://shareatdoorstep.com/donate/",
    reason: "Its donation service lists clothes, books and e-waste/electronics and provides doorstep pickup options.",
  },
  {
    id: "goonj",
    name: "Goonj",
    address: "Multiple centres across India",
    cities: [],
    states: ["kerala", "delhi", "maharashtra", "karnataka", "tamil nadu"],
    pinCodes: [],
    acceptedItems: ["Clothes", "Books", "Electronics"],
    sourceUrl: "https://goonj.org/faq/",
    reason: "Goonj publicly lists clothing, books/paper and working electronics among material it can receive, subject to its current guidelines.",
  },
  {
    id: "local-demo",
    name: "Local Community Recycling Partner",
    address: "Nearby partner — demo listing",
    cities: [],
    states: [],
    pinCodes: [],
    acceptedItems: ["Plastic", "Electronics"],
    sourceUrl: "https://www.epa.gov/recycle",
    reason: "Demo partner used to demonstrate how Spenden can route recyclable materials to a suitable local recycling partner.",
  },
];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const item = searchParams.get("item") || "";
  const city = normalize(searchParams.get("city") || "");
  const state = normalize(searchParams.get("state") || "");
  const pinCode = searchParams.get("pinCode") || "";

  if (!item) {
    return NextResponse.json({ error: "Item is required." }, { status: 400 });
  }

  const matches = organizations
    .filter((org) => org.acceptedItems.includes(item))
    .map((org) => {
      const cityMatch = city && org.cities.some((x) => normalize(x) === city);
      const stateMatch = state && org.states.some((x) => normalize(x) === state);
      const pinMatch = pinCode && org.pinCodes.includes(pinCode);

      let score = 0;
      if (pinMatch) score += 5;
      if (cityMatch) score += 4;
      if (stateMatch) score += 2;

      return {
        ...org,
        locationMatch: Boolean(pinMatch || cityMatch || stateMatch),
        score,
      };
    })
    .sort((a, b) => b.score - a.score);

  return NextResponse.json({
    organizations: matches,
    note: "This school-project demo uses a small source-backed dataset. Spenden pickup is a proposed service layer, not a claim that each organization provides its own pickup.",
  });
}
