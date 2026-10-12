import type { Locale } from "@/lib/locales";
import type { Settings } from "@/lib/site";

export type LegalSlug = "kvkk" | "terms" | "privacy";
export type LegalSection = { heading: string; paragraphs: string[] };
export type LegalDocs = Record<LegalSlug, LegalSection[]>;

export const legalSlugs: LegalSlug[] = ["kvkk", "terms", "privacy"];

export function isLegalSlug(value: string): value is LegalSlug {
  return (legalSlugs as string[]).includes(value);
}

function fillTokens(text: string, lang: Locale, settings: Settings) {
  const contact = settings.email
    ? lang === "tr" ? `${settings.email} adresi` : settings.email
    : lang === "tr" ? "web sitemizin iletişim sayfası" : "the contact page of our website";
  const address = settings.address[lang] || (lang === "tr" ? "iletişim sayfamız" : "our contact page");
  return text
    .replaceAll("{legalName}", settings.legalName)
    .replaceAll("{contact}", contact)
    .replaceAll("{address}", address);
}

export function fillLegalTokens(text: string, lang: Locale, settings: Settings) {
  return fillTokens(text, lang, settings);
}

const tr: LegalDocs = {
  kvkk: [
    {
      heading: "1. Veri Sorumlusu",
      paragraphs: [
        `6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca veri sorumlusu {legalName}'dır. İletişim adresi: {address}. KVKK kapsamındaki başvurularınızı {contact} üzerinden iletebilirsiniz.`,
      ],
    },
    {
      heading: "2. İşlenen Kişisel Veriler",
      paragraphs: [
        "Teklif formunda ad soyad, e-posta, isteğe bağlı telefon, seçilen hizmet, proje büyüklüğü ve mesaj; iletişim formunda ad soyad, e-posta, konu ve mesaj işlenir. Form kötüye kullanımını sınırlamak için başvuruyla ilişkilendirilen takma adlı bir teknik özet de tutulabilir. Analitik izni verirseniz ziyaret edilen sayfa, yönlendiren alan adı, cihaz/tarayıcı kategorisi, ziyaret zamanı ve IP adresinin kendisini içermeyen takma adlı bir kaynak özeti kaydedilir.",
      ],
    },
    {
      heading: "3. İşleme Amaçları",
      paragraphs: [
        "Verileriniz teklif ve iletişim taleplerinizi yanıtlamak, sözleşme öncesi görüşmeleri yürütmek, kötüye kullanım ve güvenlik olaylarını önlemek, yalnızca izin verdiğinizde toplu site istatistikleri üretmek ve hukuki yükümlülükleri yerine getirmek için işlenir. Pazarlama mesajı göndermek için kullanılmaz.",
      ],
    },
    {
      heading: "4. Hukuki Sebepler",
      paragraphs: [
        "Form verileri, talebiniz üzerine sözleşme öncesi işlemlerin yürütülmesi ve koşulları oluştuğunda hukuki yükümlülük veya temel haklarınızla dengelenmiş meşru menfaat hukuki sebeplerine dayanılarak işlenebilir. İsteğe bağlı ziyaret analitiği açık rızaya dayanır; formdaki aydınlatma teyidi açık rıza veya pazarlama izni değildir. Analitik iznini reddetmeniz siteyi ve formları kullanmanıza engel olmaz.",
      ],
    },
    {
      heading: "5. Verilerin Aktarılması",
      paragraphs: [
        "Veriler; barındırma, veritabanı, e-posta bildirimi ve görsel depolama hizmeti sunan iş ortaklarına ve kanunen yetkili kurumlara, hizmet için gerekli olduğu ölçüde aktarılabilir. Bazı sağlayıcılar Türkiye dışında bulunabilir. Yurt dışına aktarım, yalnızca KVKK'nın 9. maddesi ve uygulanabilir diğer mevzuattaki şartlar ile güvenceler sağlandığında yapılır. Güncel sağlayıcı ve aktarım bilgileri talep üzerine paylaşılır.",
      ],
    },
    {
      heading: "6. Toplama Yöntemi",
      paragraphs: [
        "Veriler, web formları, sunucu güvenlik kayıtları ve analitik izni verdiğinizde tarayıcınızdan gelen sayfa görüntüleme bildirimleri aracılığıyla elektronik ortamda toplanır.",
      ],
    },
    {
      heading: "7. Haklarınız",
      paragraphs: [
        "KVKK'nın 11. maddesi uyarınca kişisel verilerinizin işlenip işlenmediğini öğrenme, bilgi ve örnek talep etme, yanlış veya eksik verilerin düzeltilmesini ve şartları oluştuğunda silinmesini/yok edilmesini isteme, aktarılan tarafları öğrenme, kanuna aykırı işleme nedeniyle zararın giderilmesini talep etme ve kanundaki diğer haklara sahipsiniz.",
      ],
    },
    {
      heading: "8. Başvuru ve yanıt süresi",
      paragraphs: [`Taleplerinizi kimliğinizi doğrulamaya elverişli bilgilerle {contact} üzerinden iletebilirsiniz. Usulüne uygun başvurular KVKK ve ilgili başvuru usullerine göre değerlendirilir ve en geç 30 gün içinde sonuçlandırılır. Gerekli kimlik doğrulama bilgileri talebin niteliğine göre istenebilir.`],
    },
    {
      heading: "9. Saklama süreleri",
      paragraphs: [
        "Ziyaret analitiği ve yönetici giriş güvenlik olayları 30 günlük otomatik silme süresine tabidir; silme işlemi teknik nedenlerle kısa süre gecikebilir. Teklif ve iletişim kayıtları şu anda otomatik olarak sona ermez; talep sonuçlandırıldıktan ve olası hukuki saklama yükümlülükleri sona erdikten sonra yetkili yönetici tarafından silinmeleri gerekir. Silme talebinizi {contact} üzerinden iletebilirsiniz.",
      ],
    },
  ],
  terms: [
    {
      heading: "1. Kapsam",
      paragraphs: [`Bu site {legalName} tarafından işletilmektedir. Siteyi kullanmanız bu koşullara tabiidir.`],
    },
    {
      heading: "2. Hizmetlerin Tanıtımı",
      paragraphs: [
        "Sitedeki bilgiler genel bilgilendirme amaçlıdır. Hizmet kapsamı, süre ve ücret; taraflar arasında yapılacak yazılı teklif veya sözleşme ile kesinleşir.",
      ],
    },
    {
      heading: "3. Fikri Mülkiyet",
      paragraphs: [
        "Bize ait site tasarımı, metin ve yazılımlar fikri mülkiyet mevzuatıyla korunur. Üçüncü taraf markaları, görselleri ve lisanslı içerikler kendi hak sahiplerine aittir. Site içeriği izin veya yasal bir dayanak olmadan kopyalanamaz ya da dağıtılamaz.",
      ],
    },
    {
      heading: "4. Kullanıcı Yükümlülükleri",
      paragraphs: [
        "Formlarda doğru bilgi vermeyi; siteyi hukuka aykırı amaçlarla, işleyişi bozacak veya başkalarının haklarını ihlal edecek şekilde kullanmamayı kabul edersiniz.",
      ],
    },
    {
      heading: "5. Sorumluluk ve Üçüncü Taraflar",
      paragraphs: [
        "Sitedeki hizmet açıklamaları genel bilgilendirme niteliğindedir; kapsam, ücret, teslim ve fikri haklar taraflarca yazılı teklif/sözleşmeyle belirlenir. Sitenin kesintisiz veya hatasız çalışacağı garanti edilmez. Üçüncü taraf hizmetler kendi koşullarına tabidir. Bu koşullar tüketici mevzuatı dahil emredici yasal hakları ortadan kaldırmaz.",
      ],
    },
    {
      heading: "6. Değişiklikler",
      paragraphs: ["Bu koşullar güncellenebilir; güncel metin bu sayfada yayımlanır."],
    },
    {
      heading: "7. Uygulanacak Hukuk",
      paragraphs: ["Uygulanabilir olduğu ölçüde Türkiye Cumhuriyeti hukuku esas alınır. Tüketici işlemlerinde ve sınır ötesi işlemlerde emredici tüketici/kişisel veri hükümleri ile başvurulabilecek yetkili merciler saklıdır; bu madde kanunen sahip olduğunuz başvuru haklarını sınırlamaz."],
    },
  ],
  privacy: [
    {
      heading: "1. Giriş",
      paragraphs: [`{legalName} olarak gizliliğinize önem veriyoruz. Bu politika toplanan verileri, kullanım amaçlarını ve saklama yaklaşımını açıklar.`],
    },
    {
      heading: "2. Form Bilgileri",
      paragraphs: [
        "Teklif formunda ad soyad, e-posta, isteğe bağlı telefon, seçilen hizmet, proje büyüklüğü ve mesaj; iletişim formunda ad soyad, e-posta, konu ve mesaj kaydedilir. Form kötüye kullanımını sınırlamak için başvuruyla ilişkilendirilen takma adlı teknik bir özet tutulabilir. Form içeriği ziyaret analitiğine eklenmez. Bildirim e-postası etkinse ilgili form içeriği bildirim e-posta hizmetine iletilir.",
      ],
    },
    {
      heading: "3. Yerel Tercihler",
      paragraphs: [
        "Tema tercihi tarayıcınızda saklanır. Analitik tercihi 180 gün hatırlanır ve yalnızca sunucunun okuyabildiği, siteler arası izleme yapmayan bir çerezle korunur. Yönetici oturumu için sadece yönetim alanında kullanılan, en fazla 8 saatlik bir oturum çerezi bulunur. Bu çerezler reklam amacı taşımaz; üçüncü taraf reklam/analitik çerezleri kullanılmaz.",
      ],
    },
    {
      heading: "4. İsteğe Bağlı Ziyaret Analitiği",
      paragraphs: [
        "Analitik izni verirseniz ziyaret edilen sayfa yolu (sorgu parametreleri olmadan), yönlendiren sitenin yalnızca alan adı, genel cihaz/tarayıcı kategorisi ve zaman kaydedilir. Ham IP adresi, ayrıntılı tarayıcı bilgileri, form içeriği ve sorgu parametreleri analitik kaydına eklenmez. Reddetmeniz halinde sayfa görüntüleme kaydı oluşturulmaz. Tercihinizi sayfa altındaki gizlilik tercihleri düğmesinden değiştirebilir veya geri çekebilirsiniz.",
      ],
    },
    {
      heading: "5. Güvenlik Kayıtları ve Kimlik Özeti",
      paragraphs: [
        "Başarılı/başarısız yönetici girişleri ve hız sınırı olayları güvenlik amacıyla analitik izninden bağımsız kaydedilebilir. Ham IP adresi ve ayrıntılı tarayıcı bilgileri saklanmaz; IP'den aylık değişen takma adlı bir kaynak özeti üretilir. Teklif ve iletişim formlarında da kötüye kullanımı sınırlamak için başvuruyla ilişkilendirilen takma adlı teknik bir özet tutulabilir. Bu özetler doğrudan ad veya e-posta içermez ancak anonim veri olarak kabul edilmemelidir. Güvenlik olayları 30 gün sonra otomatik silinir.",
      ],
    },
    {
      heading: "6. Saklama ve Silme",
      paragraphs: [
        "Ziyaret analitiği ve güvenlik olayları 30 günlük otomatik silme süresine tabidir; silme işlemi teknik nedenlerle kısa süre gecikebilir. Teklif ve iletişim kayıtları şu anda otomatik olarak sona ermez; yetkili yönetici tarafından silinene kadar veritabanında kalır ve bildirim etkinse e-posta kutularında da kopyaları bulunabilir. Talep sonuçlandırıldığında ve yasal saklama ihtiyacı sona erdiğinde silinmeleri gerekir. Silme talebinizi {contact} üzerinden iletebilirsiniz.",
      ],
    },
    {
      heading: "7. Veri Güvenliği ve Sağlayıcılar",
      paragraphs: [
        "Verilerin korunması için uygun teknik ve idari önlemler uygulanır; internet üzerinden hiçbir aktarım veya depolama yöntemi mutlak güvenlik garantisi vermez. Barındırma, veritabanı, e-posta bildirimi ve görsel depolama hizmeti sunan iş ortakları gerekli verileri işleyebilir. Bazı sağlayıcılar Türkiye dışında bulunabilir; yurt dışına aktarım yalnızca uygulanabilir mevzuattaki şart ve güvencelerle yapılır. Güncel sağlayıcı bilgileri talep üzerine paylaşılır.",
      ],
    },
    {
      heading: "8. Veri koruma hakları",
      paragraphs: [
        "KVKK kapsamındaki haklarınıza ek olarak, GDPR veya başka bir ülkenin veri koruma mevzuatı size uygulanıyorsa erişim, düzeltme, silme, işlemeyi kısıtlama, veri taşınabilirliği, itiraz, rızayı geri çekme ve yetkili denetim makamına şikâyet hakları da doğabilir. Haklar, uygulanabilir mevzuat ve istisnalar çerçevesinde değerlendirilir.",
      ],
    },
    {
      heading: "9. İletişim",
      paragraphs: [`Gizlilikle ilgili sorularınız için {contact} üzerinden bize ulaşabilirsiniz.`],
    },
  ],
};

const en: LegalDocs = {
  kvkk: [
    {
      heading: "1. Data Controller",
      paragraphs: [`Under Turkish Personal Data Protection Law No. 6698 ("KVKK"), {legalName} is the data controller. Contact address: {address}. You can submit KVKK requests via {contact}.`],
    },
    {
      heading: "2. Personal Data Processed",
      paragraphs: [
        "The quote form collects name, email, optional phone number, selected services, project size and message; the contact form collects name, email, subject and message. A pseudonymous technical value may be associated with a request to limit abuse. If you opt into analytics, we record the page visited, referring domain, general device/browser category, time and a pseudonymous source value that does not contain the raw IP address.",
      ],
    },
    {
      heading: "3. Purposes",
      paragraphs: [
        "Data is processed to respond to quote and contact requests, conduct pre-contract discussions, prevent abuse and security incidents, produce aggregate site statistics only when you opt in, and meet legal obligations. It is not used to send marketing messages.",
      ],
    },
    {
      heading: "4. Legal Grounds",
      paragraphs: [
        "Form data may be processed to take steps you request before entering a contract and, where applicable, to meet legal obligations or pursue a legitimate interest balanced against your rights. Optional visit analytics is based on explicit consent. The form notice acknowledgment is not consent to analytics or marketing. Declining analytics does not prevent use of the site or forms.",
      ],
    },
    {
      heading: "5. Transfers",
      paragraphs: [
        "Data may be shared, as necessary, with website hosting, database, email-notification and image-storage providers and legally authorized institutions. Some providers may be located outside Türkiye. International transfers are made only when the requirements and safeguards of KVKK Article 9 and other applicable laws are met. Current provider and transfer information is available upon request.",
      ],
    },
    {
      heading: "6. Collection Method",
      paragraphs: ["Data is collected electronically through website forms, security records and browser page-view notifications only after analytics consent."],
    },
    {
      heading: "7. Your Rights",
      paragraphs: ["Under Article 11 of KVKK, you may learn whether your personal data is processed, request information and a copy, request correction and, where statutory conditions are met, deletion or destruction, learn about recipients, seek compensation for unlawful processing and exercise other rights under the law. Where GDPR or another data-protection law applies, additional rights may include access, rectification, erasure, restriction, portability, objection, withdrawal of consent and lodging a complaint with a supervisory authority."],
    },
    {
      heading: "8. Requests and response time",
      paragraphs: [`Submit a request with information sufficient to verify your identity via {contact}. Requests are handled under KVKK and applicable procedures; valid requests are answered within 30 days under KVKK. Additional identity verification may be requested where appropriate.`],
    },
    {
      heading: "9. Retention",
      paragraphs: ["Visit analytics and administrator-login security events are automatically deleted after 30 days; deletion may be delayed briefly for technical reasons. Quote and contact records do not currently expire automatically; after a request is resolved and any legal retention need ends, an authorized administrator must delete them. You may request deletion via {contact}."],
    },
  ],
  terms: [
    {
      heading: "1. Scope",
      paragraphs: [`This website is operated by {legalName}. Use of the site is subject to these terms.`],
    },
    {
      heading: "2. Service Information",
      paragraphs: ["Information on the site is general. Service scope, timeline and price are finalized in a written quote or agreement between the parties."],
    },
    {
      heading: "3. Intellectual Property",
      paragraphs: ["Our site design, text and software are protected by intellectual-property laws. Third-party brands, images and licensed content remain the property of their respective rights holders. Site content may not be copied or distributed without permission or another lawful basis."],
    },
    {
      heading: "4. User Obligations",
      paragraphs: ["You agree to provide accurate information and not use the site unlawfully, disrupt its operation or infringe the rights of others."],
    },
    {
      heading: "5. Liability and Third Parties",
      paragraphs: ["Service descriptions are general information; project scope, price, delivery and intellectual-property terms are finalized in a written quote or agreement. Uninterrupted or error-free website operation is not guaranteed. Third-party services are subject to their providers' terms. Nothing in these terms excludes mandatory legal rights, including consumer rights."],
    },
    {
      heading: "6. Changes",
      paragraphs: ["These terms may be updated; the current version is published on this page."],
    },
    {
      heading: "7. Governing Law",
      paragraphs: ["The laws of the Republic of Türkiye apply where permitted. Mandatory consumer and data-protection rules and any competent authorities available for cross-border transactions remain unaffected. This clause does not restrict rights or remedies that cannot lawfully be waived."],
    },
  ],
  privacy: [
    {
      heading: "1. Introduction",
      paragraphs: [`At {legalName}, we value your privacy. This policy explains the data collected, its purposes and retention.`],
    },
    {
      heading: "2. Form Information",
      paragraphs: ["The quote form collects name, email, optional phone, selected services, project size and message; the contact form collects name, email, subject and message. A pseudonymous technical value may be associated with a request to limit abuse. Form content is not included in visit analytics. If email notifications are enabled, relevant form content is also sent to the configured email-notification provider and mailbox."],
    },
    {
      heading: "3. Local Preferences",
      paragraphs: ["Your theme preference is stored in your browser. Your analytics choice is remembered for 180 days using a first-party preference cookie that is not used for cross-site tracking. An essential session cookie is used only for administration for up to 8 hours. These cookies are not used for advertising; no third-party advertising or analytics cookies are used."],
    },
    {
      heading: "4. Optional Visit Analytics",
      paragraphs: ["If you opt in, we record the page path without query parameters, the referring site's domain only, general device/browser categories and time. Raw IP addresses, detailed browser information, form content and query parameters are not included in analytics records. If you decline, no page-view record is created. You may change or withdraw your choice through the privacy-preferences control at the bottom of the page."],
    },
    {
      heading: "5. Security Logs and Pseudonymous Key",
      paragraphs: ["Successful/failed administrator logins and rate-limit events may be recorded for security independently of analytics consent. Raw IP addresses and detailed browser information are not stored; a monthly rotating pseudonymous source value is derived from the IP. A pseudonymous technical value may also be associated with form submissions to limit abuse. These values do not directly contain a name or email and should not be treated as anonymous data. Security events are automatically deleted after 30 days."],
    },
    {
      heading: "6. Retention and Deletion",
      paragraphs: ["Visit analytics and administrator-login security events are automatically deleted after 30 days; deletion may be delayed briefly for technical reasons. Quote and contact records do not currently expire automatically; they remain in the database until deleted by an authorized administrator and may also remain in configured notification mailboxes. They should be deleted after the request is resolved and any legal retention need ends. Request deletion via {contact}."],
    },
    {
      heading: "7. Security and Providers",
      paragraphs: ["Appropriate technical and organizational safeguards are used, but no internet transmission or storage method can be guaranteed absolutely secure. Hosting, database, email-notification and image-storage providers may process data needed to deliver the service. Some providers may be located outside Türkiye; international transfers are made only under applicable legal requirements and safeguards. Current provider information is available upon request."],
    },
    {
      heading: "8. Data protection rights",
      paragraphs: ["In addition to KVKK rights, if the GDPR or another country's data-protection law applies to you, you may have rights to access, rectification, erasure, restriction, portability, objection, withdrawal of consent and complaint to a competent supervisory authority. Requests are assessed under the applicable law and its exceptions."],
    },
    {
      heading: "9. Contact",
      paragraphs: [`For privacy questions, contact us via {contact}.`],
    },
  ],
};

export const legalDocs: Record<Locale, LegalDocs> = { tr, en, de: en, fr: en, ar: en };