import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Brand } from './Navbar';
import SocialIcons from './SocialIcons';
import { useI18n } from '../i18n';

export default function Footer() {
  const { t } = useI18n();
  const f = t.footer;
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <Brand size="footer" />
            <p style={{ marginTop: 16, maxWidth: 340, fontSize: '0.93rem' }}>{f.blurb}</p>
          </div>
          <div>
            <h4>{f.services}</h4>
            <ul className="footer__list">
              <li><Link to="/services">{f.startupConsulting}</Link></li>
              <li><Link to="/services">{f.farmManagement}</Link></li>
              <li><Link to="/training">{f.training}</Link></li>
              <li><Link to="/careers">{f.hiring}</Link></li>
            </ul>
          </div>
          <div>
            <h4>{f.tools}</h4>
            <ul className="footer__list">
              <li><Link to="/start-a-farm">{f.roadmap}</Link></li>
              <li><Link to="/calculator">{f.calculator}</Link></li>
              <li><Link to="/careers">{f.jobsBoard}</Link></li>
              <li><Link to="/news">{f.news}</Link></li>
              <li><Link to="/contact">{f.book}</Link></li>
            </ul>
          </div>
          <div>
            <h4>{f.contact}</h4>
            {/* Placeholder details — replace with real ones before launch. */}
            <ul className="footer__list footer__contact">
              <li><Phone size={16} /> +000 000 000 000</li>
              <li><Mail size={16} /> hello@poultrypath.example</li>
              <li><MapPin size={16} /> {f.address}</li>
            </ul>
            <h4 className="footer__follow">{f.follow}</h4>
            <SocialIcons />
          </div>
        </div>
        <div className="footer__bottom">
          <span>{f.rights(new Date().getFullYear())} · <Link to="/credits">{f.photoCredits}</Link></span>
          <span>{t.brand.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
