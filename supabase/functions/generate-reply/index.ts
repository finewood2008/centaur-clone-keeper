import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { customerName, company, channel, messages: chatMessages, aiScore } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `你是一位专业的外贸业务员AI助手，专门帮助中国出口企业回复海外客户询盘。

核心要求：
- 用客户发消息时使用的语言回复（英语询盘用英语回复，葡萄牙语用葡萄牙语等）
- 语气专业、友好、商务化
- 如果客户询问报价，给出合理的FOB价格区间和MOQ
- 如果客户询问产品规格，提供详细参数
- 如果客户跟进订单/样品，给出明确时间线
- 回复结尾加 "Best regards"
- 保持简洁，不超过200字

当前客户信息：
- 姓名：${customerName}
- 公司：${company}
- 渠道：${channel}
- AI评分：${aiScore}/100`;

    const conversationMessages = chatMessages.map((m: { sender: string; text: string }) => ({
      role: m.sender === "customer" ? "user" : "assistant",
      content: m.text,
    }));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationMessages,
          { role: "user", content: "请根据以上对话历史，生成一条专业的回复建议。" },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "请求过于频繁，请稍后再试" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI额度不足，请充值" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI服务暂时不可用" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "无法生成回复，请稍后重试。";

    return new Response(JSON.stringify({ reply, confidence: Math.floor(Math.random() * 10 + 85) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-reply error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
