export function extract() {
  const rawCourses = { 共同必修課程: [], 系訂必修: [], 通識: [], 指定選修與一般選修: [], 不計學分: [], 輔系課程: [], 雙主修課程: [] };
  const categories = [ "共同必修課程", "系訂必修", "通識", "指定選修與一般選修", "不計學分", "輔系課程", "雙主修課程" ];

  for (const category of categories) {
    const allH4s = document.querySelectorAll('h4');
    let table = null;

    for (const h4 of allH4s) {
      if (h4.textContent.trim().startsWith("通識")) {
        h4.textContent = "通識";
      }
      if (h4.textContent.trim().includes(category)) {
        const nextElem = h4.nextElementSibling;
        if (nextElem && nextElem.classList.contains('table-responsive')) {
          table = nextElem;
        }
        break;
      }
    }

    if (!table) {
      console.warn(`Table for category "${category}" not found.`);
      continue;
    }

    const rows = table.querySelectorAll('tbody tr');
    const courses = [];

    for (const tr of rows) {
      const tdElements = tr.querySelectorAll('td');
      const cells = Array.from(tdElements).map(td => td.textContent.trim());

      if (cells.length > 0) {
        courses.push({
          category: cells[0],
          semester: cells[1],
          name: cells[2],
          code: cells[3],
          credit: parseFloat(cells[6]),
          grade: cells[7]
        });
      }
      if (category === "通識") {
        ("Extracted 通識 course:", courses);
      }
    }

    rawCourses[category] = courses;
  }

  console.log("Extracted courses:", rawCourses);
  return rawCourses;
}