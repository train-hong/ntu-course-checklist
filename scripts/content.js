// This is an "Immediately Invoked Async Function Expression"
// It's a common pattern for running async code at the top level.
(async () => {
  try {
    // 1. Get the full, correct extension URLs for your modules
    const extractURL = chrome.runtime.getURL('scripts/extract.js');
    const handlerURL = chrome.runtime.getURL('scripts/courseHandler.js');
    const displayURL = chrome.runtime.getURL('scripts/display.js');

    // 2. Import functions from your modules
    const { extract } = await import(extractURL);
    const { arrangeCourses, computeRemainingCredits, addCourseRemarks } = await import(handlerURL);
    const { display } = await import(displayURL);

    // 3. Define and run your main logic
    function main() {
      // Your content script logic here
      const rawCourses = extract();
      const arrangedCourses = arrangeCourses(rawCourses);
      const remainingCredits = computeRemainingCredits(arrangedCourses);
      const generalScope = fulfillGeneralRequirements(arrangedCourses.通識);
      const courseRemark = addCourseRemarks(remainingCredits, arrangedCourses, generalScope.needScope);
      console.log("Arranged courses:", arrangedCourses);
      display(arrangedCourses, remainingCredits, courseRemark);
    }
    main();

  } catch (e) {
    console.error("Failed to load module:", e);
  }
})();