import { describe, it, expect } from 'vitest';
import { arrangeCourses } from '../scripts/courseHandler.js';
import rawCourses from './extraction.json' assert { type: 'json' };

describe('arrangeCourses', () => {
  it('should move extra 國文 to 通識 with scope [1,2,3,4]', () => {
    const result = arrangeCourses(rawCourses);
    expect(result.通識).toEqual(expect.arrayContaining([
      expect.objectContaining({
        category: '國文',
        scope: [1, 2, 3, 4]
      })
    ]));
  });
});
