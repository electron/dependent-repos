const db = require('.')
const {chain} = require('lodash')
let repos = []

db.createReadStream()
  .on('data', ({key:repoName, value:repo}) => {
    if (repo.icons && repo.icons.length) repos.push(repo)
  })
  .on('end', async () => {
    repos      
      // .sort((a, b) => b.forkCount - a.forkCount)
      .sort((a, b) => b.forkCount - a.forkCount)
      .slice(0, 10)
      .forEach(repo => {
        const {nameWithOwner, icons} = repo
        repo.icon = icons.find(icon => icon.isSquare)
        if (repo.icon) render(repo)
      })
  })

function render (repo) {
  const {nameWithOwner, icon, description, forkCount} = repo
  const productName = (repo.packageJSON && repo.packageJSON.productName) || ''

  console.log(`
### [${nameWithOwner}](https://github/com/${nameWithOwner}) ${productName}

> ${description}

${forkCount} forks

![](${icon.rawgit})

\`\`\`json
${JSON.stringify(repo, null, 2)}
\`\`\`

---
`)
}