/**
 * @typedef {Object} Course
 * @property {string} name - Course name.
 * @property {number} credit - Course credits.
 * @property {string} semester - Semester code.
 */

/**
 * @typedef {Object} GeneralCourse
 * @property {string} name
 * @property {number} credit
 * @property {string} semester
 * @property {number[]} scope
 * @property {boolean} star
 */

/**
 * @typedef {Object} Courses
 * @property {Course[]} 共同必修
 * @property {GeneralCourse[]} 通識
 * @property {Course[]} 系必修
 * @property {Course[]} 系選修
 * @property {Course[]} 院選修
 * @property {Course[]} 一般選修
 * @property {Course[]} 體育
 */

const TOTAL_SELECTIVE_CREDITS = 53       // 選修總學分
const DEPARTMENT_REQUIRED_CREDITS = 51;  // 系必修學分
const DEPARTMENT_SELECTIVE_CREDITS = 21; // 系選修學分
const COLLEGE_SELECTIVE_CREDITS = 9;     // 院選修學分
const GENERAL_SELECTIVE_CREDITS = 23;    // 一般選修學分
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

/**
 * Classify courses into their respective types.
 * @param {Object} rawCourses - The raw courses data object.
 */
function classifyCourseType(rawCourses) {

}

/**
 * Arrange courses into some order.
 * @param {Courses} courses - The courses data object.
 * @returns {Courses} Courses - The arranged result.
*/
function arrangeCourses(courses) {
  // console.log('Before arranging:', courses);

  while (courses.系必修.filter(course => course.name === "專題研究").length > 1) {
    const idx = courses.系必修.map(course => course.name).lastIndexOf("專題研究");
    courses.系選修.push(courses.系必修.splice(idx, 1)[0]);
  }

  if (courses.系必修.find(course => course.name == "計算機系統實驗") && courses.系必修.find(course => course.name == "計算機網路實驗")) {
    const idx = courses.系必修.map(course => course.name).lastIndexOf("計算機網路實驗");
    courses.系選修.push(courses.系必修.splice(idx, 1)[0]);
  }

  while (courses.系必修.filter(course => course.name.startsWith("普通")).length > 1) {
    const idx = courses.系必修.map(course => course.name).lastIndexOf(courses.系必修.find(course => course.name.startsWith("普通")));
    courses.系選修.push(courses.系必修.splice(idx, 1)[0]);
  }
  
  while (courses.系選修.length > DEPARTMENT_SELECTIVE_CREDITS) {
    courses.院選修.push(courses.系選修.pop());
  }
  
  while (courses.院選修.length > COLLEGE_SELECTIVE_CREDITS) {
    courses.一般選修.push(courses.院選修.pop());
  }
  
  return courses;
}

/**
 * @typedef {Object} Credits
 * @property {Credit} 共同必修
 * @property {Credit} 通識
 * @property {Credit} 系必修
 * @property {Credit} 系選修
 * @property {Credit} 院選修
 * @property {Credit} 一般選修
 * @property {Credit} 體育
 */

/**
 * @typedef {Object} Credit
 * @property {number} requiredCredit
 * @property {number} takenCredit
 * @property {number} remainingCredit
 * @property {boolean} fulfil - for 通識
 * @property {number[]} needScope - for 通識
 */

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
                      category === "系必修" ? DEPARTMENT_REQUIRED_CREDITS :
                      category === "系選修" ? DEPARTMENT_SELECTIVE_CREDITS :
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
    MissingRequired: arrangedCourses["系必修"].filter(c => REQUIRED_COURSES.has(c.name)).map(c => c.name),
    // need fix: MissingCommonRequired: arrangedCourses["共同必修"].filter(c => REQUIRED_COURSES.has(c.name)).map(c => c.name)
  };

  credits["通識"] = { ...credits["通識"], ...generalRemarks };
  credits["系必修"] = { ...credits["系必修"], ...requiredRemarks };
  return credits;
}

/**
 * 系必修、共同必修、通識備注
 * @typedef {Object} Remarks
 * @property {string[]} missingCommonRequired - 共同必修備注
 * @property {string[]} missingRequired - 系必修備注
 * @property {number[]} generalNeedScope - 通識缺領域備注
 */

/**
 * @param
 * @returns {Remarks} remarks
 */

function addCourseRemarks() {}

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

export { classifyCourseType, arrangeCourses, computeRemainingCredits, addCourseRemarks};