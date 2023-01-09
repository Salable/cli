import * as ejs from 'ejs';
import { TemplateData } from '../types';

export const renderTemplate = (content: string, data: TemplateData) => {
  return ejs.render(content, data);
};
