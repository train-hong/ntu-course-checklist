# NTU Course Checklist Chrome Extension

This Chrome extension helps National Taiwan University (NTU) students visualize and manage their course checklist, providing a clearer overview of their graduation requirements.

## Features

*   **Course Extraction:** Automatically extracts course data from the NTU academic system.
*   **Categorization:** Arranges courses into categories based on NTU CSIE graduation requirements (e.g., Common Compulsory, General Education, Department Compulsory, Electives).
*   **Credit Calculation:** Computes remaining credits for each category.
*   **General Education Fulfillment:** Checks the fulfillment of general education requirements, including scope matching.
*   **Remarks and Suggestions:** Provides remarks for missing compulsory courses and unfulfilled general education scopes.
*   **Interactive Display:** Presents the processed course data in a user-friendly format directly on the academic system page.

## Architecture

The project follows a standard Chrome extension architecture, primarily utilizing content scripts to interact with the NTU academic website and a popup for potential future interactions.

*   **`manifest.json`**: Defines the extension's properties, permissions, and entry points.
*   **`background.js`**: (Currently minimal) Can be used for background tasks, listeners, or more complex logic not tied to a specific webpage.
*   **`popup/popup.html`**: The HTML file for the extension's popup window.
*   **`ntu.png`**: The icon for the extension.
*   **`styles/content.css`**: Styles applied to the injected content on the NTU academic page.
*   **`scripts/`**: Contains the core logic for the extension.
    *   **`content.js`**: The main content script that orchestrates the extraction, processing, and display of course data. It is injected into the NTU academic page.
    *   **`extract.js`**: Responsible for parsing the HTML of the NTU academic page and extracting raw course information.
    *   **`courseHandler.js`**: Contains the business logic for categorizing courses, calculating credits, checking general education requirements, and generating remarks.
    *   **`display.js`**: Handles the dynamic creation and injection of HTML elements to display the processed course data on the webpage.
    *   **`types.js`**: Defines JSDoc types for better code readability and maintainability.
*   **`tests/`**: Contains unit tests for the JavaScript modules.

## Key Files

*   **`manifest.json`**: Configures the extension. Notably, it declares `content.js` and its dependencies (`extract.js`, `courseHandler.js`, `display.js`) to run on `https://reg.aca.ntu.edu.tw/*` URLs.
*   **`scripts/content.js`**: The entry point for the content script. It calls `extract()`, `arrangeCourses()`, `computeRemainingCredits()`, `addCourseRemarks()`, and `display()`.
*   **`scripts/extract.js`**: Uses DOM manipulation to pull course data from the tables on the NTU academic page.
*   **`scripts/courseHandler.js`**: Implements the core logic for course classification and credit calculation based on predefined NTU CSIE graduation rules. It also includes a bipartite matching algorithm for general education scope fulfillment.
*   **`scripts/display.js`**: Takes the processed course data and dynamically generates HTML tables and remarks, injecting them into the current webpage.
*   **`scripts/types.js`**: Provides JSDoc type definitions for the data structures used throughout the scripts, enhancing code clarity and enabling better IDE support.

## Data Flow

1.  **Extraction (`extract.js`):** When a student visits the NTU academic system's course checklist page, `content.js` initiates the `extract()` function. This function parses the HTML tables to gather raw course information (name, credit, grade, etc.).
2.  **Processing (`courseHandler.js`):** The extracted raw course data is then passed to `arrangeCourses()`, which categorizes them according to graduation requirements. `computeRemainingCredits()` calculates the credits needed, and `fulfillGeneralRequirements()` checks general education fulfillment. `addCourseRemarks()` generates textual remarks.
3.  **Display (`display.js`):** Finally, `display()` takes the organized course data, credit information, and remarks, and dynamically injects a user-friendly summary table into the current webpage, allowing students to see their progress at a glance.

## Installation

1.  Clone this repository: `git clone https://github.com/train-hong/ntu-course-checklist.git`
2.  Open Chrome and navigate to `chrome://extensions/`.
3.  Enable "Developer mode" using the toggle switch in the top right corner.
4.  Click "Load unpacked" and select the cloned repository directory.
5.  The extension icon (NTU logo) should now appear in your Chrome toolbar.

## Testing

The project uses `vitest` for unit testing.

To run the tests:

1.  Install dependencies: `npm install`
2.  Run tests: `npm test`

