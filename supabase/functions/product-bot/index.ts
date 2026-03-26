import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { productName, productSku, productPrice, productMoq, factoryName, specs, messages: chatMessages } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `你是一位专业的产品助手AI，代表工厂"${factoryName}"为OPC（海外推广公司）提供产品咨询服务。

你正在服务的产品信息：
- 产品名称：${productName}
- SKU：${productSku}
- 单价：${productPrice}
- 最小起订量：${productMoq}
- 规格参数：${specs || "暂无详细规格"}

你的能力范围：
1. 产品技术参数解答 - 准确回答产品规格、性能、材质等技术问题
2. 定制化需求咨询 - 说明定制选项（如颜色、logo、包装等），给出合理的附加费用
3. 价格谈判空间 - 标准价格基础上，首单可有5-10%折扣空间，大单量(5x MOQ以上)可有15%折扣
4. 交期与物流 - 标准交期15-30天，急单加急费10%可缩短至10天，支持FOB/CIF
5. 认证与合规 - 说明已有认证（CE、RoHS、UL等），可根据目标市场办理额外认证
6. 样品申请 - 样品免费（限3件），客户承担运费，样品交期7天
7. 售后政策 - 质量问题免费更换，提供1年质保

回复要求：
- 用中文回复（OPC是中国公司）
- 语气专业友好，像一个懂行的产品经理
- 回复简洁精准，不超过150字
- 如果问题超出你的知识范围，诚实告知并建议联系工厂业务经理
- 适当给出建议性行动（如"建议申请样品测试"）`;

    const conversationMessages = chatMessages.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
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
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "请求过于频繁，请稍后再试" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI额度不足" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("product-bot error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI服务暂时不可用" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("product-bot error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
