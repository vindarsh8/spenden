
import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Email service is not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const email = String(body.email || "").trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const resend = new Resend(apiKey);

    let subject = "";
    let message = "";

    if (body.type === "welcome") {
      subject = "Welcome to Spenden!";
      message =
        "Welcome to Spenden! Thank you for helping give items a second life. We'll email you when your pickup is confirmed.";
    } else if (body.type === "pickup") {
      const { item, organization, date, time, address, city, state, pinCode } = body;

      if (![item, organization, date, time].every(
        (value) => typeof value === "string" && value.trim()
      )) {
        return NextResponse.json(
          { error: "Pickup details are incomplete." },
          { status: 400 }
        );
      }

      subject = "Your Spenden pickup details";

      message = [
        "Your Spenden pickup has been confirmed!",
        "",
        `Item: ${item}`,
        `Organization: ${organization}`,
        `Date: ${date}`,
        `Time: ${time}`,
        `Address: ${address || "Not provided"}`,
        `City: ${city || ""}`,
        `State: ${state || ""}`,
        `PIN code: ${pinCode || ""}`,
        "",
        "Thank you for donating with Spenden!",
      ].join("\n");
    } else {
      return NextResponse.json(
        { error: "Unknown email type." },
        { status: 400 }
      );
    }

    const result = await resend.emails.send({
      from: "Spenden <onboarding@resend.dev>",
      to: email,
      subject,
      text: message,
    });

    if (result.error) {
      console.error("Resend error:", result.error);

      return NextResponse.json(
        { error: result.error.message || "Email could not be sent." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email API error:", error);

    return NextResponse.json(
      { error: "Unable to send the email right now." },
      { status: 500 }
    );
  }
}
