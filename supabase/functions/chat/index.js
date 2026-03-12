import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `Bạn là trợ lý tư vấn thời trang của cửa hàng MAISON — một thương hiệu thời trang cao cấp.

Nhiệm vụ của bạn:
- Tư vấn phong cách, phối đồ, chọn size
- Giới thiệu sản phẩm phù hợp với nhu cầu khách hàng
- Trả lời câu hỏi về chính sách giao hàng, đổi trả, bảo hành
- Luôn thân thiện, chuyên nghiệp, trả lời bằng tiếng Việt
- Giữ câu trả lời ngắn gọn và hữu ích

Thông tin cửa hàng:
- Miễn phí vận chuyển cho đơn từ 1.000.000đ
- Đổi trả trong 30 ngày
- Bảo hành chính hãng
- Hotline: 1900 1234
- Email: hello@maison.vn
- Địa chỉ: 123 Nguyễn Huệ, Q.1, TP.HCM

Sản phẩm nổi bật:
- Áo Blazer Oversized: 1.290.000đ (giảm từ 1.690.000đ), size S-XL, màu Đen/Be
- Đầm Midi Lụa: 1.590.000đ, size XS-L, màu Đen/Đỏ rượu
- Quần Palazzo Ống Rộng: 890.000đ, size S-XL, màu Trắng kem/Đen/Nâu
- Áo Sơ Mi Lụa: 790.000đ, size XS-XL, màu Trắng/Hồng pastel
- Túi Xách Mini: 1.190.000đ (giảm từ 1.490.000đ)
- Đầm Maxi Hoa: 1.390.000đ, size S-L
- Quần Jeans Skinny: 690.000đ, size 26-32
- Khăn Lụa Vuông: 490.000đ`,
            },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Hệ thống đang bận, vui lòng thử lại sau." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Dịch vụ AI tạm thời không khả dụng." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Lỗi hệ thống AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
