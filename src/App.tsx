import { useEffect, useState } from 'react'
import './App.css'
import InstallPrompt from './InstallPrompt'
import { loadPublicContent, subscribeToPublicContent } from './lib/contentCache'
import type { PublicProperty } from './lib/contentCache'

const fallbackBanners = [
  {
    image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1800&q=88',
    eyebrow: 'فرصة هذا الأسبوع',
    title: 'بيوت تليق بتفاصيل حياتك',
    copy: 'مجموعة مختارة من العقارات الحديثة في أفضل أحياء بغداد',
  },
  {
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=88',
    eyebrow: 'سكن فاخر',
    title: 'إطلالة تبدأ منها الحكاية',
    copy: 'شقق وفلل بمواصفات استثنائية وخيارات دفع مرنة',
  },
  {
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=88',
    eyebrow: 'اختيار موثوق',
    title: 'استثمر في المكان الصحيح',
    copy: 'عقارات موثقة ومراجعة بعناية قبل عرضها',
  },
]

const fallbackProperties: PublicProperty[] = [
  { id: 1, image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1100&q=85', type: 'للبيع', title: 'فيلا عصرية بحديقة خاصة', location: 'بغداد، حي اليرموك', price: '480,000,000 د.ع', beds: 5, baths: 4, area: 420, description: 'فيلا واسعة بتصميم عصري، تضم حديقة خاصة ومساحات داخلية مضيئة وتشطيبات عالية الجودة. تقع في شارع هادئ وقريب من الخدمات الأساسية.' },
  { id: 2, image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1100&q=85', type: 'للإيجار', title: 'شقة مفروشة بإطلالة مفتوحة', location: 'بغداد، الجادرية', price: '1,800,000 د.ع / شهر', beds: 3, baths: 2, area: 185, description: 'شقة مفروشة بالكامل بأثاث أنيق وإطلالة مفتوحة، مناسبة للعائلة وجاهزة للسكن الفوري مع خدمات وصيانة منتظمة.' },
  { id: 3, image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1100&q=85', type: 'للبيع', title: 'منزل هادئ بتصميم أنيق', location: 'بغداد، المنصور', price: '365,000,000 د.ع', beds: 4, baths: 3, area: 310, description: 'منزل عائلي بتوزيع عملي وغرف رحبة، يتميز بموقع قريب من المدارس والأسواق مع مساحة خارجية مناسبة للجلسات.' },
  { id: 4, image: 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1100&q=85', type: 'للإيجار', title: 'شقة حديثة جاهزة للسكن', location: 'بغداد، الكرادة', price: '1,250,000 د.ع / شهر', beds: 2, baths: 2, area: 140, description: 'شقة حديثة في بناية مخدومة، تحتوي على مطبخ مجهز وغرفة معيشة واسعة وموقف سيارة مخصص.' },
  { id: 5, image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1100&q=85', type: 'للبيع', title: 'دار سكنية بواجهة حديثة', location: 'بغداد، زيونة', price: '295,000,000 د.ع', beds: 4, baths: 3, area: 250, description: 'دار سكنية بتشطيب حديث وواجهة مميزة، تتضمن أربع غرف نوم ومساحة استقبال كبيرة مع قربها من الطرق الرئيسية.' },
  { id: 6, image: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1100&q=85', type: 'للإيجار', title: 'شقة راقية في مجمع سكني', location: 'بغداد، بوابة العراق', price: '1,500,000 د.ع / شهر', beds: 3, baths: 2, area: 170, description: 'شقة راقية داخل مجمع سكني آمن، مع مصعد ومولد وخدمات متكاملة، مناسبة للسكن العائلي طويل الأمد.' },
]

const fallbackWhatsappNumber = '9647742280870'

function normalizeWhatsappNumber(value: string) {
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  if (digits.startsWith('0')) digits = `964${digits.slice(1)}`
  return digits
}

function Icon({ name }: { name: 'pin' | 'bed' | 'bath' | 'area' | 'search' | 'whatsapp' }) {
  const paths = {
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    bed: <><path d="M3 19v-8m18 8v-5a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3v5m0-8V8a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3M3 17h18"/></>,
    bath: <><path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2Zm2 0V5a2 2 0 0 1 4 0"/><path d="M8 19v2m8-2v2"/></>,
    area: <><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    whatsapp: <><path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3.5 20.5l1.4-4.3A8.5 8.5 0 1 1 20.5 11.6Z"/><path d="M8.1 7.6c.3-.6.6-.6.9-.6h.4c.2 0 .4.1.5.5l.8 1.8c.1.3.1.5-.1.7l-.6.8c-.2.2-.2.4 0 .7.7 1.2 1.7 2.1 3 2.7.3.2.5.1.7-.1l.8-1c.2-.3.5-.3.7-.2l1.9.9c.3.2.5.3.5.5 0 .2-.1 1.2-.7 1.8-.6.7-1.5 1-2.5.8-1.2-.2-2.8-.8-4.7-2.5-2.2-2-3.5-4.4-3.6-5.7 0-.6.2-1.4.5-1.9.2-.2.3-.3.5-.3Z"/></>,
  }
  return <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>
}

function App() {
  const [banners, setBanners] = useState(fallbackBanners)
  const [properties, setProperties] = useState<PublicProperty[]>(fallbackProperties)
  const [whatsappNumber, setWhatsappNumber] = useState(fallbackWhatsappNumber)
  const [contentSource, setContentSource] = useState('fallback')
  const [activeBanner, setActiveBanner] = useState(0)
  const [selectedProperty, setSelectedProperty] = useState<PublicProperty | null>(null)

  const whatsappUrl = (message: string) => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`

  useEffect(() => {
    let cancelled = false
    const fallback = { properties: fallbackProperties, banners: fallbackBanners, whatsapp: fallbackWhatsappNumber, contentVersion: 0 }
    const applyContent = (data: typeof fallback, source: string) => {
      if (cancelled) return
      setContentSource(source)
      setProperties(data.properties)
      setBanners(data.banners)
      setActiveBanner(0)
      const normalizedPhone = normalizeWhatsappNumber(data.whatsapp)
      if (normalizedPhone) setWhatsappNumber(normalizedPhone)
    }

    const cached = loadPublicContent(fallback)
    applyContent(cached.data, cached.source)
    const unsubscribe = subscribeToPublicContent((data) => applyContent(data, 'realtime'), () => setContentSource('stale-cache'))

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = window.setInterval(() => {
      setActiveBanner((current) => (current + 1) % banners.length)
    }, 5000)
    return () => window.clearInterval(timer)
  }, [banners.length])

  useEffect(() => {
    if (!selectedProperty) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedProperty(null)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [selectedProperty])

  const openProperty = (property: PublicProperty) => {
    setSelectedProperty(property)
  }

  return (
    <div className="app" dir="rtl" data-content-source={contentSource}>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="القلعة عقارات الدورة - الرئيسية"><span className="brand-mark">ق</span><span>القلعة عقارات الدورة</span></a>
        <nav aria-label="التنقل الرئيسي">
          <a className="active" href="#properties">العقارات</a>
          <a href="#services">خدماتنا</a>
          <a href="#about">من نحن</a>
        </nav>
        <a className="contact-button" href={whatsappUrl('مرحبًا، أود التواصل مع القلعة عقارات الدورة')} target="_blank" rel="noreferrer" aria-label="تواصل معنا عبر واتساب"><Icon name="whatsapp"/><span>تواصل عبر واتساب</span></a>
      </header>

      <main id="top">
        <section className="banner-shell" aria-label="الإعلانات المميزة">
          <div className="banner-track" style={{ transform: `translateX(-${activeBanner * 100}%)` }}>
            {banners.map((banner) => (
              <article className="banner" key={banner.title}>
                <img src={banner.image} alt="" />
                <div className="banner-overlay" />
                <div className="banner-content">
                  <span>{banner.eyebrow}</span><h1>{banner.title}</h1><p>{banner.copy}</p><a href="#properties">استكشف العقارات</a>
                </div>
              </article>
            ))}
          </div>
          <div className="banner-dots" aria-label="اختيار الإعلان">
            {banners.map((banner, index) => (
              <button type="button" key={banner.title} className={index === activeBanner ? 'active' : ''} onClick={() => setActiveBanner(index)} aria-label={`عرض الإعلان ${index + 1}`} aria-current={index === activeBanner ? 'true' : undefined} />
            ))}
          </div>
        </section>

        <section className="properties-section" id="properties">
          <div className="section-heading"><div><span>مختاراتنا لك</span><h2>أحدث العقارات</h2></div><button type="button">عرض الكل <b aria-hidden="true">←</b></button></div>
          <div className="property-grid">
            {properties.map((property) => (
              <button className="property-card" key={property._id ?? property.id ?? property.title} type="button" onClick={() => openProperty(property)} aria-label={`عرض تفاصيل ${property.title}`}>
                <span className="property-image"><img src={property.image} alt={property.title} loading="lazy" /><span>{property.type}</span><i aria-hidden="true">↗</i></span>
                <span className="property-summary"><small><Icon name="pin" />{property.location}</small><strong>{property.title}</strong><b>{property.price}</b></span>
              </button>
            ))}
          </div>
        </section>
      </main>

      {selectedProperty && (
        <div className="property-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedProperty(null) }}>
          <section className="property-modal" role="dialog" aria-modal="true" aria-labelledby="property-dialog-title">
            <button className="modal-close" type="button" onClick={() => setSelectedProperty(null)} aria-label="إغلاق التفاصيل">×</button>
            <div className="modal-image"><img src={selectedProperty.image} alt={selectedProperty.title} /><span>{selectedProperty.type}</span></div>
            <div className="modal-content">
              <p className="location"><Icon name="pin" />{selectedProperty.location}</p>
              <div className="modal-title-row"><h2 id="property-dialog-title">{selectedProperty.title}</h2><strong>{selectedProperty.price}</strong></div>
              <div className="modal-features"><span><Icon name="bed" />{selectedProperty.beds} غرف نوم</span><span><Icon name="bath" />{selectedProperty.baths} حمامات</span><span><Icon name="area" />{selectedProperty.area} م²</span></div>
              <p className="modal-description">{selectedProperty.description}</p>
              <a className="whatsapp-button" href={whatsappUrl(`مرحبًا، أود الاستفسار عن العقار: ${selectedProperty.title}`)} target="_blank" rel="noreferrer"><Icon name="whatsapp"/> استفسار عبر واتساب</a>
            </div>
          </section>
        </div>
      )}

      <footer><div className="brand footer-brand"><span className="brand-mark">ق</span><span>القلعة عقارات الدورة</span></div><p>مساحتك الموثوقة للوصول إلى العقار المناسب.</p><small>© 2026 القلعة عقارات الدورة</small></footer>
      <InstallPrompt />
    </div>
  )
}

export default App
