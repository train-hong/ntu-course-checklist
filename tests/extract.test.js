
import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { extract } from '../scripts/extract.js';
import expectedCourses from './extraction.json' assert { type: 'json' };

describe('extract', () => {
  beforeEach(() => {
    const html = fs.readFileSync(path.resolve(__dirname, '../scripts/data/修課檢視表.html'), 'utf8');
    const dom = new JSDOM(html);
    global.document = dom.window.document;
  });

  it('should extract course data correctly from the HTML', () => {
    const extractedCourses = extract();
    expect(extractedCourses).toEqual(expectedCourses);
  });
});
