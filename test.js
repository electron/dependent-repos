const db = require('.')

describe('reposUsingElectron', () => {
  test('gets a repo', async () => {
    const repo = await db.get('electron/spectron')
    expect(repo.nameWithOwner).toBe('electron/spectron')
  })

  it('has lots of entries', (done) => {
    let count = 0
    db.createKeyStream()
      .on('data', (key) => {
        count++
      })
      .on('end', () => {
        expect(count > 100).toBe(true)
        done()
      })
  })
})
