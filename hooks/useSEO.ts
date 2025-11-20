import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
}

export function useSEO({ title, description, image, type = 'website' }: SEOProps) {
  useEffect(() => {
    // 1. Set Document Title
    document.title = `${title} | Phangan Serenity`;

    // 2. Helper to set meta tags
    const setMeta = (name: string, content: string, attribute = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 3. Helper for Link tags (Canonical)
    const setLink = (rel: string, href: string) => {
        let element = document.querySelector(`link[rel="${rel}"]`);
        if (!element) {
            element = document.createElement('link');
            element.setAttribute('rel', rel);
            document.head.appendChild(element);
        }
        element.setAttribute('href', href);
    };

    // 4. Update Standard Meta Tags
    setMeta('description', description);

    // 5. Update Open Graph (Facebook/WhatsApp/LINE)
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', type, 'property');
    
    // Set current URL as OG URL (important for sharing)
    setMeta('og:url', window.location.href, 'property');
    
    if (image) {
        setMeta('og:image', image, 'property');
    }

    // 6. Update Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    if (image) {
        setMeta('twitter:image', image);
    }

    // 7. Set Canonical URL (Prevents Duplicate Content penalties for ?params)
    // We usually want the canonical to be the clean URL without tracking params
    const canonicalUrl = window.location.href.split('?')[0];
    setLink('canonical', canonicalUrl);

  }, [title, description, image, type]);
}