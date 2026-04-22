#!/usr/bin/env node

/**
 * Script để test Supabase chat edge function
 * Chạy: node test-chat-function.js
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "your-supabase-url";
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "your-publishable-key";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Lỗi: Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_PUBLISHABLE_KEY");
  console.log("\nHãy set các biến môi trường hoặc sửa giá trị trong script này.");
  process.exit(1);
}

const CHAT_URL = `${SUPABASE_URL}/functions/v1/chat`;

console.log("🧪 Testing Supabase Chat Function...");
console.log(`📍 URL: ${CHAT_URL}`);
console.log("");

const testMessages = [
  { role: "user", content: "Xin chào, tôi muốn mua áo sơ mi nam" }
];

fetch(CHAT_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${SUPABASE_KEY}`,
  },
  body: JSON.stringify({ messages: testMessages }),
})
  .then(async (resp) => {
    console.log(`📊 Status: ${resp.status} ${resp.statusText}`);
    console.log(`📋 Headers:`, Object.fromEntries(resp.headers));
    
    if (!resp.ok) {
      const errorText = await resp.text();
      console.error("\n❌ Lỗi từ server:");
      console.error(errorText);
      return;
    }

    if (!resp.body) {
      console.error("❌ Không có response body!");
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = "";

    console.log("\n📨 Nhận response:");
    console.log("---");

    async function read() {
      const { done, value } = await reader.read();
      if (done) {
        console.log("---");
        console.log(`✅ Hoàn thành! Độ dài: ${fullResponse.length} ký tự`);
        return;
      }

      const chunk = decoder.decode(value, { stream: true });
      process.stdout.write(chunk);
      fullResponse += chunk;
      return read();
    }

    return read();
  })
  .catch((error) => {
    console.error("❌ Fetch error:", error.message);
    console.error("\n💡 Có thể là:");
    console.error("  1. SUPABASE_URL sai");
    console.error("  2. Edge function chưa deploy");
    console.error("  3. GOOGLE_GEMINI_API_KEY chưa set trong Supabase Secrets");
    console.error("  4. Network/CORS issue");
  });
