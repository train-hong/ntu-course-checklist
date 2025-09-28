const header = document.createElement("h3");
header.textContent = "畢業學分審核";

const tableName = document.createElement("h4");
tableName.textContent = "共同必修";

const newTable = document.createElement("table");
newTable.classList.add("table");

newTable.innerHTML = `
<thead>
<tr>
<th style="text-align:center; color:white; background-color:Highlight;">科目名稱</th>
<th style="text-align:center; color:white; background-color:Highlight;">學分</th>
<th style="text-align:center; color:white; background-color:Highlight;">學年期</th>
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
</tbody>
`;

document.querySelectorAll(".table")[0].insertAdjacentElement("afterend", newTable);
document.querySelectorAll(".table")[0].insertAdjacentElement("afterend", tableName);
document.querySelectorAll(".table")[0].insertAdjacentElement("afterend", header);