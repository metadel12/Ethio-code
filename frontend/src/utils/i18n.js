import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

const resources = {
  en: { translation: {
    nav: { home:'Home', jobs:'Jobs', learn:'Learn', community:'Community', dashboard:'Dashboard' },
    auth: { login:'Login', register:'Register', logout:'Logout', email:'Email', password:'Password' },
    common: { search:'Search', save:'Save', apply:'Apply', submit:'Submit', cancel:'Cancel', loading:'Loading...', error:'Something went wrong', success:'Success!' },
    jobs: { title:'Job Marketplace', post:'Post a Job', apply:'Apply Now', salary:'Salary', remote:'Remote', fullTime:'Full-time', partTime:'Part-time' },
    learn: { courses:'Courses', challenges:'Challenges', roadmap:'Roadmap', certificate:'Certificate', xp:'XP', streak:'Day Streak' },
    currency: { etb:'ETB', usd:'USD', eur:'EUR', gbp:'GBP' },
  }},
  am: { translation: {
    nav: { home:'መነሻ', jobs:'ሥራዎች', learn:'ተማር', community:'ማህበረሰብ', dashboard:'ዳሽቦርድ' },
    auth: { login:'ግባ', register:'ተመዝገብ', logout:'ውጣ', email:'ኢሜይል', password:'የይለፍ ቃል' },
    common: { search:'ፈልግ', save:'አስቀምጥ', apply:'አመልክት', submit:'አስገባ', cancel:'ሰርዝ', loading:'በመጫን ላይ...', error:'ስህተት ተፈጥሯል', success:'ተሳክቷል!' },
    jobs: { title:'የሥራ ገበያ', post:'ሥራ ለጥፍ', apply:'አሁን አመልክት', salary:'ደሞዝ', remote:'ከቤት', fullTime:'ሙሉ ጊዜ', partTime:'ትርፍ ጊዜ' },
    learn: { courses:'ኮርሶች', challenges:'ፈተናዎች', roadmap:'የትምህርት ካርታ', certificate:'ሰርተፊኬት', xp:'ነጥብ', streak:'ቀናት ተከታታይ' },
    currency: { etb:'ብር', usd:'ዶላር', eur:'ዩሮ', gbp:'ፓውንድ' },
  }},
  ar: { translation: {
    nav: { home:'الرئيسية', jobs:'الوظائف', learn:'تعلم', community:'المجتمع', dashboard:'لوحة التحكم' },
    auth: { login:'تسجيل الدخول', register:'إنشاء حساب', logout:'خروج', email:'البريد الإلكتروني', password:'كلمة المرور' },
    common: { search:'بحث', save:'حفظ', apply:'تقدم', submit:'إرسال', cancel:'إلغاء', loading:'جاري التحميل...', error:'حدث خطأ', success:'نجح!' },
  }},
  fr: { translation: {
    nav: { home:'Accueil', jobs:'Emplois', learn:'Apprendre', community:'Communauté', dashboard:'Tableau de bord' },
    auth: { login:'Connexion', register:"S'inscrire", logout:'Déconnexion', email:'Email', password:'Mot de passe' },
    common: { search:'Rechercher', save:'Enregistrer', apply:'Postuler', submit:'Soumettre', cancel:'Annuler', loading:'Chargement...', error:'Une erreur est survenue', success:'Succès!' },
  }},
  de: { translation: {
    nav: { home:'Startseite', jobs:'Jobs', learn:'Lernen', community:'Community', dashboard:'Dashboard' },
    auth: { login:'Anmelden', register:'Registrieren', logout:'Abmelden', email:'E-Mail', password:'Passwort' },
    common: { search:'Suchen', save:'Speichern', apply:'Bewerben', submit:'Absenden', cancel:'Abbrechen', loading:'Laden...', error:'Fehler aufgetreten', success:'Erfolg!' },
  }},
  zh: { translation: {
    nav: { home:'首页', jobs:'工作', learn:'学习', community:'社区', dashboard:'仪表板' },
    auth: { login:'登录', register:'注册', logout:'退出', email:'邮箱', password:'密码' },
    common: { search:'搜索', save:'保存', apply:'申请', submit:'提交', cancel:'取消', loading:'加载中...', error:'出错了', success:'成功！' },
  }},
  sw: { translation: {
    nav: { home:'Nyumbani', jobs:'Kazi', learn:'Jifunze', community:'Jamii', dashboard:'Dashibodi' },
    auth: { login:'Ingia', register:'Jisajili', logout:'Toka', email:'Barua pepe', password:'Nenosiri' },
    common: { search:'Tafuta', save:'Hifadhi', apply:'Omba', submit:'Wasilisha', cancel:'Ghairi', loading:'Inapakia...', error:'Hitilafu imetokea', success:'Imefanikiwa!' },
  }},
  so: { translation: {
    nav: { home:'Guriga', jobs:'Shaqooyinka', learn:'Baranso', community:'Bulshada', dashboard:'Xaashida' },
    auth: { login:'Gal', register:'Diiwaan geli', logout:'Ka bax', email:'Iimaylka', password:'Furaha sirta' },
    common: { search:'Raadi', save:'Keydi', apply:'Codso', submit:'Gudbi', cancel:'Jooji', loading:'Waa la rarayo...', error:'Khalad ayaa dhacay', success:'Guul!' },
  }},
  pt: { translation: {
    nav: { home:'Início', jobs:'Empregos', learn:'Aprender', community:'Comunidade', dashboard:'Painel' },
    auth: { login:'Entrar', register:'Registrar', logout:'Sair', email:'Email', password:'Senha' },
    common: { search:'Pesquisar', save:'Salvar', apply:'Candidatar', submit:'Enviar', cancel:'Cancelar', loading:'Carregando...', error:'Algo deu errado', success:'Sucesso!' },
  }},
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'am', 'ar', 'fr', 'de', 'zh', 'sw', 'so', 'pt'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
export const LANGUAGES = [
  { code: 'en', label: 'English',    flag: '🇬🇧' },
  { code: 'am', label: 'አማርኛ',       flag: '🇪🇹' },
  { code: 'ar', label: 'العربية',    flag: '🇸🇦' },
  { code: 'fr', label: 'Français',   flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch',    flag: '🇩🇪' },
  { code: 'zh', label: '中文',        flag: '🇨🇳' },
  { code: 'sw', label: 'Kiswahili',  flag: '🇰🇪' },
  { code: 'so', label: 'Soomaali',   flag: '🇸🇴' },
  { code: 'pt', label: 'Português',  flag: '🇧🇷' },
]
