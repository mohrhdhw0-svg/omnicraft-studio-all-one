import './style.css';
const $=(s,r=document)=>r.querySelector(s);
const languages=[
['ar','العربية','rtl'],['en','English','ltr'],['fr','Français','ltr'],['es','Español','ltr'],['de','Deutsch','ltr'],['pt','Português','ltr'],['ru','Русский','ltr'],['tr','Türkçe','ltr'],['hi','हिन्दी','ltr'],['zh','简体中文','ltr'],['ja','日本語','ltr'],['ko','한국어','ltr'],['id','Bahasa Indonesia','ltr'],['ur','اردو','rtl'],['fa','فارسی','rtl'],['bn','বাংলা','ltr'],['sw','Kiswahili','ltr'],['it','Italiano','ltr'],['nl','Nederlands','ltr'],['pl','Polski','ltr']
];
const dict={
ar:{home:'الرئيسية',projects:'مشاريعك',new:'مشروع جديد',video:'تحرير فيديو',image:'تحرير صورة',ai:'استوديو الذكاء الاصطناعي',media:'الوسائط',text:'النصوص',audio:'الصوت',effects:'التأثيرات',settings:'الإعدادات',login:'تسجيل الدخول',signup:'إنشاء حساب',cloud:'المزامنة السحابية',welcome:'كل فكرة تستحق أن تُصنع.',desc:'حرّر الفيديو، صمّم الصور، وامنح أفكارك حياة من مكان واحد.',create:'إنشاء مشروع',import:'استيراد ملفات',preview:'معاينة المشروع',timeline:'الخط الزمني',export:'تصدير',empty:'مساحتك الإبداعية تبدأ من هنا',emptyDesc:'أنشئ مشروعك الأول وابدأ بتحويل أفكاضۧq˞