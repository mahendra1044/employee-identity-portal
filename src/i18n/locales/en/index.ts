/**
 * English Locale (en)
 * ===================
 * 
 * Default language - source of truth for all translations.
 * 
 * @module i18n/locales/en
 */

import common from './common.json';
import header from './header.json';
import search from './search.json';
import snow from './snow.json';
import settings from './settings.json';
import educate from './educate.json';
import errors from './errors.json';
import pagination from './pagination.json';
import systemCards from './system-cards.json';
import failures from './failures.json';
import quickActions from './quick-actions.json';
import dataViewer from './data-viewer.json';
import jsonViewer from './json-viewer.json';
import roleSwitcher from './role-switcher.json';
import accessibility from './accessibility.json';
import languageSwitcher from './language-switcher.json';
import login from './login.json';

import type { TranslationObject } from '../../types';

const en: TranslationObject = {
  common,
  header,
  search,
  snow,
  settings,
  educate,
  errors,
  pagination,
  systemCards,
  failures,
  quickActions,
  dataViewer,
  jsonViewer,
  roleSwitcher,
  accessibility,
  languageSwitcher,
  login,
};

export default en;
