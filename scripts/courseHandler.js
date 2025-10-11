/**
 * @typedef {import('./types.js').Course} Course
 * @typedef {import('./types.js').RawCourses} RawCourses
 * @typedef {import('./types.js').Courses} Courses
 * @typedef {import('./types.js').Credits} Credits
 * @typedef {import('./types.js').Credit} Credit
 * @typedef {import('./types.js').Remarks} Remarks
 */

export {}; // make this file an ES module so top-level consts are module-scoped

const TOTAL_SEL_CREDITS = 53       // 選修總學分
const DEPT_REQ_CREDITS = 51;  // 系訂必修學分
const DEPT_SEL_CREDITS = 21; // 系選修學分
const COLLEGE_SEL_CREDITS = 9;     // 院選修學分
const GEN_SEL_CREDITS = 23;    // 一般選修學分
const GEN_CREDITS = 15;                  // 通識學分
const GEN_SCOPE_NUM = 3;
const GEN_SCOPES = new Set([1, 2, 3, 5, 8]);
const REQ_COURSES = new Set([
  "微積分1",
  "微積分2",
  "微積分3",
  "微積分4",
  "資料結構與演算法",
  "線性代數",
  "機率",
  "演算法設計與分析",
  "系統程式設計",
  "人工智慧導論",
  "作業系統",
  "專題研究",
  "計算機網路",
  "自動機與形式語言",
  "計算機結構",
  "計算機程式設計"
]);
const COLLEGE_PREFIXES = new Set(["EE", "OE", "CommE", "EEE", "BEEI"]);

/**
 * Arrange courses into categories that fit graduation requirements of NTU CSIE.
 * @param {RawCourses} rawCourses - The raw courses data object.
 * @returns {Courses} courses - The arranged result.
*/
function arrangeCourses(rawCourses) {
  let courses = { 共同必修: [], 通識: [], 系訂必修: [], 系選修: [], 院選修: [], 一般選修: [] }; 
  
  courses.共同必修 = rawCourses.共同必修;
  courses.系訂必修 = rawCourses.系訂必修;
  courses.通識 = rawCourses.通識;
 
  // 4. if the credits of 國文 in 共同必修 exceed 3, move excess (at most 3) to 通識, with scope of 1, 2, 3, 4
  if (courses.共同必修.filter(c => c.category === "國文").sum(c => c.credit) > 3) {
    const idx = courses.共同必修.map(c => c.category).lastIndexOf("國文");
    let rearrangedChinese = courses.共同必修.splice(idx, 1)[0];
    rearrangedChinese.scope = [1, 2, 3, 4];
    courses.通識.push(rearrangedChinese);
  }
  
  // 5. 基本能力 -> classify to 通識 if 通識 still need credits and 基本能力 in 通識 less than 6, else 一般選修
  let movedBasicCredit = Math.min(
    6, 
    rawCourses.基本能力.sum(c => c.credit),
    GEN_CREDITS - courses.通識.sum(c => c.credit)
  );
  while (movedBasicCredit > 0) {
    const rearrangedBasic = courses.基本能力.splice(-1, 1)[0];
    rearrangedBasic.scope = [];
    
    if (rearrangedBasic.credit <= movedBasicCredit) {
      // move the whole course
      courses.通識.push(rearrangedBasic);
      movedBasicCredit -= rearrangedBasic.credit;
    } else {
      // split the course
      const movedSplitCourse = { ...rearrangedBasic, splitCredit: movedBasicCredit };
      const remainSplitCourse = { ...rearrangedBasic, splitCredit: rearrangedBasic.credit - movedBasicCredit };
      courses.通識.push(movedSplitCourse);
      courses.基本能力.push(remainSplitCourse);
      movedBasicCredit = 0;
    }
  }
  
  // 6. 指定選修與一般選修 -> classify 
  //  指定選修 to 系選修,
  //  一般選修 to 一般選修 or 院選修 if course code prefix in COLLEGE_PREFIXES
  for (const course of rawCourses.指定選修與一般選修) {
    if (course.category === "指定選修") {
      courses.系選修.push(course);
    } else if ([...COLLEGE_PREFIXES].some(prefix => course.code.startsWith(prefix))) {
      courses.院選修.push(course);
    } else {
      courses.一般選修.push(course);
    }
  }
  
  // 7. 不計學分 -> 系選修 if course name is 專題研究
  for (const course of rawCourses.不計學分) {
    if (course.name === "專題研究") {
      courses.系選修.push(course);
    }
  }
  
  // 1. If both 計算機系統實驗 and 計算機網路實驗 are taken, move 計算機網路實驗 to 系選修.
  if (courses.系訂必修.find(c => c.name == "計算機系統實驗") && courses.系訂必修.find(c => c.name == "計算機網路實驗")) {
    const idx = courses.系訂必修.map(c => c.name).lastIndexOf("計算機網路實驗");
    courses.系選修.push(courses.系訂必修.splice(idx, 1)[0]);
  }
  
  // 2. If multiple courses starting with "普通" are taken, move credits beyond 6 to 一般選修.
  while (courses.系訂必修.filter(c => c.name.startsWith("普通")).sum(c => c.credit) > 6) {
    const idx = courses.系訂必修.map(c => c.name).lastIndexOf(courses.系訂必修.find(c => c.name.startsWith("普通")));
    courses.系選修.push(courses.系訂必修.splice(idx, 1)[0]);
  }
  
  // 3. If 系選修 exceeds DEPT_SEL_CREDITS, move excess courses to 院選修.
  let movedDeptSelCredits = courses.系選修.sum(c => c.credit) - DEPT_SEL_CREDITS;
  while (movedDeptSelCredits > 0) {
    const rearrangedDeptSel = courses.系選修.pop();
    
    if (rearrangedDeptSel.credit <= movedDeptSelCredits) {
      courses.院選修.push(rearrangedDeptSel);
      movedDeptSelCredits -= rearrangedDeptSel.credit;
    } else {
      const splitDeptSel = { ...rearrangedDeptSel, credit: movedDeptSelCredits };
      const remainDeptSel = { ...rearrangedDeptSel, credit: rearrangedDeptSel.credit - movedDeptSelCredits };
      courses.院選修.push(splitDeptSel);
      courses.系選修.push(remainDeptSel);
      movedDeptSelCredits = 0;
    }
  }
  
  // 4. If 院選修 exceeds COLLEGE_SEL_CREDITS, move excess courses to 一般選修.
  let movedCollegeSelCredits = courses.院選修.sum(c => c.credit) - COLLEGE_SEL_CREDITS;
  while (movedCollegeSelCredits > 0) {
    const rearrangedCollegeSel = courses.院選修.pop();
    
    if (rearrangedCollegeSel.credit <= movedCollegeSelCredits) {
      courses.一般選修.push(rearrangedCollegeSel);
      movedCollegeSelCredits -= rearrangedCollegeSel.credit;
    } else {
      const splitCollegeSel = { ...rearrangedCollegeSel, credit: movedCollegeSelCredits };
      const remainCollegeSel = { ...rearrangedCollegeSel, credit: rearrangedCollegeSel.credit - movedCollegeSelCredits };
      courses.一般選修.push(splitCollegeSel);
      courses.院選修.push(remainCollegeSel);
      movedCollegeSelCredits = 0;
    }
  }
  
  return courses;
}

/**
 * @param {Courses} arrangedCourses
 * @returns {Credits} credits
 */
function computeRemainingCredits(arrangedCourses) {
  // return courses, number of credits to take
  let credits = {};
  let generalResults = fulfilGeneral(arrangedCourses.通識);
  
  for (const [category, courseList] of Object.entries(arrangedCourses)) {
    let takenCredits = courseList.reduce((sum, course) => sum + course.credit, 0);
    credits[category] = {
      ReqCredit: category === "通識" ? GEN_CREDITS :
                      category === "系訂必修" ? DEPT_REQ_CREDITS :
                      category === "系選修" ? DEPT_SEL_CREDITS :
                      category === "院選修" ? COLLEGE_SEL_CREDITS :
                      category === "一般選修" ? TOTAL_SEL_CREDITS : 0,
      TakenCredit: takenCredits,
      RemainingCredit: Math.max(0, courseList[0].credit - takenCredits),
    };
  }

  let generalRemarks = {
    Fulfil: generalResults.fulfil,
    NeedScope: generalResults.needScope
  };

  let reqRemarks = {
    MissingReq: arrangedCourses.系訂必修.filter(c => REQ_COURSES.has(c.name)).map(c => c.name),
    // need fix: MissingCommonReq: arrangedCourses.共同必修.filter(c => REQ_COURSES.has(c.name)).map(c => c.name)
  };

  // WARNING: beware of shallow copy
  credits.通識 = { ...credits.通識, ...generalRemarks };
  // WARNING: beware of shallow copy
  credits.系訂必修 = { ...credits.系訂必修, ...reqRemarks };
  return credits;
}

/**
 * @param {Credits} credits
 * @param {Courses} courses
 * @returns {Remarks} remarks
 */
function addCourseRemarks(credits, courses) {
  /** @type {Remarks} */
  let remarks = {
    系訂必修: "",
    generalNeedScope: []
  };

  // 系訂必修
    let reqCourseSet = new Set(REQ_COURSES);
    let haveExperiment = false; // 是否有修習計算機網路實驗/計算機系統實驗

    for (const reqCourse of courses.系訂必修) {
      if (reqCourse.name === "計算機網路實驗" || reqCourse.name === "計算機系統實驗") {
        haveExperiment = true;
      }
      
      reqCourseSet.delete(reqCourse.name)
    }
    
    if (reqCourseSet.size != 0 || !haveExperiment) {
      remarks.系訂必修 = "系訂必修尚未修習：";
    }

    if (reqCourseSet.size != 0) {
      for (missingCourse of reqCourseSet) {
        remarks.系訂必修 += missingCourse + "、";
      }

      remarks.系訂必修 = remarks.系訂必修.slice(0, -1);  // remove the redundant 、
      remarks.系訂必修[-1] = "\n";
    }

    if (!haveExperiment) {
      if (reqCourseSet.size != 0) {
      remarks.系訂必修 += "、計算機網路實驗/計算機系統實驗（擇一修習）";
      }
      else {
        remarks.系訂必修 += "計算機網路實驗/計算機系統實驗（擇一修習）";
      }
    }
    
  // 通識的Remark還沒處理
    
}

/**訂 * @param {GeneralCourse[]} generalCourses - 
 *  An object mapping course names to sets of scope number
 *  Example: { "math": new Set([1, 2]), "history": new Set([3, 5]) }
 * @returns {Object} result - The result object
 * @returns {boolean} result.fulfil - Whether it fulfill
 * @returns {number[]} result.needScope - Scopes still needed
 */
function fulfillGeneralRequirements(generalCourses) {
    
  const graph = {};
  for (const [course, scopes] of Object.entries(generalCourses)) {
    const eligible = [...scopes].filter(s => DESIGNATED_SCOPES.has(s));
    if (eligible.length > 0) {
      graph[course] = eligible;
    }
  }

  const matchR = {};

  function bpm(course, seen) {
    for (const scope of graph[course] || []) {
      if (seen.has(scope)) continue;
      seen.add(scope);

      if (!(scope in matchR) || bpm(matchR[scope], seen)) { 
        matchR[scope] = course;
        return true;
      }
    }
    return false;
  }

  let result = 0;
  for (const course of Object.keys(graph)) {
    if (bpm(course, new Set())) {
      result += 1;
    }
  }

  if (result >= 3) {
    return { fulfil: true, needScope: [] };
  } else {
    const matchedScopes = new Set(Object.keys(matchR).map(Number));
    const missing = [...DESIGNATED_SCOPES].filter(s => !matchedScopes.has(s));
    return { fulfil: false, needScope: missing };
  }
}

export { arrangeCourses, computeRemainingCredits, addCourseRemarks };