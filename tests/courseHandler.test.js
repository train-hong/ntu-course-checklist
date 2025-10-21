import { describe, it, expect } from 'vitest';
import { 
  arrangeCourses, 
  fulfillGeneralRequirements, 
  addCourseRemarks,
  COLLEGE_PREFIXES,
  TOTAL_SEL_CREDITS,
  DEPT_REQ_CREDITS,
  DEPT_SEL_CREDITS,
  COLLEGE_SEL_CREDITS,
  GEN_SEL_CREDITS,
  GEN_CREDITS,
  GEN_SCOPE_NUM,
  GEN_SCOPES
} from '../scripts/courseHandler.js';
import rawCourses from './extraction.json' assert { type: 'json' };
import baoBaoRawCourses from './baobao_extraction.json' assert { type: 'json' };

describe('arrangeCourses', () => {
  // it('should move extra 國文 exceed 3 to 通識 with scopes [1,2,3,4]', () => {

  //   const result = arrangeCourses(rawCourses);

  //   expect(result.共同必修.filter(c => c.category === '國文').reduce((acc, c) => acc + c.credit, 0)).toBe(3);
  //   expect(result.通識.filter(c => c.category === '國文').reduce((acc, c) => acc + c.credit, 0)).toBeGreaterThanOrEqual(0);
  // });

  // it('should move 基本能力 to 通識 if 通識 still need credits and 基本能力 in 通識 less than 6, else 一般選修', () => {
    
  //   const result = arrangeCourses(baoBaoRawCourses);

  //   expect(result.通識.reduce((acc, c) => acc + c.credit, 0)).toBeLessThanOrEqual(15);
  //   console.log(`total credits of 通識: ${result.通識.reduce((acc, c) => acc + c.credit, 0)}`);
  //   expect(result.通識.filter(c => c.category === '基本能力').reduce((acc, c) => acc + c.credit, 0)).toBeLessThanOrEqual(6);
  //   console.log(`credits of 基本能力 in 通識: ${result.通識.filter(c => c.category === '基本能力').reduce((acc, c) => acc + c.credit, 0)}`);
  //   console.log(`credits of 基本能力 in 一般選修: ${result.一般選修.filter(c => c.category === '基本能力').reduce((acc, c) => acc + c.credit, 0)}`);
  //   expect(result.一般選修.filter(c => c.category === '基本能力').reduce((acc, c) => acc + c.credit, 0)).toBeGreaterThanOrEqual(0);
  // });

  // it('should classify 指定選修 to 系選修, and 一般選修 to 一般選修 or 院選修 if course code prefix in COLLEGE_PREFIXES', () => {
    
  //   const result = arrangeCourses(rawCourses);

  //   console.log(`院選修: ${result.院選修.map(c => c.name).join(", ")}`);
  //   expect(result.院選修.every(course => COLLEGE_PREFIXES.some(prefix => course.code.startsWith(prefix)))).toBe(true);
  // });

  it('should has correct total credits in each category', () => {
    
    const result = arrangeCourses(rawCourses);

    console.log(`credits of 通識: ${result.通識.reduce((acc, c) => acc + c.credit, 0)}`);
    console.log(`通識: ${result.通識.map(c => c.name).join(", ")}`);
    console.log(`credits of 系訂必修: ${result.系訂必修.reduce((acc, c) => acc + c.credit, 0)}`);
    console.log(`系訂必修: ${result.系訂必修.map(c => c.name).join(", ")}`);
    console.log(`credits of 系選修: ${result.系選修.reduce((acc, c) => acc + c.credit, 0)}`);
    console.log(`系選修: ${result.系選修.map(c => c.name).join(", ")}`);
    console.log(`系選修: ${result.系選修.map(c => c.credit).join(", ")}`);
    console.log(`credits of 院選修: ${result.院選修.reduce((acc, c) => acc + c.credit, 0)}`);
    console.log(`院選修: ${result.院選修.map(c => c.name).join(", ")}`);
    console.log(`credits of 一般選修: ${result.一般選修.reduce((acc, c) => acc + c.credit, 0)}`);
    console.log(`一般選修: ${result.一般選修.map(c => c.name).join(", ")}`);
    console.log(`一般選修: ${result.一般選修.map(c => c.credit).join(", ")}`);
    expect(result.通識.reduce((acc, c) => acc + c.credit, 0)).toBeGreaterThanOrEqual(GEN_CREDITS);
    expect(result.系訂必修.reduce((acc, c) => acc + c.credit, 0)).toBeGreaterThanOrEqual(DEPT_REQ_CREDITS);
    expect(result.系選修.reduce((acc, c) => acc + c.credit, 0)).toBeGreaterThanOrEqual(DEPT_SEL_CREDITS);
    expect(result.院選修.reduce((acc, c) => acc + c.credit, 0)).toBeGreaterThanOrEqual(COLLEGE_SEL_CREDITS);
    expect(result.一般選修.reduce((acc, c) => acc + c.credit, 0)).toBeGreaterThanOrEqual(GEN_SEL_CREDITS);
  });
});

// describe('fulfillGeneralRequirements', () => {
//   it('should return true if scopes fulfilled', () => {
//     const generalCourses = [
//       { "name": "歐盟莫內講座--經濟貨幣整合：歐盟理論與實證", "credit": 3, "semester": "112/1", "code": "NtlDev 1099", "star": false, "scopes": [2, 5] },
//       { "name": "探索臺灣:臺灣電影與臺灣社會", "credit": 2, "semester": "111/2", "code": "LibEdu 1050", "star": false, "scopes": [5] },
//       { "name": "統計Let's GO", "credit": 3, "semester": "112/2", "code": "IMPS 1002", "star": false, "scopes": [6] },
//       { "name": "毒道之處～看不見的危機!", "credit": 2, "semester": "111/2", "code": "Tox 5009", "star": false, "scopes": [7, 8] },
//       { "name": "幸福與人生", "credit": 3, "semester": "111/2", "code": "Psy 1012", "star": false, "scopes": [8] },
//       { "name": "農村生活臺語會話", "credit": 2, "semester": "112/1", "code": "MSPM 5026", "star": false, "scopes": [8] },
//     ];

//     const result = fulfillGeneralRequirements(generalCourses);

//     expect(result.fulfil).toBe(true);
//   });
// });

describe('addCourseRemarks', () => {
    it('should return empty remarks when all requirements are fulfilled', () => {
      const courses = {
        系訂必修: [
          { name: '微積分1' }, { name: '微積分2' }, { name: '微積分3' }, { name: '微積分4' },
          { name: '資料結構與演算法' }, { name: '線性代數' }, { name: '機率' },
          { name: '演算法設計與分析' }, { name: '系統程式設計' }, { name: '人工智慧導論' },
          { name: '作業系統' }, { name: '專題研究' }, { name: '計算機網路' },
          { name: '自動機與形式語言' }, { name: '計算機結構' }, { name: '計算機程式設計' },
          { name: '計算機網路實驗' }
        ],
        通識: []
      };
      const remarks = addCourseRemarks({}, courses, []);
      expect(remarks.系訂必修).toBe('');
      expect(remarks.通識).toBe('');
    });

    it('should generate remarks for missing required courses, including the experiment', () => {
      const courses = {
        系訂必修: [
          { name: '微積分1' },
        ],
        通識: []
      };
      const remarks = addCourseRemarks({}, courses, []);
      expect(remarks.系訂必修).toContain('微積分2');
      expect(remarks.系訂必修).toContain('資料結構與演算法');
      expect(remarks.系訂必修).toContain('計算機網路實驗/計算機系統實驗');
    });

    it('should generate remarks for missing experiment course only', () => {
        const courses = {
          系訂必修: [
            { name: '微積分1' }, { name: '微積分2' }, { name: '微積分3' }, { name: '微積分4' },
            { name: '資料結構與演算法' }, { name: '線性代數' }, { name: '機率' },
            { name: '演算法設計與分析' }, { name: '系統程式設計' }, { name: '人工智慧導論' },
            { name: '作業系統' }, { name: '專題研究' }, { name: '計算機網路' },
            { name: '自動機與形式語言' }, { name: '計算機結構' }, { name: '計算機程式設計' },
          ],
          通識: []
        };
        const remarks = addCourseRemarks({}, courses, []);
        expect(remarks.系訂必修).toBe('系訂必修尚未修習：計算機網路實驗/計算機系統實驗（擇一修習）');
      });

    it('should generate remarks for missing general education scopes', () => {
      const courses = {
        系訂必修: [],
        通識: []
      };
      const remarks = addCourseRemarks({}, courses, [1, 5, 8]);
      expect(remarks.通識).toBe('通識領域尚未修習：A1、A5、A8，以上領域需各至少修習一門');
    });

    it('should handle empty courses object', () => {
        const courses = {
            系訂必修: [],
            通識: []
        };
        const remarks = addCourseRemarks({}, courses, []);
        expect(remarks.系訂必修).not.toBe('');
        expect(remarks.通識).toBe('');
    });
  });
