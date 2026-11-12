import { SERVICES } from '../data/content';
import ServiceCard from '../components/ServiceCard';
import CtaBand from '../components/CtaBand';
import { useI18n } from '../i18n';
import PageHero from '../components/PageHero';

export default function Services() {
  const { t } = useI18n();
  const s = t.services;
  return (
    <>
      <PageHero eyebrow={s.eyebrow} title={s.title} lead={s.lead} photo="services" />
      <section className="section">
        <div className="container grid grid--3">
          {SERVICES.map((svc) => <ServiceCard key={svc.id} service={svc} detailed />)}
        </div>
      </section>
      <CtaBand title={s.ctaTitle} text={s.ctaText} />
    </>
  );
}
