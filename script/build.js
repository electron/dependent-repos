#!/usr/bin/env node

require('dotenv-safe').load()

const fs = require('fs')
const path = require('path')
const repoNames = fs.readFileSync(path.join(__dirname, '../electron-dependents.txt'), 'utf8')
  .split('\n')
const db = require('../lib/db')
const humanInterval = require('human-interval')
const ellipsize = require('ellipsize')
const coolStory = require('cool-story-repo')
const Bottleneck = require('bottleneck')
const limiter = new Bottleneck({
  maxConcurrent: 5,
  minTime: 500
})

const freshRepos = []
const deadRepos = []
const jobStartTime = Date.now()
const jobDuration = humanInterval('50 minutes')
const repoTTL = humanInterval('80 days')

db.createReadStream()
.on('data', ({key: repoName, value: repo}) => {
  if (!repo) return

  if (repo.status === 404) {
    deadRepos.push(repoName)
    return
  }

  if (!repo.fetchedAt) return
  if (new Date(repo.fetchedAt).getTime() + repoTTL < Date.now()) return
  freshRepos.push(repoName)
})
.on('end', () => {
  console.log(`${repoNames.length} total repos dependent on electron`)
  console.log(`${freshRepos.length} up-to-date repos already in database`)
  console.log(`${deadRepos.length} dead repos already in database`)
  const reposToUpdate = repoNames
    .filter(repoName => !freshRepos.includes(repoName) && !deadRepos.includes(repoName))
  console.log(`${reposToUpdate.length} outdated repos`)
  console.log('---------------------------------------')

  reposToUpdate.forEach(repoName => {
    limiter.schedule(updateRepo, repoName)
  })

  limiter
    .on('idle', () => {
      console.log('done')
      process.exit()
    })
    .on('error', (err) => {
      console.log('bottleneck error', err)
      process.exit()
    })
})

async function updateRepo (repoName) {
  if (Date.now() > jobStartTime + jobDuration) {
    console.log('time is up! exiting')
    process.exit()
  }

  try {
    const repo = await coolStory(repoName)
    const result = await db.put(repoName, repo)
    console.log(repoName, '(good)')
    return result
  } catch (err) {
    const result = await db.put(repoName, {
      fetchedAt: new Date(),
      status: 404
    })
    console.error(repoName, ellipsize(err.message, 60))
  }
}
