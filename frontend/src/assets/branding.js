import logoImg from './logo.png';
import logoIconImg from './logo-icon.png';

export const BRAND_LOGO = logoImg;
export const BRAND_ICON = logoIconImg;
export const BRAND_LOGO_FALLBACK = '/logo.png?v=20261010_2';
export const BRAND_ICON_FALLBACK = '/logo-icon.png?v=20261010_2';

export const BRAND_NAME = 'DiziGini';
export const BRAND_DOMAIN = 'dizigini.com';
export const BRAND_PLATFORM_NAME = 'DizitalGini';

export default {
  name: BRAND_NAME,
  domain: BRAND_DOMAIN,
  platformName: BRAND_PLATFORM_NAME,
  logo: BRAND_LOGO,
  icon: BRAND_ICON,
  fallbackLogo: BRAND_LOGO_FALLBACK,
  fallbackIcon: BRAND_ICON_FALLBACK,
};
