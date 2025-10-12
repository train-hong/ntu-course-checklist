import fs from 'fs';
import cheerio from 'cheerio';

const html = fs.readFileSync('./data/修課檢視表.html', 'utf-8');
const $ = cheerio.load(html);

const rawCourses = { 共同必修課程: [], 系訂必修: [], 通識: [], 指定選修與一般選修: [], 不計學分: [], 輔系課程: [], 雙主修課程: [] };
const categories = [ "共同必修", "系訂必修", "通識", "基本能力", "指定選修與一般選修", "不計學分", "輔系課程", "雙主修課程" ];

for (const category of categories) {
  const table = $(`h4:contains("${category}")`).next('table-responsive');
  const rows = table.find('tbody tr');
  const courses = [];

  rows.each((_, tr) => {
    const cells = $(tr).find('td').map((_, td) => $(td).text().trim()).get();

    courses.push({
      category: cells[0],
      semester: cells[1],
      name: cells[2],
      code: cells[3],
      credit: parseFloat(cells[6]),
      grade: cells[7]
    });
  });

  rawCourses[category] = courses;
}

fs.writeFileSync('extraction.json', JSON.stringify(rawCourses, null, 2));
console.log('Courses extracted and saved to extraction.json');