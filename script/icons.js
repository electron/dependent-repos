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
const maxrepos = 100

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
  const icons = images.filter(image => isIcon(image.path))
  // const rawgits = icons.map(icon => icon.rawgit)

  const record = await db.get(nameWithOwner)
  record.icons = icons
  await db.put(nameWithOwner, record)

  console.log('\n', nameWithOwner, icons)
}

function isIcon(filename) {
  return filename.match(/icon/i) && filename.match(/\.png$/)
}