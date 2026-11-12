import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import PageHero from '../components/PageHero';

export default function NotFound() {
  const { t } = useI18n();
  return (
    <PageHero eyebrow="404" title={t.notFound.title} lead={t.notFound.lead} photo="notfound">
      <Link to="/" className="btn btn--primary">{t.notFound.back}</Link>
    </PageHero>
  );
}
