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
 * Arrange courses into some order.
 * @param {Courses} courses - The courses data object.
 * @returns {Courses} arrangedCourses - The arranged result.
*/
function arrange(courses) {
  // 體育、共同必修不用處理
  // 一般選修、通識
  // 系必修、院選修、系選修以溢出處理即可
  // 我覺得要先處理系必修、系選修、院選修、一般選修，因為通識課程是否要移動到一般選修取決於一般選修的學分數
  
  // handle 系必修、系選修、院選修、一般選修
  let arrangedCourses = { ...courses };

  while (courses["系必修"].count(course => course.name == "專題研究") > 1) {
    const idx = courses["系必修"].map(course => course.name).lastIndexOf("專題研究");
    arrangedCourses["系選修"].push(courses["系必修"].splice(idx, 1)[0]);
  }

  if (courses["系必修"].find(course => course.name == "計算機系統實驗") && courses["系必修"].find(course => course.name == "計算機網路實驗")) {
    const idx = courses["系必修"].map(course => course.name).lastIndexOf("計算機網路實驗");
    arrangedCourses["系選修"].push(courses["系必修"].splice(idx, 1)[0]);
  }

  while (courses["系必修"].count(course => course.name.startsWith("普通")) > 1) {
    const idx = courses["系必修"].map(course => course.name).lastIndexOf(courses["系必修"].find(course => course.name.startsWith("普通")));
    arrangedCourses["系選修"].push(courses["系必修"].splice(idx, 1)[0]);
  }
  
  while (courses["系選修"].length > DEPARTMENT_SELECTIVE_CREDITS) {
    arrangedCourses["院選修"].push(courses["系選修"].pop());
  }
  
  while (courses["院選修"].length > COLLEGE_SELECTIVE_CREDITS) {
    arrangedCourses["一般選修"].push(courses["院選修"].pop());
  }
  
  return arrangedCourses;
}
/**
 * @typedef {Object} Credit
 * @property {number} requiredCredit
 * @property {number} takenCredit
 * @property {number} remainingCredit
 * @property {boolean} fulfil - for 通識
 * @property {number[]} needScope - for 通識
 */

/**
 * @typedef {Object} GeneralRemarks
 * @property {boolean} fulfil - for 通識
 * @property {number[]} needScope - for 通識
 */

/**
 * @typedef {Object} RequiredRemarks
 * @property {string[]} missingRequired - for 系必修
 * @property {string[]} missingCommonRequired - for 共同必修
 */

/**
 * @param {Courses} arrangedCourses
 * @returns {Credit[]} credits
 * @returns {GeneralRemarks} generalRemarks
 * @returns {RequiredRemarks} requiredRemarks
 */
function remain(arrangedCourses) {
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
 * @param {GeneralCourse[]} generalCourses - 
 *  An object mapping course names to sets of scope number
 *  Example: { "math": new Set([1, 2]), "history": new Set([3, 5]) }
 * @returns {Object} result - The result object
 * @returns {boolean} result.fulfil - Whether it fulfill
 * @returns {number[]} result.needScope - Scopes still needed
 */
function fulfilGeneral(generalCourses) {
    
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

export { arrange, remain, fulfilGeneral };