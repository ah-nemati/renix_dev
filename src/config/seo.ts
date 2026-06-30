/**
 * Central SEO configuration — update this file when you rebrand or change domains.
 * Imported by Layout.astro, JSON-LD schemas, and page-level SEO props.
 */

export const SITE = {
  name:        'Renix.dev',
  tagline:     'We Build Software That Ships',
  url:         'https://renix.dev',
  description: 'Renix.dev is a software development agency that specialises in web apps, AI integrations, and React Native mobile apps. We turn founder ideas into production-ready products.',
  keywords:    [
    'software development agency',
    'web development agency',
    'AI development agency',
    'React Native development',
    'SaaS development',
    'startup development agency',
    'full-stack development',
    'Next.js development',
    'mobile app development',
    'MVP development',
    'custom software development',
    'hire software developers',
  ],
  locale:      'en_US',
  language:    'en',
  email:       'hello@renix.dev',
  logo:        'https://renix.dev/favicon.svg',
  ogImage:     'https://renix.dev/og-image.png',
  ogImageAlt:  'Renix.dev — Software development agency for web, AI, and mobile',
  twitter:     '@renixdev',
  themeColor:  '#050810',
  founded:     '2022',

  socials: {
    twitter:  'https://twitter.com/renixdev',
    linkedin: 'https://linkedin.com/company/renixdev',
    github:   'https://github.com/renixdev',
  },

  address: {
    // Update with real address when ready
    type:    'PostalAddress' as const,
    country: 'US',
  },
} as const;

export type SiteMeta = {
  title?:       string;
  description?: string;
  keywords?:    string | readonly string[] | string[];
  ogImage?:     string;
  ogImageAlt?:  string;
  canonical?:   string;
  type?:        'website' | 'article';
  noindex?:     boolean;
  publishedAt?: string;
  modifiedAt?:  string;
};
