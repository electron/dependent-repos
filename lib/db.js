const path = require('path')
module.exports = require('level')(path.join(__dirname, '../db'), {
  valueEncoding: 'json'
})
