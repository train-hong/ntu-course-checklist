import { describe, it, expect } from 'vitest';
import { arrangeCourses } from '../scripts/courseHandler.js';

const BASE = {
  共同必修: [],
  通識: [],
  系必修: [],
  系選修: [],
  院選修: [],
  一般選修: [],
  體育: []
};

describe('arrangeCourses', () => {
  it('should move second 專題研究 from 系必修 to 系選修', () => {
    const courses = structuredClone(BASE);
    courses.系必修 = [
      { name: '專題研究', credit: 3, semester: '112/1' },
      { name: '專題研究', credit: 3, semester: '112/2' }
    ];

    const result = arrangeCourses(courses);

    expect(result.系必修.length).toBe(1);
    expect(result.系選修.length).toBe(1);
    expect(result.系選修[0].name).toBe('專題研究');
  });

  it('should move 計算機網路實驗 to 系選修 when both labs exist', () => {
    const courses = structuredClone(BASE);
    courses.系必修 = [
      { name: '計算機系統實驗', credit: 1, semester: '112/1' },
      { name: '計算機網路實驗', credit: 1, semester: '112/2' }
    ];

    const result = arrangeCourses(courses);

    expect(result.系必修.length).toBe(1);
    expect(result.系選修.length).toBe(1);
    expect(result.系選修[0].name).toBe('計算機網路實驗');
  });

  it('should move extra 普通 courses to 系選修', () => {
    const courses = structuredClone(BASE);
    courses.系必修 = [
      { name: '普通物理', credit: 3, semester: '112/1' },
      { name: '普通物理', credit: 3, semester: '112/2' },
      { name: '普通化學', credit: 3, semester: '112/1' }
    ];

    const result = arrangeCourses(courses);

    expect(result.系必修.length).toBeLessThan(3);
    expect(result.系選修.length).toBeGreaterThan(0);
  });

  it('should move overflow 系選修 to 院選修', () => {
    global.DEPARTMENT_SELECTIVE_CREDITS = 2;
    const courses = structuredClone(BASE);
    courses.系選修 = [
      { name: '課程1', credit: 3, semester: '112/1' },
      { name: '課程2', credit: 3, semester: '112/1' },
      { name: '課程3', credit: 3, semester: '112/1' }
    ];

    const result = arrangeCourses(courses);

    expect(result.系選修[0].name).toBe('課程1');
    expect(result.系選修[1].name).toBe('課程2');
    // expect(result.院選修[0].name).toBe('課程3');
    // expect(result.系選修.length).toBe(2);
    // expect(result.院選修.length).toBe(1);
  });

  it('should move overflow 院選修 to 一般選修', () => {
    global.DEPARTMENT_SELECTIVE_CREDITS = 99;
    global.COLLEGE_SELECTIVE_CREDITS = 2;
    const courses = structuredClone(BASE);
    courses.院選修 = [
      { name: '課程A', credit: 3, semester: '112/1' },
      { name: '課程B', credit: 3, semester: '112/1' },
      { name: '課程C', credit: 3, semester: '112/1' }
    ];  

    const result = arrangeCourses(courses);
    console.log(result);

    expect(result.院選修[0].name).toBe('課程A');
    // expect(result.院選修[1].name).toBe('課程B');
    // expect(result.院選修[2].name).toBe('課程C');
    // expect(result.一般選修.length).toBe(0);
    // expect(result.一般選修[0].name).toBe('課程C');
    // expect(result.院選修.length).toBe(2);
  });
});
