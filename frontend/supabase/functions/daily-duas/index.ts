import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CONTEXT_PROMPTS: Record<string, string> = {
  morning: `أنت عالم دين إسلامي. أعطني 5 أذكار وأدعية صباحية متنوعة تشمل:
- أذكار الخروج من المنزل
- دعاء بدء العمل والرزق
- أذكار الصباح المتنوعة
- دعاء حفظ النفس والأهل

لكل ذكر أعطني: النص العربي الكامل بالتشكيل، المصدر (البخاري/مسلم/إلخ)، وعدد مرات التكرار.
نوّع في الأذكار ولا تكرر نفس الأذكار كل يوم. اختر من السنة النبوية الصحيحة فقط.`,

  midday: `أنت عالم دين إسلامي. أعطني 5 أدعية متنوعة لمنتصف اليوم تشمل:
- دعاء للوالدين (رب ارحمهما...)
- الصلاة على النبي ﷺ
- استغفار وتسبيح
- دعاء لتيسير الأمور
- دعاء شكر النعم

لكل دعاء أعطني: النص العربي الكامل بالتشكيل، المصدر، وعدد مرات التكرار.
اختر من الأحاديث الصحيحة والأدعية المأثورة فقط. نوّع الأدعية.`,

  evening: `أنت عالم دين إسلامي. أعطني 5 أذكار وأدعية مسائية تشمل:
- دعاء لتشجيع قراءة القرآن
- أذكار المساء
- دعاء ختم اليوم بخير
- دعاء حفظ من شر الليل

لكل ذكر أعطني: النص العربي الكامل بالتشكيل، المصدر، وعدد مرات التكرار.
من السنة الصحيحة فقط. نوّع الاختيارات.`,

  bedtime: `أنت عالم دين إسلامي. أعطني 5 أذكار قبل النوم تشمل:
- أذكار النوم المأثورة
- دعاء التحصين قبل النوم
- دعاء طلب المغفرة
- آيات قرآنية للنوم (آية الكرسي، المعوذتين)

لكل ذكر أعطني: النص العربي الكامل بالتشكيل، المصدر، وعدد مرات التكرار.
من السنة الصحيحة والقرآن فقط. نوّع الاختيارات.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = CONTEXT_PROMPTS[context];
    if (!prompt) {
      return new Response(JSON.stringify({ error: "Invalid context" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `أنت مساعد إسلامي متخصص. أجب دائماً بصيغة JSON فقط بدون أي نص إضافي أو markdown أو backticks.
الصيغة المطلوبة بالضبط:
{"duas":[{"arabic":"النص بالتشكيل","reference":"المصدر","count":1}]}
يجب أن يكون الرد JSON صالح فقط، بدون أي شيء آخر قبله أو بعده.`,
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    console.log("AI raw response:", content.substring(0, 500));

    // Clean and parse JSON from response
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed?.duas || parsed.duas.length === 0) {
      console.error("AI returned empty duas");
      return new Response(JSON.stringify({ error: "Empty response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
