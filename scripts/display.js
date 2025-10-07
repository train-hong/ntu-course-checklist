/**
 * Display the arranged courses and remaining credits.
 * @param {Courses} arrangedCourses - The arranged courses data.
 * @param {CourseCredits[]} credits - The credits data.
 */
function display(arrangedCourses, credits) {
  const tableLayout = [
    ["共同必修", "體育"],
    ["一般選修", "通識"],
    ["系訂必修", "系內選修", "院內選修"]
  ];

  const wrapper = document.createElement("div");
  wrapper.classList.add("tables-wrapper");

  const mainHeader = document.createElement("h3");
  mainHeader.textContent = "畢業學分審核";
  wrapper.appendChild(mainHeader);

  tableLayout.forEach(rowTitles => {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("row");

    rowTitles.forEach(title => {
      const cellDiv = document.createElement("div");
      cellDiv.classList.add("cell");
      cellDiv.appendChild(createTableContainer(title));
      rowDiv.appendChild(cellDiv);
    });

    wrapper.appendChild(rowDiv);
  });

  const firstTable = document.querySelector(".table");
  if (firstTable) {
    firstTable.insertAdjacentElement("afterend", wrapper);
  }

}


/**
 * Create a table container with a title and a table of courses.
 * @param {string} title - The title of the table.
 * @param {Courses} courses - The courses data to populate the table.
 * @param {CourseCredits[]} credits - The credits data to populate the table.
 * @returns {HTMLElement} The table container element.
 */
function createTableContainer(title, courses, credits) {
  // preprocess courses and credits to populate the table if needed



  const container = document.createElement("div");
  container.classList.add("table-container");

  const tableName = document.createElement("h4");
  tableName.textContent = title;
  container.appendChild(tableName);

  const table = document.createElement("table");
  table.classList.add("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th style="text-align: center; vertical-align: center; color: white; background-color:Highlight;">科目名稱</th>
        <th style="text-align: center; vertical-align: center; color: white; background-color:Highlight;">學分</th>
        <th style="text-align: center; vertical-align: center; color: white; background-color:Highlight;">學年期</th>
      </tr>
    </thead>
    <tbody>
    </tbody>
  `;

  const tbody = table.querySelector("tbody");
  for (const course of courses) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td style="text-align:center;">${course ? course.name : ""}</td>
      <td style="text-align:center;">${course ? course.credits : ""}</td>
      <td style="text-align:center;">${course ? course.semester : ""}</td>
    `;
    tbody.appendChild(row);
  }
  container.appendChild(table);

  if (credits) {
    const infoDiv = document.createElement("div");
    infoDiv.style.marginTop = "8px";
    infoDiv.innerHTML = `
      應修學分：${credits.requiredCredit}，
      已修學分：<span style="color:black;">${credits.takenCredit}</span>，
      剩餘學分：<span style="color:red;">${credits.remainingCredit}</span>
    `;
    container.appendChild(infoDiv);
  }

  return container;
}