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

/**
 * Arrange courses into some order.
 * @param {Courses} courses - The courses data object.
 * @returns {Courses} returnCourses - The arranged result.
*/
function arrange(courses) {
  // 體育、共同必修不用處理
  // 一般選修、通識
  // 系必修、院選修、系選修以溢出處理即可
  // 我覺得要先處理系必修、系選修、院選修、一般選修，因為通識課程是否要移動到一般選修取決於一般選修的學分數
  
  // handle 系必修、系選修、院選修、一般選修
  if (courses["系必修"].length > DEPARTMENT_REQUIRED_CREDITS) {
    // TODO: 只有「專題研究」、「計算機網路實驗/計算機系統實驗」能溢出到系選修
    
  }
  
  while (courses["系選修"].length > DEPARTMENT_SELECTIVE_CREDITS) {
    courses["院選修"].push(courses["系選修"].pop());
  }
  
  while (courses["院選修"].length > COLLEGE_SELECTIVE_CREDITS) {
    courses["一般選修"].push(courses["院選修"].pop());
  }
  
  return arrangedCourses
}
/**
 * @typedef {Object} CourseCredits
 * @property {number} RequiredCredit
 * @property {number} TakenCredit
 * @property {number} RemainingCredit
 * @property {boolean} Fulfil - for 通識
 * @property {number[]} NeedScope - for 通識
 */

/**
 * @param {Courses} arrangedCourses
 * @returns {CourseCredits[]} remainCredits
 */
function remain(arrangedCourses) {
  // return courses, number of credits to take
  let remainCourses = {};
  let generalResults = fulfilGeneral(arrangedCourses["通識"]);
  
  for (const [category, courseList] of Object.entries(arrangedCourses)) {
    let takenCredits = courseList.reduce((sum, course) => sum + course.credit, 0);
    remainCourses[category] = {
      RequiredCredit: category === "通識" ? GEN_CREDITS :
                      category === "系必修" ? DEPARTMENT_REQUIRED_CREDITS :
                      category === "系選修" ? DEPARTMENT_SELECTIVE_CREDITS :
                      category === "院選修" ? COLLEGE_SELECTIVE_CREDITS :
                      category === "一般選修" ? TOTAL_SELECTIVE_CREDITS : 0,
      TakenCredit: takenCredits,
      RemainingCredit: Math.max(0, courseList[0].credit - takenCredits),
      Fulfil: category === "通識" ? generalResults.fulfil : null,
      NeedScope: category === "通識" ? generalResults.needScope : null
    };
  }
  return remainCourses;
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