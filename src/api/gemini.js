const TEXT_MODEL="gemini-3.8-flash";
const IMAGE_MODEL="gemini-3.1-flash-image";
const MAX_FILE_BYTES=2500000;
const counts=new Map();
const tasks={
captions:"Create accurate subtitles for the supplied audio or video. Return valid WebVTT only, with realistic timestamps and concise readable lines.",
transcribe:"Transcribe the supplied audio accurately in its original language. Return only the transcript.",
summarize:"Analyze the supplied video or audio and provide a concise structured summary with key moments and timestamps when possible.",
translate:"Translate the supplied text or transcript into the requested target language. Preserve meaning, tone, names, and subtitle line breaks.",
script:"Write a polished, engaging voiceover script suitable for a short video. Include a strong hook, clear narration, and a concise ending.",
describe:"Describe the supplied image in useful visual detail, including composition, objects, colors, lighting, and suggested improvements.",
marketing:"Create persuasive marketing copy. Return a headline, short description, and call to action.",
assistant:"Act as a practical creative-studio assistant. Give direct, actionable output tailored to video, image, audio, and content creation."
};
function reply(res,status,body){res.statusCode=status;res.setHeader("Content-Type","application/json; charset=utf-8");res.setHeader("Cache-Control","no-store");res.end(JSON.stringify(body))}
function limited(req){const ip=String(req.headers["x-forwarded-for"]||"unkno¶»§q«^