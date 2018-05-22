require('make-promises-safe')
require('dotenv-safe').load()

const db = require('..')
const repoImages = require('repo-images')
const Bottleneck = require('bottleneck')
const limiter = new Bottleneck({
  maxConcurrent: 5,
  minTime: 500
})
let repos = []
const maxrepos = 10 * 1000

db.createReadStream()
  .on('data', ({key:repoName, value:repo}) => {
    repos.push(repo)
  })
  .on('end', async () => {    
    repos
      .filter(repo => repo.forkCount > 0)
      .sort((a, b) => b.forkCount - a.forkCount)
      .slice(0,maxrepos)
      .forEach(({nameWithOwner}) => {
        limiter.schedule(fetchIcons, nameWithOwner)
      })
  })

async function fetchIcons (nameWithOwner) {
  const images = await repoImages(nameWithOwner, {token: process.env.GH_TOKEN})
    .catch(err => {
      console.error('no images found for repo', nameWithOwner)
      console.error(err)
    })
  if (!images) return

  const icons = images.filter(image => isIcon(image.path))

  const record = await db.get(nameWithOwner)
    .catch(err => {
      console.error('record not found', nameWithOwner)
      console.log(err)
    })
  if (!record) return

  record.icons = icons
  await db.put(nameWithOwner, record)

  console.log('\n', nameWithOwner, icons)
}

function isIcon(filename) {
  return filename.match(/icon/i) && filename.match(/\.png$/)
}