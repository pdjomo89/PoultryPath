import { Link } from 'react-router-dom';
import credits from '../data/photo-credits.json';
import { useI18n } from '../i18n';

export type PhotoKey = 'home' | 'services' | 'start' | 'calculator' | 'training' | 'jobs' | 'contact' | 'notfound';

export const PHOTO_CREDITS = credits as {
  key: PhotoKey;
  title: string;
  author: string;
  license: string;
  licenseUrl: string;
  source: string;
}[];

/**
 * How each photo sits in a wide hero. The text covers the left side, so photos
 * whose subject stands on the left are mirrored to bring them into view, and
 * `y` keeps faces in frame when the photo is cropped top and bottom.
 */
const FRAMING: Record<PhotoKey, { mirror?: boolean; y?: string }> = {
  home: { mirror: true, y: '40%' },
  services: { mirror: true, y: '45%' },
  start: { mirror: true, y: '30%' },
  calculator: {},
  training: { y: '30%' },
  jobs: { y: '40%' },
  contact: { mirror: true, y: '22%' },
  notfound: { y: '60%' },
};

/** Whether a photo is shown mirrored (credited as a modification on the credits page). */
export const isMirrored = (key: PhotoKey) => !!FRAMING[key].mirror;

/**
 * Full-bleed hero background photo from public/images/hero, served as WebP
 * (720/1200/1600px) with a JPEG fallback. Place it as the first child of a
 * `.hero-bg` section. The licences (CC BY-SA) require crediting the
 * photographer, so it adds a small caption linking to the photo-credits page.
 */
export default function HeroPhoto({ photo }: { photo: PhotoKey }) {
  const { t } = useI18n();
  const credit = PHOTO_CREDITS.find((c) => c.key === photo);
  const base = `/images/hero/${photo}`;
  const { mirror, y = '50%' } = FRAMING[photo];
  return (
    <>
      <picture className="hero-bg__media">
        <source type="image/webp" srcSet={`${base}-720.webp 720w, ${base}-1200.webp 1200w, ${base}-1600.webp 1600w`} sizes="100vw" />
        <img src={`${base}-1200.jpg`} alt={t.photos.alt[photo]} width={1600} height={1060} decoding="async" {...{ fetchpriority: 'high' }}
          style={{ objectPosition: `center ${y}`, transform: mirror ? 'scaleX(-1)' : undefined }} />
      </picture>
      {credit && (
        <Link className="hero-bg__credit" to="/credits">{t.photos.credit(credit.author, credit.license)}</Link>
      )}
    </>
  );
}
