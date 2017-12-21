const Lab = require('lab')
const lab = exports.lab = Lab.script()
const { expect } = require('code')
const cleaner = require('./index')

lab.test('cleanup', async () => {
  expect(await cleaner('<br/>')).to.equal('<br>')
  expect(await cleaner('<!-- test --!>')).to.equal('')
  expect(await cleaner('<style></style><br>')).to.equal('<br>')
  expect(await cleaner('<p></p><br>')).to.equal('<br>')
  expect(await cleaner('<p><strong></strong></p><br>')).to.equal('<br>')
})
