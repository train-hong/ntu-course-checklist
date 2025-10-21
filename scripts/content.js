// import { extract } from './extract.js';
// import { arrangeCourses, computeRemainingCredits, addCourseRemarks } from './courseHandler.js';

function main() {
  // Your content script logic here
  console.log("Content script loaded");
  const rawCourses = extract();
  const arrangedCourses = arrangeCourses(rawCourses);
  const remainingCredits = computeRemainingCredits(arrangedCourses);
  const generalScope = fulfillGeneralRequirements(arrangedCourses.通識);
  const courseRemark = addCourseRemarks(remainingCredits, arrangedCourses, generalScope.needScope);
  console.log("Arranged courses:", arrangedCourses);
  display(arrangedCourses, remainingCredits, courseRemark);
}
main();