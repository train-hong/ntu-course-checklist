function createTableContainer(title) {
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
        <th style="text-align: left; vertical-align: center; color: white; background-color:Highlight;">科目名稱</th>
        <th style="text-align: center; vertical-align: center; color: white; background-color:Highlight;">學分</th>
        <th style="text-align: center; vertical-align: center; color: white; background-color:Highlight;">學年期</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="text-align:center;">測試科目1</td>
        <td style="text-align:center;">測試學分1</td>
        <td style="text-align:center;">測試學年期1</td> 
      </tr>
      <tr>
        <td style="text-align:center;">測試科目2</td>
        <td style="text-align:center;">測試學分2</td>
        <td style="text-align:center;">測試學年期2</td> 
      </tr>
      <tr>
        <td style="text-align:center;">測試科目3</td>
        <td style="text-align:center;">測試學分3</td>
        <td style="text-align:center;">測試學年期3</td> 
      </tr>
    </tbody>
  `;
  container.appendChild(table);

  return container;
}

const tableLayout = [
  ["共同必修", "系訂必修"],
  ["通識", "一般選修"],
  ["系內選修", "院內選修"]
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
