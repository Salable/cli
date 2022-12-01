import * as ejs from 'ejs';
import { TemplateData } from 'src/types';

export const render = (content: string, data: TemplateData) => {
  return ejs.render(content, data);
};
