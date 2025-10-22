/**
 * @typedef {import('./types.js').Course} Course
 * @typedef {import('./types.js').RawCourses} RawCourses
 * @typedef {import('./types.js').Courses} Courses
 * @typedef {import('./types.js').Credits} Credits
 * @typedef {import('./types.js').Credit} Credit
 * @typedef {import('./types.js').Remarks} Remarks
 */

// export {}; // make this file an ES module so top-level consts are module-scoped

export const TOTAL_SEL_CREDITS = 53       // 選修總學分
export const DEPT_REQ_CREDITS = 51;  // 系訂必修學分
export const DEPT_SEL_CREDITS = 21; // 系選修學分
export const COLLEGE_SEL_CREDITS = 9;     // 院選修學分
export const GEN_SEL_CREDITS = 23;    // 一般選修學分
export const GEN_CREDITS = 15;                  // 通識學分
export const GEN_SCOPE_NUM = 3;
export const GEN_SCOPES = new Set([1, 2, 3, 5, 8]);
export const REQ_COURSES = new Set([
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
export const COLLEGE_PREFIXES = ["EE", "OE", "CommE", "EEE", "BEEI"];

/**
 * Arrange courses into categories that fit graduation requirements of NTU CSIE.
 * @param {RawCourses} rawCourses - The raw courses data object.
 * @returns {Courses} courses - The arranged result.
*/
function arrangeCourses(rawCourses) {
  removeFailedAndWithdrawnCourses(rawCourses);
  // console.log(rawCourses.系訂必修.map(c => c.name));

  let courses = { 共同必修: [], 通識: [], 系訂必修: [], 系選修: [], 院選修: [], 一般選修: [] }; 
  courses.共同必修 = rawCourses.共同必修課程;
  courses.系訂必修 = rawCourses.系訂必修;
  courses.通識 = rawCourses.通識;

  // Add scopes and star to 通識
  for (const course of courses.通識) {
    const scopeMatches = course.category.match(/([1-8])/g);
    // console.log(`Course ${course.name} scopeMatches:`, scopeMatches);
    if (scopeMatches) {
      course.scopes = scopeMatches.map(s => parseInt(s));
      // console.log(`Course ${course.name} scopes:`, course.scopes);
    } else {
      course.scopes = [];
    }
    const starMatch = course.category.match(/\*/);
    course.star = starMatch ? true : false;
  }

  // 國文 -> 通識
  if (courses.共同必修.filter(c => c.category === "國文").reduce((acc, c) => acc + c.credit, 0) > 3) {
    const idx = courses.共同必修.map(c => c.category).lastIndexOf("國文");
    let rearrangedCN = courses.共同必修.splice(idx, 1)[0];
    rearrangedCN.scope = [1, 2, 3, 4];
    courses.通識.push(rearrangedCN);
  }

  // 基本能力 -> 通識/一般選修
  let genCredits = courses.通識.reduce((acc, c) => acc + c.credit, 0);
  let basicInGen = courses.通識.filter(c => c.category === "基本能力").reduce((acc, c) => acc + c.credit, 0);
  let movedBasicCredit = Math.min(Math.max(0, basicInGen - 6, genCredits - GEN_CREDITS), basicInGen);
  for (const course of courses.通識.filter(c => c.category === "基本能力")) {
    course.scopes = [];
    course.star = true;
  }
  moveOverflowCredits(movedBasicCredit, courses.通識.filter(c => c.category === "基本能力"), courses.一般選修);
  
  // 專題 -> 系選修
  for (const course of rawCourses.不計學分) {
    if (course.name === "專題研究") {
      courses.系選修.push(course);
    }
  }

  // 指定選修與一般選修 -> 系選修/一般選修/院選修
  for (const course of rawCourses.指定選修與一般選修) {
    if (course.category === "指定選修") {
      courses.系選修.push(course);
    } else if (COLLEGE_PREFIXES.some(prefix => course.code.startsWith(prefix))) {
      courses.院選修.push(course);
    } else {
      courses.一般選修.push(course);
    }  
  }  

  // 通識 -> 系選修
  for (const course of courses.通識) {
    if (course.code.startsWith("CSIE")) {
      courses.系選修.push(course);
      courses.通識.splice(courses.通識.indexOf(course), 1);
    }
  }  
  
  // 系訂必修 -> 系選修（溢出）
  if (courses.系訂必修.find(c => c.name == "計算機系統實驗") && courses.系訂必修.find(c => c.name == "計算機網路實驗")) {
    const idx = courses.系訂必修.map(c => c.name).lastIndexOf("計算機網路實驗");
    courses.系選修.push(courses.系訂必修.splice(idx, 1)[0]);
  }
  
  // 系訂必修 -> 一般選修（溢出）
  let movedGenSciCredits = courses.系訂必修.filter(c => c.name.startsWith("普通")).reduce((acc, c) => acc + c.credit, 0) - 6;
  if (movedGenSciCredits > 0) {
    moveOverflowCredits(courses.系訂必修.filter(c => c.name.startsWith("普通")), courses.一般選修, 6);
  }
  
  // 系選修 -> 院選修（溢出）
  moveOverflowCredits(courses.系選修.reduce((acc, c) => acc + c.credit, 0) - DEPT_SEL_CREDITS, courses.系選修, courses.院選修, DEPT_SEL_CREDITS);
  
  // 院選修 -> 一般選修（溢出）
  moveOverflowCredits(courses.院選修.reduce((acc, c) => acc + c.credit, 0) - COLLEGE_SEL_CREDITS, courses.院選修, courses.一般選修, COLLEGE_SEL_CREDITS);

  // 通識 -> 一般選修
  moveOverflowGenCredits(courses);

  // all 服務學習 in 系訂必修 -> 共同必修
  for (const course of courses.系訂必修.filter(c => c.name.includes("服務學習"))) {
    if (course.grade === "通過") {
      course.category = "服務";
      const idx = courses.系訂必修.indexOf(course);
      courses.共同必修.push(courses.系訂必修.splice(idx, 1)[0]);
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
  let generalResults = fulfillGeneralRequirements(arrangedCourses.通識);
  
  for (const [category, courseList] of Object.entries(arrangedCourses)) {
    let takenCredits = courseList.reduce((acc, course) => acc + course.credit, 0);
    const requiredCredit = category === "通識" ? GEN_CREDITS :
                      category === "系訂必修" ? DEPT_REQ_CREDITS :
                      category === "系選修" ? DEPT_SEL_CREDITS :
                      category === "院選修" ? COLLEGE_SEL_CREDITS :
                      category === "一般選修" ? GEN_SEL_CREDITS : 0;
    credits[category] = {
      requiredCredit,
      takenCredit: takenCredits,
      remainingCredit: Math.max(0, requiredCredit - takenCredits),
    };
  }

  let generalRemarks = {
    Fulfill: generalResults.fulfill,
    NeedScope: generalResults.needScope
  };

  const takenReqCourseNames = new Set(arrangedCourses.系訂必修.map(c => c.name));
  let reqRemarks = {
    MissingReq: [...REQ_COURSES].filter(c => !takenReqCourseNames.has(c)),
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
 * @param {number[]} generalNeededScope - needed general course scopes, comes from the result of fulfillGeneralRequirements function
 * @returns {Remarks} remarks
 */
function addCourseRemarks(credits, courses, generalNeededScope) {
  /** @type {Remarks} */
  let remarks = {
    系訂必修: "",
    通識: ""
  };

  // 系訂必修
  let reqCourseSet = new Set(REQ_COURSES);
  let haveExperiment = false; // 是否有修習計算機網路實驗/計算機系統實驗
  let haveChinese = false; 

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
    for (const missingCourse of reqCourseSet) {
      remarks.系訂必修 += missingCourse + "、";
    }

    remarks.系訂必修 = remarks.系訂必修.slice(0, -1);  // remove the redundant 、
  }

  if (!haveExperiment) {
    if (reqCourseSet.size != 0) {
      remarks.系訂必修 += "、計算機網路實驗/計算機系統實驗（擇一修習）";
    }
    else {
      remarks.系訂必修 += "計算機網路實驗/計算機系統實驗（擇一修習）";
    }
  }
    
  // 通識
  if (generalNeededScope.length !== 0) {
    remarks.通識 = "通識領域尚未修習：";

    for (const scope of generalNeededScope) {
      remarks.通識 += "A" + scope +   "、";
    }
    remarks.通識 = remarks.通識.slice(0, -1);
    remarks.通識 += "，以上領域需各至少修習一門";
  }

  return remarks;
}
  
/** 
 *  An object mapping course names to sets of scope number
 *  Example: { "math": new Set([1, 2]), "history": new Set([3, 5]) }
 * @param {Course[]} generalCourses
 * @returns {Object} result - The result object
 * @returns {boolean} result.fulfill - Whether it fulfill
 * @returns {number[]} result.needScope - Scopes still needed
 */
function fulfillGeneralRequirements(generalCourses) {
    
  const graph = {};
  for (const course of generalCourses) {
    if (!course.scopes) {
      console.warn(`Course ${course.name} has no scopes defined.`);
      continue;
    }
    const eligible = course.scopes.filter(s => GEN_SCOPES.has(s));
    if (eligible.length > 0) {
      const key = course.name;
      graph[key] = eligible;
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
    return { fulfill: true, needScope: [] };
  } else {
    const matchedScopes = new Set(Object.keys(matchR).map(Number));
    const missing = [...GEN_SCOPES].filter(s => !matchedScopes.has(s));
    return { fulfill: false, needScope: missing };
  }
}

/**
 * Moves overflow credits from one course category to another.
 * @param {Course[]} source - The source category
 * @param {Course[]} target - The target category
 * @param {number} sourceLimit - The maximum allowed credits in the source
 */
function moveOverflowCredits(overflow, source, target) {

  while (overflow > 0) {
    const course = source.pop();

    if (course.credit <= overflow) {
      target.push(course);
      overflow -= course.credit;
    } else {
      const splitCredit = overflow;
      const movedPart = { ...course, credit: splitCredit, originCredit: course.credit };
      const remainPart = { ...course, credit: course.credit - splitCredit, originCredit: course.credit };
      target.push(movedPart);
      source.push(remainPart);
      overflow = 0;
    }
  }
}

/**
 * Moves overflow general education credits to selective courses.
 * @param {Courses} courses
 */
function moveOverflowGenCredits(courses) {
  let overflow = courses.通識.reduce((acc, c) => acc + c.credit, 0) - GEN_CREDITS;

  while (overflow > 0 && courses.通識.filter(c => c.star).length > 0) {
    for (const course of courses.通識) {

      let fullfillGenWithoutThis = fulfillGeneralRequirements(courses.通識.filter(c => c !== course)).fulfill;
      let fulfillGen = fulfillGeneralRequirements(courses.通識).fulfill;
      if (course.star === false || !fullfillGenWithoutThis && fulfillGen) {
        continue;
      }

      const rearrangedGen = courses.通識.splice(courses.通識.indexOf(course), 1)[0];
      if (rearrangedGen.credit <= overflow) {
        courses.一般選修.push(rearrangedGen);
        overflow -= rearrangedGen.credit;
      } else {
        const splitCredit = overflow;
        const splitGen = { ...rearrangedGen, credit: splitCredit, originCredit: rearrangedGen.credit };
        const remainGen = { ...rearrangedGen, credit: rearrangedGen.credit - splitCredit, originCredit: rearrangedGen.credit };
        courses.一般選修.push(splitGen);
        courses.通識.push(remainGen);
        overflow = 0;
      }
    }
  }
}

/**
 * Remove failed (F) and withdrawn (停修) courses from the rawCourses object.
 * @param {RawCourses} rawCourses
 */
function removeFailedAndWithdrawnCourses(rawCourses) {
  for (const category of Object.keys(rawCourses)) {
    for (const course of rawCourses[category]) {
      if (course.grade === "(停修)" || course.grade === "(F)") {
        rawCourses[category].splice(rawCourses[category].indexOf(course), 1);
      }
    }
  }
}

export { arrangeCourses, computeRemainingCredits, addCourseRemarks, fulfillGeneralRequirements };