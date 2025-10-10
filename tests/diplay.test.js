import { describe, test, it, expect } from "vitest";

// arrange
const courses = {
  共同必修: [
    { name: '微積分 I', credit: 3, semester: '111-1' },
    { name: '普通物理', credit: 3, semester: '111-2' }
  ],
  通識: [
    { name: '哲學概論', credit: 2, semester: '112-1', scope: [1, 2], star: true },
    { name: '藝術與人生', credit: 2, semester: '112-2', scope: [5], star: false }
  ],
  系必修: [
    { name: '資料結構', credit: 3, semester: '112-1' }
  ],
  系選修: [],
  院選修: [],
  一般選修: [],
  體育: [
    { name: '羽球', credit: 1, semester: '111-1' }
  ]
}


describe('display', () => {
    it('')
})