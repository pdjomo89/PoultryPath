import { AlertCircle } from 'lucide-react';
import { useI18n } from '../i18n';

/**
 * Spam trap: hidden from people (and screen readers) but bots fill it in.
 * The server silently discards any submission where it has a value.
 */
export function Honeypot() {
  const { t } = useI18n();
  return (
    <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
      <label>
        {t.common.honeypot}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="alert alert--error" role="alert">
      <AlertCircle size={20} style={{ flexShrink: 0 }} /> <span>{message}</span>
    </div>
  );
}
