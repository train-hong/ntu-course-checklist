/**
 * @typedef {Object} Course
 * @property {string} category - 課別
 * @property {string} semester - 學年期
 * @property {string} name - 科目名稱
 * @property {string} code - 課號
 * @property {number} credit - 學分
 * @property {number} [splitCredit] - 拆分學分
 * @property {boolean} [star] - 通識星號
 * @property {number[]} [scope] - 通識領域
 */

/**
 * Courses extracted directly from html
 * @typedef {Object} RawCourses
 * @property {Course[]} 共同必修
 * @property {Course[]} 系訂必修
 * @property {Course[]} 通識
 * @property {Course[]} 基本能力
 * @property {Course[]} 指定選修與一般選修
 * @property {Course[]} 不計學分
 */

/**
 * Courses processed through arrangeCourses()
 * @typedef {Object} Courses
 * @property {Course[]} 共同必修
 * @property {Course[]} 系訂必修
 * @property {Course[]} 通識
 * @property {Course[]} 系選修
 * @property {Course[]} 院選修
 * @property {Course[]} 一般選修
 */

/**
 * @typedef {Object} Credits
 * @property {CommonCredit} 共同必修
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
 * @typedef {Object} CommonCredit
 * @property {number} 體育
 * @property {number} 外文
 * @property {number} 進階英文課
 * @property {number} 國文
 * @property {number} 服務學習
 */

/**
 * 系訂必修備注、共同必修備注、通識備注
 * @typedef {Object} Remarks
 * @property {string} 系訂必修
 * @property {number[]} generalNeedScope - 通識缺領域備注
 */