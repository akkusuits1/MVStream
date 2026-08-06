import { useEffect } from 'react';

interface SeoMeta {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
}

const SITE_NAME = 'MVStream';
const BASE_URL = 'https://akkusuits1.github.io/MVStream';

function setMeta(property: string, content: string, attribute = 'property') {
  let el = document.querySelector(`meta[${attribute}="${property}"]`) as HTMLMetaElement;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attribute, property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function useSeoMeta({ title, description, image, url, type = 'website' }: SeoMeta) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`;
    document.title = fullTitle;

    setMeta('description', description, 'name');
    setMeta('og:title', fullTitle);
    setMeta('og:description', description);
    setMeta('og:type', type);
    if (image) setMeta('og:image', image);
    if (url) setMeta('og:url', `${BASE_URL}${url}`);

    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    if (image) setMeta('twitter:image', image);

    return () => {
      document.title = `${SITE_NAME} - Watch Movies & Series Online for Free`;
    };
  }, [title, description, image, url, type]);
}
