import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { useLang } from '@/i18n/LangContext';

export default function SiteInformation({ kind }: { kind: 'privacy' | 'terms' }) {
  const { isAr } = useLang();
  const privacy = kind === 'privacy';
  const title = privacy ? (isAr ? 'معلومات الخصوصية' : 'Privacy information') : (isAr ? 'استخدام الموقع' : 'Website terms');
  const sections = privacy ? (isAr ? [
    ['البيانات التي تقدمها', 'تتضمن نماذج الموقع بيانات التواصل وتفاصيل طلبك. عند إنشاء حساب، يتم حفظ بيانات الحساب. وقد تتضمن طلبات محاكي الإعلانات التصميم الذي ترفعه. لا تضع بيانات حساسة داخل التصميم أو الرسالة.'],
    ['التخزين والتحليلات', 'يستخدم الموقع التخزين المحلي للاحتفاظ بمحتوى عام لتسريع العرض، وبيانات تسجيل الدخول عند استخدام الحساب. كما يتضمن أدوات Google للتحليلات وقياس استخدام الموقع. يمكنك التحكم في التخزين وملفات تعريف الارتباط من إعدادات المتصفح.'],
    ['الاستفسارات وطلبات البيانات', 'للاستفسار عن استخدام بياناتك أو طلب تصحيحها أو حذفها، تواصل مع Horizon OOH من صفحة التواصل وحدد الحساب أو الطلب المقصود.'],
  ] : [
    ['Information you provide', 'Website forms collect contact details and your enquiry. Creating an account stores account information. Simulator submissions can include an uploaded design. Avoid including sensitive information in designs or messages.'],
    ['Storage and analytics', 'The website uses local browser storage for cached public content and account sign-in information. It also includes Google analytics tools to measure website use. You can manage browser storage and cookies in your browser settings.'],
    ['Questions and data requests', 'Contact Horizon OOH through the contact page to ask about your information or request correction or deletion. Identify the relevant account or enquiry so the team can locate it.'],
  ]) : (isAr ? [
    ['معلومات الخدمات والمواقع', 'يعرض الموقع خدمات Horizon OOH ومواقع الإعلانات والمشروعات. تواصل مع الفريق لتأكيد التوفر والمواصفات والأسعار قبل حجز أي حملة.'],
    ['الحسابات والتصميمات', 'استخدم بيانات صحيحة عند التواصل وحافظ على سرية بيانات حسابك. ارفع فقط المواد التي تملكها أو لديك تصريح باستخدامها. معاينة المحاكي توضيحية ولا تُعد تأكيدًا لحجز إعلان.'],
    ['طلبات الحملات', 'يتم الاتفاق على نطاق العمل والأسعار والمواعيد وشروط الحملة مع الفريق ضمن العرض أو الاتفاق الخاص بها. إرسال نموذج الموقع هو طلب تواصل.'],
  ] : [
    ['Services and locations', 'This website presents Horizon OOH services, advertising locations and projects. Contact the team to confirm availability, specifications and pricing before booking a campaign.'],
    ['Accounts and designs', 'Provide accurate contact details and keep your account credentials private. Upload only material you own or have permission to use. Simulator previews are illustrative and do not confirm an advertising booking.'],
    ['Campaign enquiries', 'Campaign scope, prices, dates and commercial terms are agreed with the team in the relevant proposal or agreement. Submitting a website form requests contact from the team.'],
  ]);
  return <div className="bg-white text-[#0B0F1A] min-h-screen pt-32 pb-20 px-6" dir={isAr ? 'rtl' : 'ltr'}>
    <SEO title={`${title} | Horizon OOH`} description={sections[0][1]} canonical={`/${kind}`} />
    <article className="max-w-3xl mx-auto"><h1 className="text-4xl font-bold mb-10">{title}</h1>
      {sections.map(([heading, text]) => <section key={heading} className="mb-8"><h2 className="text-xl font-bold mb-3">{heading}</h2><p className="leading-8 text-gray-700">{text}</p></section>)}
      <Link className="text-[#D90429] underline" to={isAr ? '/ar/contact' : '/contact'}>{isAr ? 'تواصل معنا' : 'Contact Horizon OOH'}</Link>
    </article>
  </div>;
}
