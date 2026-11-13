/**
 * Business-wide settings.
 *
 * SOCIAL: links behind the footer's Facebook and TikTok icons.
 * TODO: replace with PoultryPath's own pages, e.g.
 *   facebook: 'https://www.facebook.com/YourPageName'
 *   tiktok:   'https://www.tiktok.com/@yourhandle'
 * Set a value to '' to hide that icon.
 */
/** Business phone, also used for WhatsApp. Change all three together. */
export const PHONE = {
  display: '+237 6 99 13 36 54',
  tel: 'tel:+237699133654',
  /** wa.me wants the number in international format with no +, spaces or dashes. */
  whatsapp: '237699133654',
};

/** WhatsApp chat link, optionally with a message already typed for the visitor. */
export const whatsappUrl = (text?: string) =>
  `https://wa.me/${PHONE.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export const SOCIAL = {
  facebook: 'https://www.facebook.com/',
  tiktok: 'https://www.tiktok.com/',
};
