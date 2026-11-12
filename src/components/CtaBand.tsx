import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';

export default function CtaBand({ title, text }: { title?: string; text?: string }) {
  const { t } = useI18n();
  return (
    <section className="section">
      <div className="container">
        <div className="cta-band">
          <div>
            <h2>{title ?? t.cta.title}</h2>
            <p>{text ?? t.cta.text}</p>
          </div>
          <Link to="/contact" className="btn btn--primary">{t.cta.button}</Link>
        </div>
      </div>
    </section>
  );
}
