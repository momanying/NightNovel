const path = require('path')

module.exports = {
    apps: [
      {
        name: 'night-novel',
        script: '.output/server/index.mjs',
        cwd: path.join(__dirname),
        env: {
          NODE_ENV: 'production',
          JWT_SECRET: 'your-jwt-secret-here'
        }
      }
    ]
  }
  