require('make-promises-safe')
require('dotenv-safe').load()

const db = require('..')
const repoImages = require('repo-images')
const Bottleneck = require('bottleneck')
const imageSize = require('request-image-size')
const {chain} = require('lodash')
const limiter = new Bottleneck({
  maxConcurrent: 5,
  minTime: 500
})
let repos = []
const maxrepos = 10 * 1000

db.createReadStream()
  .on('data', ({key: repoName, value: repo}) => {
    repos.push(repo)
  })
  .on('end', async () => {
    repos
      .filter(repo => repo.forkCount > 0)
      .sort((a, b) => b.forkCount - a.forkCount)
      .slice(0, maxrepos)
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

  const icons = chain(images)
    .filter(image => isIcon(image.path))
    .orderBy('size', 'desc')
    .value()

  // try to find a square image among the largest files
  for (let i = 0; i < 5; i++) {
    let icon = icons[i]
    if (icon) {
      const dimensions = await imageSize(icon.rawgit)
        .catch(err => {
          console.error('unable to fetch dimensions', icon)
          console.error(err)
        })
      if (dimensions) {
        dimensions.isSquare = dimensions.width && dimensions.height && dimensions.width === dimensions.height
      }
      Object.assign(icon, dimensions)
    }
  }

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

function isIcon (filename) {
  return filename.match(/icon/i) && filename.match(/\.png$/)
}
