const TEXT_MODELS=["gemini-3.5-flash-lite","gemini-3.6-flash","gemini-3.8-flash"];
const IMAGE_MODELS=["gemini-3.1-flash-lite-image","gemini-3.1-flash-image"];
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
function limited(req){const ip=String(req.headers["x-forwarded-for"]||"unknown").split(",")[0].trim(),now=Date.now(),v=counts.get(ip);if(!v||now-v.at>60000){counts.set(ip,{at:now,n:1});return false}v.n++;return v.n>12}
export default async function handler(req,res){
if(req.method!=="POST")return reply(res,405,{error:"Method not allowed."});
const origin=req.headers.origin;if(origin){try{const h=new URL(origin).host,r=String(req.headers.host||"").split(":")[0];if(h!==r&&!h.endsWith(".vercel.app"))return reply(res,403,{error:"Origin not allowed."})}catch{return reply(res,403,{error:"Origin not allowed."})}}
if(limited(req))return reply(res,429,{error:"Too many AI requests. Please wait one minute and try again."});
const key=process.env.GEMINI_API_KEY;if(!key)return reply(res,503,{error:"Gemini is not configured on the server yet."});
try{
const body=req.body||{},action=body.action||"assistant",prompt=body.prompt||"",file=body.file||null;
const valid=new Set(["captions","transcribe","summarize","translate","script","describe","marketing","assistant","image","poster"]);
if(!valid.has(action))return reply(res,400,{error:"Unsupported AI task."});
if(typeof prompt!=="string"||prompt.length>8000)return reply(res,400,{error:"Prompt is too long (maximum 8,000 characters)."});
if(file){
const types=new Set(["image/jpeg","image/png","image/webp","image/gif","audio/mpeg","audio/mp3","audio/wav","audio/mp4","audio/aac","audio/ogg","video/mp4","video/webm","application/pdf"]);
if(typeof file.data!=="string"||!types.has(file.mimeType))return reply(res,415,{error:"This media format is not supported."});
if(Buffer.byteLength(file.data,"base64")>MAX_FILE_BYTES)return reply(res,413,{error:"Choose a file smaller than 2.5 MB for this secure upload route."});
}
const imageTask=action==="image"||action==="poster";
if(["captions","transcribe","summarize","describe","poster"].includes(action)&&!file)return reply(res,400,{error:"Choose an audio, video, or image file for this task."});
if(action==="image"&&!prompt.trim())return reply(res,400,{error:"Describe the image you want to create or edit."});
const instruction=[tasks[action]||"",prompt.trim(),file&&file.name?"Uploaded file: "+String(file.name).slice(0,120):""].filter(Boolean).join("\n\n");
const parts=[{text:instruction||"Help me with this creative project."}];if(file)parts.push({inlineData:{mimeType:file.mimeType,data:file.data}});
const models=imageTask?IMAGE_MODELS:TEXT_MODELS;
const generationConfig=imageTask?{responseModalities:["TEXT","IMAGE"]}:{temperature:0.4,maxOutputTokens:4096};
let upstream,data,model;
for(const candidate of models){
 model=candidate;
 upstream=await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+model+":generateContent",{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":key},body:JSON.stringify({contents:[{role:"user",parts}],generationConfig}),signal:AbortSignal.timeout(25000)});
 data=await upstream.json().catch(()=>({}));
 if(upstream.ok||!(upstream.status===429||upstream.status>=500))break;
}
if(!upstream.ok){if(imageTask&&(upstream.status===429||upstream.status===403))return reply(res,429,{error:"Gemini image generation is not included in the current free tier or its image quota is exhausted. Enable paid Gemini API access to use this tool."});const msg=data&&data.error&&data.error.message?data.error.message:"Gemini request failed.";return reply(res,upstream.status===429?429:upstream.status>=500?502:400,{error:msg})}
const output=data&&data.candidates&&data.candidates[0]&&data.candidates[0].content&&data.candidates[0].content.parts||[];
const text=output.filter(x=>x.text).map(x=>x.text).join("\n").trim();
const images=output.filter(x=>x.inlineData&&x.inlineData.data).map(x=>({mimeType:x.inlineData.mimeType||"image/png",data:x.inlineData.data}));
if(!text&&!images.length)return reply(res,502,{error:"Gemini returned no usable content. Try another prompt or file."});
return reply(res,200,{ok:true,model,text,images});
}catch(e){return reply(res,500,{error:e&&e.name==="TimeoutError"?"The AI request took too long. Try a shorter clip or prompt.":"The AI service could not complete this request."})}
}
