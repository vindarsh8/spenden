import { NextResponse } from "next/server";

function normalizePhone(value: string) {
  const cleaned = value.replace(/[\s()-]/g, "");

  if (/^\d{10}$/.test(cleaned)) {
    return `+91${cleaned}`;
  }

  if (/^\+91\d{10}$/.test(cleaned)) {
    return cleaned;
  }

  return null;
}

function required(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const phone = normalizePhone(body.phone || "");

    if (!phone) {
      return NextResponse.json(
        {
          error:
            "Please provide a valid 10-digit Indian mobile number.",
        },
        { status: 400 }
      );
    }

    let message = "";

    // WELCOME SMS
    if (body.type === "welcome") {
      message =
        "Welcome to Spenden! Your number is registered for pickup updates. We'll send your pickup details here after confirmation.";
    }

    // PICKUP CONFIRMATION SMS
    else if (body.type === "pickup") {
      const fields = [
        body.item,
        body.organization,
        body.date,
        body.time,
      ];

      if (fields.some((value) => !required(value))) {
        return NextResponse.json(
          {
            error: "Pickup details are incomplete.",
          },
          { status: 400 }
        );
      }

      const location = body.address
        ? `${body.address}, ${body.city || ""}, ${
            body.state || ""
          } - ${body.pinCode || ""}`
        : `${body.city || ""}, ${body.state || ""} - ${
            body.pinCode || ""
          }`;

      message =
        `Spenden pickup confirmed! ` +
        `Item: ${body.item}. ` +
        `Organization: ${body.organization}. ` +
        `Date: ${body.date}. ` +
        `Time: ${body.time}. ` +
        `Pickup address: ${location}.`;
    }

    // UNKNOWN REQUEST
    else {
      return NextResponse.json(
        {
          error: "Unknown SMS type.",
        },
        { status: 400 }
      );
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    /*
      DEMO MODE

      If Twilio credentials haven't been added yet,
      the website still works and returns the SMS that
      would have been sent.
    */
    if (!accountSid || !authToken || !fromNumber) {
      return NextResponse.json({
        success: true,
        demo: true,
        message,
      });
    }

    // Send SMS through Twilio
    const form = new URLSearchParams();

    form.set("To", phone);
    form.set("From", fromNumber);
    form.set("Body", message);

    const credentials = Buffer.from(
      `${accountSid}:${authToken}`
    ).toString("base64");

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: form.toString(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Twilio error:", data);

      return NextResponse.json(
        {
          error:
            data.message ||
            "Twilio could not send the SMS.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      demo: false,
      sid: data.sid,
    });
  } catch (error) {
    console.error("SMS route error:", error);

    return NextResponse.json(
      {
        error: "Unable to process the SMS request.",
      },
      { status: 500 }
    );
  }
}