/*
courses = { "共同必修課程": [{
    "name": "國文（一）",
    "credit": 3, 
    "semester": "112/1"
}, {
    "name": "英文",
    "credit": 3, 
    "semester": "112/1"
}], 
"通識": [{
    "name": "某甲通識",
    "credit": 3, 
    "semester": "112/1",
    "scope": [2, 5],
    "star": true
}, {
    "name": "某乙通識",
    "credit": 3, 
    "semester": "112/1",
    "scope": [3], 
    "star": false
}]}
*/

const TOTAL_SELECTIVE_CREDITS = 53       // 選修總學分
const DEPARTMENT_REQUIRED_CREDITS = 51;  // 系定必修學分
const DEPARTMENT_SELECTIVE_CREDITS = 21; // 系內選修學分
const COLLEGE_SELECTIVE_CREDITS = 9;     // 院內選修學分
const GEN_CREDITS = 15;                  // 通識學分
const GEN_SCOPE_NUM = 3;
const GEN_SCOPES = new Set([1, 2, 3, 5, 8]);

function arrange(courses) {
    
    // 體育、共同必修不用處理
    // 一般選修、通識
    // 系必修、院選修、系選修以溢出處理即可
    // 我覺得要先處理系必修、院選修、系選修、一般選修，因為通識課程是否要移動到一般選修取決於一般選修的學分數
    
    // handle 系必修、院選修、系選修、一般選修
    if (courses["系定必修"].length > DEPARTMENT_REQUIRED_CREDITS) {
      
    }

    // handle 通識
    generalResults = fulfilGeneral(courses["通識"]);
    
    if (generalResults["fulfil"] == true) {
        
    } 
    
    
    
    return arranged_courses
}

function remain(arranged_courses) {
    // return courses, number of credits to take

/*
number of credits to take = { "共同必修課程": 3, "通識": {
    "credit remaining": 6, 
    "number of scopes type remaining": 2
    "scopes lack": ["1", "2", "3", "5"]
}, ...}
*/
    
}


/**
 * @param {Object<string, Set<number>>} generalCourses - 
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