/**
 * @typedef {import('./types.js).BaseCourse} BaseCourse
 * @typedef {import('./types.js).CategorizedCourse} CategorizedCourse
 * @typedef {import('./types.js).GeneralCourse} GeneralCourse
 * @typedef {import('./types.js).RawCourses} RawCourses
 * @typedef {import('./types.js).Courses} Courses
 * @typedef {import('./types.js').Credits} Credits
 * @typedef {import('./types.js').Credit} Credit
 * @typedef {import('./types.js').Remarks} Remarks
 */

export {}; // make this file an ES module so top-level consts are module-scoped

const TOTAL_SELECTIVE_CREDITS = 53       // 選修總學分
const DEPT_REQUIRED_CREDITS = 51;  // 系訂必修學分
const DEPT_SELECTIVE_CREDITS = 21; // 系選修學分
const COLLEGE_SELECTIVE_CREDITS = 9;     // 院選修學分
const GEN_SELECTIVE_CREDITS = 23;    // 一般選修學分
const GEN_CREDITS = 15;                  // 通識學分
const GEN_SCOPE_NUM = 3;
const GEN_SCOPES = new Set([1, 2, 3, 5, 8]);
const REQUIRED_COURSES = new Set([
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
 * Classify raw courses into their respective types.
 * @param {RawCourses} rawCourses - The raw courses data object.
 * @return {Courses} courses - The classified courses data object.
 */
function classifyCourseType(rawCourses) {
  /*
  Classfication rules: Use the given categories in NTU course checklist except for 不計學分.
  1. 共同必修 -> 共同必修
  2. 系訂必修 -> 系訂必修
  3. 通識 -> 通識
  4. 基本能力 -> classify to 通識 if 通識 still need credits and 基本能力 in 通識 less than 6, else 一般選修
  5. 指定選修與一般選修 -> classify 指定選修 to 系選修 and 一般選修 to 一般選修
  6. 不計學分 -> 系選修 if course name is 專題研究
  */
  let courses = { 共同必修: [], 通識: [], 基本能力: [], 系訂必修: [], 系選修: [], 院選修: [], 一般選修: [] }; 

  courses.共同必修 = rawCourses.共同必修;
  courses.系訂必修 = rawCourses.系訂必修;
  courses.通識 = rawCourses.通識;

  for (const course of rawCourses.基本能力) {}

  for (const course of rawCourses.指定選修與一般選修) {
    if (course.category === "指定選修") {
      courses.系選修.push(course);
    } else if (course.category === "一般選修") {
      courses.一般選修.push(course);
    }
  }

  for (const course of rawCourses.不計學分) {
    if (course.name === "專題研究") {
      courses.系選修.push(course);
    }
  }

  return courses;
}

/**
 * Arrange courses into some order.
 * @param {Courses} courses - The courses data object.
 * @returns {Courses} Courses - The arranged result.
*/
function arrangeCourses(courses) {
  /*
  Arrangement rules:
  1. If both 計算機系統實驗 and 計算機網路實驗 are taken, move 計算機網路實驗 to 系選修.
  2. If multiple courses starting with "普通" are taken, move credits beyond 6 to 一般選修.
  3. If 系選修 exceeds DEPT_SELECTIVE_CREDITS, move excess courses to 院選修.
  4. If 院選修 exceeds COLLEGE_SELECTIVE_CREDITS, move excess courses to 一般選修.
  */
  if (courses.系訂必修.find(course => course.name == "計算機系統實驗") && courses.系訂必修.find(course => course.name == "計算機網路實驗")) {
    const idx = courses.系訂必修.map(course => course.name).lastIndexOf("計算機網路實驗");
    courses.系選修.push(courses.系訂必修.splice(idx, 1)[0]);
  }

  while (courses.系訂必修.filter(course => course.name.startsWith("普通")).sum(c => c.credit) > 6) {
    const idx = courses.系訂必修.map(course => course.name).lastIndexOf(courses.系訂必修.find(course => course.name.startsWith("普通")));
    courses.系選修.push(courses.系訂必修.splice(idx, 1)[0]);
  }

  while (courses.系選修.sum(c => c.credit) > DEPT_SELECTIVE_CREDITS) {
    courses.院選修.push(courses.系選修.pop());
  }

  while (courses.院選修.sum(c => c.credit) > COLLEGE_SELECTIVE_CREDITS) {
    courses.一般選修.push(courses.院選修.pop());
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
  let generalResults = fulfilGeneral(arrangedCourses["通識"]);
  
  for (const [category, courseList] of Object.entries(arrangedCourses)) {
    let takenCredits = courseList.reduce((sum, course) => sum + course.credit, 0);
    credits[category] = {
      RequiredCredit: category === "通識" ? GEN_CREDITS :
                      category === "系訂必修" ? DEPT_REQUIRED_CREDITS :
                      category === "系選修" ? DEPT_SELECTIVE_CREDITS :
                      category === "院選修" ? COLLEGE_SELECTIVE_CREDITS :
                      category === "一般選修" ? TOTAL_SELECTIVE_CREDITS : 0,
      TakenCredit: takenCredits,
      RemainingCredit: Math.max(0, courseList[0].credit - takenCredits),
    };
  }

  let generalRemarks = {
    Fulfil: generalResults.fulfil,
    NeedScope: generalResults.needScope
  };

  let requiredRemarks = {
    MissingRequired: arrangedCourses["系訂必修"].filter(c => REQUIRED_COURSES.has(c.name)).map(c => c.name),
    // need fix: MissingCommonRequired: arrangedCourses["共同必修"].filter(c => REQUIRED_COURSES.has(c.name)).map(c => c.name)
  };

  credits["通識"] = { ...credits["通識"], ...generalRemarks };
  credits["系訂必修"] = { ...credits["系訂必修"], ...requiredRemarks };
  return credits;
}

/**
 * @param {Credit} credit
 * @param {Courses} courses
 * @returns {Remarks} remarks
 */

function addCourseRemarks(credit, courses) {
  
}

/**
 * @param {GeneralCourse[]} generalCourses - 
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

export { classifyCourseType, arrangeCourses, computeRemainingCredits, addCourseRemarks };