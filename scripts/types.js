/**
 * @typedef {Object} BaseCourse
 * @property {string} name - 科目名稱
 * @property {number} credit - 學分
 * @property {string} semester - 學年期
 * @property {string} [code] - 課號
 */

/**
 * @typedef {BaseCourse & {
 *   category?: string  // 課別 (e.g., "國文", "指定選修")
 * }} CategorizedCourse
 */

/**
 * @typedef {BaseCourse & {
 *   star: boolean,
 *   scope: number[]
 * }} GeneralCourse
 */

/**
 * Courses extracted directly from html
 * @typedef {Object} RawCourses
 * @property {CategorizedCourse[]} 共同必修
 * @property {BaseCourse[]} 系訂必修
 * @property {GeneralCourse[]} 通識
 * @property {BaseCourse[]} 基本能力
 * @property {CategorizedCourse[]} 指定選修與一般選修
 * @property {BaseCourse[]} 不計學分
 */

/**
 * Courses processed through classifyCourseType function
 * @typedef {Object} Courses
 * @property {CategorizedCourse[]} 共同必修
 * @property {BaseCourse[]} 系訂必修
 * @property {GeneralCourse[]} 通識
 * @property {BaseCourse[]} 系選修
 * @property {BaseCourse[]} 院選修
 * @property {BaseCourse[]} 一般選修
 */

/**
 * @typedef {Object} Credits
 * @property {Credit} 共同必修
 * @property {Credit} 通識
 * @property {Credit} 系訂必修
 * @property {Credit} 系選修
 * @property {Credit} 院選修
 * @property {Credit} 一般選修
 * @property {Credit} 體育
 */

/**
 * @typedef {Object} Credit
 * @property {number} requiredCredit
 * @property {number} takenCredit
 * @property {number} remainingCredit
 * @property {boolean} fulfil - for 通識
 * @property {number[]} needScope - for 通識
 */

/**
 * 系訂必修、共同必修、通識備注
 * @typedef {Object} Remarks
 * @property {string[]} missingCommonRequired - 共同必修備注
 * @property {string[]} missingRequired - 系訂必修備注
 * @property {number[]} generalNeedScope - 通識缺領域備注
 */
