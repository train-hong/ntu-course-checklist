/**
 * Display the arranged courses and remaining credits.
 * @param {Courses} courses
 * @param {Credits} credits
 * @param {Remarks} remarks
 * @return {void}
 */
function display(courses, credits, remarks) {
  const tableLayout = [
    ["共同必修", "系訂必修"],
    ["通識", "一般選修"],
    ["系選修", "院選修"]
  ];

  const wrapper = document.createElement("div");
  wrapper.classList.add("tables-wrapper");

  const mainHeader = document.createElement("h3");
  mainHeader.textContent = "畢業學分審核";
  wrapper.appendChild(mainHeader);

  for (const rowTitles of tableLayout) {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("row");

    for (const title of rowTitles) {
      const cellDiv = document.createElement("div");
      cellDiv.classList.add("cell");
      cellDiv.appendChild(createTableContainer(title, courses[title], credits, remarks));
      rowDiv.appendChild(cellDiv);
    }

    wrapper.appendChild(rowDiv);
  }

  const firstTable = document.querySelector(".table");
  if (firstTable) {
    firstTable.insertAdjacentElement("afterend", wrapper);
  }

}

/**
 * Create a table container with a title and a table of courses with the same type.
 * @param {string} title - The title of the table.
 * @param {Courses} courses
 * @param {Credits} credits
 * @param {Remarks} remarks
 * @returns {HTMLElement} The table container element.
 */
function createTableContainer(title, courses, credits, remarks) {

  const container = document.createElement("div");
  container.classList.add("table-container");

  const tableName = document.createElement("h4");
  tableName.textContent = title;
  container.appendChild(tableName);

  const table = document.createElement("table");
  table.classList.add("table");
  if (title === "通識" || title === "一般選修") {
    table.innerHTML = `
      <thead>
        <tr>
          <th style="text-align: center; color: white; background-color:Highlight;">通識領域/星號</th>
          <th style="text-align: center; color: white; background-color:Highlight;">科目名稱</th>
          <th style="text-align: center; color: white; background-color:Highlight;">學分</th>
          <th style="text-align: center; color: white; background-color:Highlight;">學年期</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
  } else {
    table.innerHTML = `
      <thead>
        <tr>
          <th style="text-align: center; color: white; background-color:Highlight;">科目名稱</th>
          <th style="text-align: center; color: white; background-color:Highlight;">學分</th>
          <th style="text-align: center; color: white; background-color:Highlight;">學年期</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
  }

  const tbody = table.querySelector("tbody");

  for (const course of courses) {
    const row = document.createElement("tr");
    if (title === "通識" || title === "一般選修") {

      row.innerHTML = `
        <td style="text-align:left; padding-left: 12px;">${course.category.startsWith("通識") ? course.category.slice(2) : ""}</td>
        <td style="text-align:left; padding-left: 12px;">${course.name}</td>
        <td style="text-align:center;">${course.credit}</td>
        <td style="text-align:center;">${course.semester}</td>
      `;
    } else {
      row.innerHTML = `
      <td style="text-align:left; padding-left: 12px;">${course ? course.name : ""}</td>
      <td style="text-align:center;">${course ? course.credit : ""}</td>
      <td style="text-align:center;">${course ? course.semester : ""}</td>
      `;
    }
    tbody.appendChild(row);
  }
  container.appendChild(table);

  if (credits[title]) {
    const creditsDiv = document.createElement("div");
    creditsDiv.style.marginTop = "8px";
    if (title != "共同必修") {
      creditsDiv.innerHTML = `
        應修 ${credits[title].requiredCredit} 學分，已修 <span style="color:black;">${credits[title].takenCredit}</span> 學分，未修 <span style="color:red;">${credits[title].remainingCredit}</span> 學分
      `;
    } else {
      for (const subcategory of Object.keys(credits[title])) {
        /**
         * @typedef {Object} CommonCredit
         * @property {number} 體育
         * @property {number} 外文
         * @property {number} 進階英語
         * @property {number} 國文
         * @property {number} 服務學習
         */
        if (subcategory === "進階英語" || subcategory === "服務學習") {
          creditsDiv.innerHTML += `
            ${subcategory}應修 ${credits[title][subcategory]} 門，已修 ${credits[title][subcategory]} 門，未修 <span style="color:red;">0</span> 門<br />
          `;
        } else {
          creditsDiv.innerHTML += `
            ${subcategory}應修 ${credits[title][subcategory]} 學分，已修 ${credits[title][subcategory]} 學分，未修 <span style="color:red;">0</span> 學分<br />
          `;
        }
      }
      creditsDiv.innerHTML = creditsDiv.innerHTML.trim().replace(/<br\s*\/?>\s*$/, "");
    }
    container.appendChild(creditsDiv);
  }

  // 系訂必修
  if (title === "系訂必修" && remarks.系訂必修) {
    const remarksDiv = document.createElement("div");
    remarksDiv.style.marginTop = "8px";
    remarksDiv.innerHTML = `備註：${remarks.系訂必修}`;
    container.appendChild(remarksDiv);
  } else if (title === "通識" && remarks.通識) {
    const remarksDiv = document.createElement("div");
    remarksDiv.style.marginTop = "8px";
    remarksDiv.innerHTML = `備註：${remarks.通識}`;
    container.appendChild(remarksDiv);
  }

  return container;
}

export { display };