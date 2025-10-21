// import { extract } from './extract.js';
// import { arrangeCourses, computeRemainingCredits, addCourseRemarks } from './courseHandler.js';

function main() {
    // Your content script logic here
    console.log("Content script loaded");
    const rawCourses = extract();
    const arrangedCourses = arrangeCourses(rawCourses);
    const remainingCredits = computeRemainingCredits(arrangedCourses);
    addCourseRemarks(arrangedCourses);
}
main();