import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import type { Service } from '../data/content';
import { useI18n } from '../i18n';

export default function ServiceCard({ service, detailed = false }: { service: Service; detailed?: boolean }) {
  const { tx } = useI18n();
  const Icon = service.icon;
  return (
    <article className="card card--hover">
      <div className="icon-badge"><Icon size={26} /></div>
      <h3>{tx(service.title)}</h3>
      <p>{tx(service.summary)}</p>
      {detailed && (
        <ul className="feature-list">
          {tx(service.features).map((f) => (
            <li key={f}><Check size={16} /> {f}</li>
          ))}
        </ul>
      )}
      <div className="card__foot">
        <Link to={service.link} className="btn btn--outline btn--sm">
          {tx(service.linkLabel)} <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}
