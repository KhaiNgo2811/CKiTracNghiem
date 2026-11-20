// Vercel Serverless Function: /api/chat
// Chatbot giải thích câu hỏi. Khóa API đặt trong Environment Variables của Vercel (ANTHROPIC_API_KEY),
// KHÔNG bao giờ để trong code/repo.

const MODEL = process.env.CHAT_MODEL || 'claude-haiku-5-5';
const MAX_BODY_CHARS = 8000;
const MAX_USER_CHARS = 600;
const MAX_HISTORY = 6;
const RATE_LIMIT = 20; // số lượt / phút / IP (giới hạn tương đối, theo từng instance)
const hits = new Map();

function limited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60000);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 500) hits.clear();
  return arr.length > RATE_LIMIT;
}

const clip = (v, n) => String(v == null ? '' : v).slice(0, n);

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(503).json({ error: 'Chatbot chưa được cấu hình (thiếu ANTHROPIC_API_KEY).' });

  // Chỉ nhận request từ chính trang web này
  const origin = req.headers.origin || '';
  const host = req.headers.host || '';
  if (origin && !origin.includes(host)) return res.status(403).json({ error: 'Forbidden' });

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (limited(ip)) return res.status(429).json({ error: 'Bạn hỏi hơi nhanh, đợi một chút rồi thử lại nhé.' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = null; }
  }
  if (!body || JSON.stringify(body).length > MAX_BODY_CHARS) return res.status(400).json({ error: 'Yêu cầu không hợp lệ.' });

  const q = body.question || {};
  const options = Object.entries(q.options || {}).slice(0, 6)
    .map(([k, v]) => `${clip(k, 2)}. ${clip(v, 300)}`).join('\n');
  const context =
    `Câu hỏi: ${clip(q.question, 1500)}\n${options}\n` +
    `Đáp án đúng: ${clip(q.correctAnswer, 2)}\n` +
    (q.explanation ? `Giải thích có sẵn: ${clip(q.explanation, 1200)}\n` : '') +
    (q.subject ? `Môn: ${clip(q.subject, 80)}\n` : '');

  const history = (Array.isArray(body.history) ? body.history : []).slice(-MAX_HISTORY)
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content)
    .map((m) => ({ role: m.role, content: clip(m.content, MAX_USER_CHARS * 3) }));
  const message = clip(body.message, MAX_USER_CHARS).trim();
  if (!message) return res.status(400).json({ error: 'Thiếu nội dung câu hỏi.' });

  // Bảo đảm lượt đầu là "user" và các lượt xen kẽ
  const messages = [];
  history.forEach((m) => {
    if (messages.length === 0 && m.role !== 'user') return;
    if (messages.length && messages[messages.length - 1].role === m.role) return;
    messages.push(m);
  });
  if (messages.length && messages[messages.length - 1].role === 'user') messages.pop();
  messages.push({ role: 'user', content: message });

  const system =
    'Bạn là gia sư ôn thi giúp sinh viên Việt Nam hiểu một câu hỏi trắc nghiệm. ' +
    'Trả lời bằng tiếng Việt, thuật ngữ chuyên môn giữ nguyên tiếng Anh. Giải thích ngắn gọn, dễ hiểu, từng bước; ' +
    'với câu tính toán thì viết rõ công thức và các bước tính. Nếu cần, giải thích vì sao các đáp án còn lại sai. ' +
    'Chỉ nói về nội dung câu hỏi và kiến thức liên quan; từ chối lịch sự các yêu cầu không liên quan đến việc học. ' +
    'Nếu đáp án hoặc giải thích có sẵn có vẻ mâu thuẫn với kiến thức chuẩn, hãy nói rõ để sinh viên kiểm tra lại với giáo trình.\n\n' +
    'Ngữ cảnh câu hỏi:\n' + context;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 700, system, messages })
    });
    const data = await r.json();
    if (!r.ok) return res.status(502).json({ error: 'Không gọi được AI lúc này, thử lại sau.' });
    const text = (data.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n').trim();
    return res.status(200).json({ reply: text || '(AI không trả lời được)' });
  } catch (e) {
    return res.status(502).json({ error: 'Không gọi được AI lúc này, thử lại sau.' });
  }
};
