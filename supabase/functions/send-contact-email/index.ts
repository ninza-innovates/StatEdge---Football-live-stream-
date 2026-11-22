import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import {
  contactConfirmationHtml,
  contactNotificationHtml,
  contactNotificationSubject,
  parseContactSubmission,
} from "./format.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received contact form submission");
    const parsed = parseContactSubmission(await req.json());
    if (!parsed.ok) {
      return new Response(JSON.stringify({ error: parsed.error }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { name, email, subject, message } = parsed.value;
    console.log(`Processing contact from: ${name} (${email})`);

    // Send email to support team
    const emailResponse = await resend.emails.send({
      from: "StatEdge Support <support@statedge.ai>",
      to: ["support@statedge.ai"],
      replyTo: email,
      subject: contactNotificationSubject(subject),
      html: contactNotificationHtml({ name, email, subject, message }),
    });

    console.log("Email sent successfully:", emailResponse);

    // Send confirmation to user
    await resend.emails.send({
      from: "StatEdge Support <support@statedge.ai>",
      to: [email],
      subject: "We received your message!",
      html: contactConfirmationHtml({ name, message }),
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
