const db = require('.')
const isURL = require('is-url')

describe('reposUsingElectron', () => {
  test('gets a repo', async () => {
    const repo = await db.get('electron/spectron')
    expect(repo.nameWithOwner).toBe('electron/spectron')
  })

  test('saves an array of icon data on some repos', async () => {
    const repo = await db.get('electron/electron-api-demos')
    expect(Array.isArray(repo.icons)).toBe(true)
    expect(repo.icons.length).toBeGreaterThan(3)
    expect(repo.icons.every(icon => {
      return icon.path && isURL(icon.url) && isURL(icon.rawgit)
    })).toBe(true)
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
