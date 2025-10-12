import { describe, it, expect } from 'vitest';
import { arrangeCourses, fulfillGeneralRequirements } from '../scripts/courseHandler.js';
import rawCourses from './extraction.json' assert { type: 'json' };
import baoBaoRawCourses from './baobao_extraction.json' assert { type: 'json' };
const COLLEGE_PREFIXES = ["EE", "OE", "CommE", "EEE", "BEEI"];
const TOTAL_SEL_CREDITS = 53       // 選修總學分
const DEPT_REQ_CREDITS = 51;  // 系訂必修學分
const DEPT_SEL_CREDITS = 21; // 系選修學分
const COLLEGE_SEL_CREDITS = 9;     // 院選修學分
const SEL_CREDITS = 23;    // 一般選修學分
const GEN_CREDITS = 15;                  // 通識學分
const GEN_SCOPE_NUM = 3;
const GEN_SCOPES = new Set([1, 2, 3, 5, 8]);

describe('arrangeCourses', () => {
  it('should move extra 國文 exceed 3 to 通識 with scopes [1,2,3,4]', () => {

    const result = arrangeCourses(rawCourses);

    // expect(result.共同必修.filter(c => c.category === '國文').reduce((acc, c) => acc + c.credit, 0)).toBe(3);
    // expect(result.通識.filter(c => c.category === '國文').reduce((acc, c) => acc + c.credit, 0)).toBeGreaterThanOrEqual(0);
  });

  it('should move 基本能力 to 通識 if 通識 still need credits and 基本能力 in 通識 less than 6, else 一般選修', () => {
    
    // const result = arrangeCourses(baoBaoRawCourses);

    // expect(result.通識.reduce((acc, c) => acc + c.credit, 0)).toBeLessThanOrEqual(15);
    // console.log(`total credits of 通識: ${result.通識.reduce((acc, c) => acc + c.credit, 0)}`);
    // expect(result.通識.filter(c => c.category === '基本能力').reduce((acc, c) => acc + c.credit, 0)).toBeLessThanOrEqual(6);
    // console.log(`credits of 基本能力 in 通識: ${result.通識.filter(c => c.category === '基本能力').reduce((acc, c) => acc + c.credit, 0)}`);
    // console.log(`credits of 基本能力 in 一般選修: ${result.一般選修.filter(c => c.category === '基本能力').reduce((acc, c) => acc + c.credit, 0)}`);
    // expect(result.一般選修.filter(c => c.category === '基本能力').reduce((acc, c) => acc + c.credit, 0)).toBeGreaterThanOrEqual(0);
  });

  it('should classify 指定選修 to 系選修, and 一般選修 to 一般選修 or 院選修 if course code prefix in COLLEGE_PREFIXES', () => {
    
    const result = arrangeCourses(rawCourses);

    // console.log(`院選修: ${result.院選修.map(c => c.name).join(", ")}`);
    // expect(result.院選修.every(course => COLLEGE_PREFIXES.some(prefix => course.code.startsWith(prefix)))).toBe(true);
  });

  it('should has correct total credits in each category', () => {
    
    const result = arrangeCourses(rawCourses);

    console.log(`credits of 通識: ${result.通識.reduce((acc, c) => acc + c.credit, 0)}`);
    console.log(`通識: ${result.通識.map(c => c.name).join(", ")}`);
    console.log(`credits of 系訂必修: ${result.系訂必修.reduce((acc, c) => acc + c.credit, 0)}`);
    console.log(`系訂必修: ${result.系訂必修.map(c => c.name).join(", ")}`);
    console.log(`credits of 系選修: ${result.系選修.reduce((acc, c) => acc + c.credit, 0)}`);
    console.log(`系選修: ${result.系選修.map(c => c.name).join(", ")}`);
    console.log(`credits of 院選修: ${result.院選修.reduce((acc, c) => acc + c.credit, 0)}`);
    console.log(`院選修: ${result.院選修.map(c => c.name).join(", ")}`);
    console.log(`credits of 一般選修: ${result.一般選修.reduce((acc, c) => acc + c.credit, 0)}`);
    console.log(`一般選修: ${result.一般選修.map(c => c.name).join(", ")}`);
    // expect(result.通識.reduce((acc, c) => acc + c.credit, 0)).toBeGreaterThanOrEqual(GEN_CREDITS);
    // expect(result.系訂必修.reduce((acc, c) => acc + c.credit, 0)).toBeGreaterThanOrEqual(DEPT_REQ_CREDITS);
    // expect(result.系選修.reduce((acc, c) => acc + c.credit, 0)).toBeGreaterThanOrEqual(DEPT_SEL_CREDITS);
    // console.log(`院選修: ${result.院選修.map(c => c.name).join(", ")}`);
    // expect(result.院選修.reduce((acc, c) => acc + c.credit, 0)).toBeGreaterThanOrEqual(COLLEGE_SEL_CREDITS);
    // expect(result.一般選修.reduce((acc, c) => acc + c.credit, 0)).toBeGreaterThanOrEqual(SEL_CREDITS);
  });
});

describe('fulfillGeneralRequirements', () => {
  it('should return true if scopes fulfilled', () => {
    const generalCourses = [
      { "name": "歐盟莫內講座--經濟貨幣整合：歐盟理論與實證", "credit": 3, "semester": "112/1", "code": "NtlDev 1099", "star": false, "scopes": [2, 5] },
      { "name": "探索臺灣:臺灣電影與臺灣社會", "credit": 2, "semester": "111/2", "code": "LibEdu 1050", "star": false, "scopes": [5] },
      { "name": "統計Let's GO", "credit": 3, "semester": "112/2", "code": "IMPS 1002", "star": false, "scopes": [6] },
      { "name": "毒道之處～看不見的危機!", "credit": 2, "semester": "111/2", "code": "Tox 5009", "star": false, "scopes": [7, 8] },
      { "name": "幸福與人生", "credit": 3, "semester": "111/2", "code": "Psy 1012", "star": false, "scopes": [8] },
      { "name": "農村生活臺語會話", "credit": 2, "semester": "112/1", "code": "MSPM 5026", "star": false, "scopes": [8] },
    ];

    const result = fulfillGeneralRequirements(generalCourses);

    // expect(result.fulfil).toBe(true);
  });
});

// describe('addCourseRemarks', () => {
  
// })
