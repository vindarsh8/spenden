import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json(
      { error: "Invalid location coordinates." },
      { status: 400 }
    );
  }

  const query = `
[out:json][timeout:20];

(
  nwr(around:15000,${lat},${lon})["amenity"="social_facility"];
  nwr(around:15000,${lat},${lon})["office"="ngo"];
  nwr(around:15000,${lat},${lon})["social_centre"];
  nwr(around:15000,${lat},${lon})["charity"];
);

out center tags;
`;

  try {
    const response = await fetch(
      "https://overpass-api.de/api/interpreter",
      {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/153.0 Safari/537.36",
          "Referer": "http://localhost:3000/",
        },
        body: query,
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "Overpass error:",
        response.status,
        errorText
      );

      return NextResponse.json(
        {
          error: `Organization service returned ${response.status}.`,
        },
        { status: 502 }
      );
    }

    const data = await response.json();

    const organizations = (data.elements || [])
      .map((place: any) => {
        const latitude =
          place.lat ?? place.center?.lat ?? null;

        const longitude =
          place.lon ?? place.center?.lon ?? null;

        if (
          latitude === null ||
          longitude === null
        ) {
          return null;
        }

        const tags = place.tags || {};

        return {
          id: `${place.type}-${place.id}`,

          name:
            tags.name ||
            tags["name:en"] ||
            "Unnamed organization",

          address:
            tags["addr:full"] ||
            [
              tags["addr:housenumber"],
              tags["addr:street"],
              tags["addr:suburb"],
              tags["addr:city"],
            ]
              .filter(Boolean)
              .join(", ") ||
            "Address not listed",

          phone:
            tags.phone ||
            tags["contact:phone"] ||
            null,

          website:
            tags.website ||
            tags["contact:website"] ||
            null,

          latitude,
          longitude,

          source: "OpenStreetMap",
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      organizations,
    });

  } catch (error) {
    console.error("Organization search failed:", error);

    return NextResponse.json(
      {
        error:
          "The organization search service could not be reached.",
      },
      { status: 500 }
    );
  }
}