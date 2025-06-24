const path = require('path')

module.exports = {
    apps: [
      {
        name: 'night-novel',
        script: '.output/server/index.mjs',
        cwd: path.join(__dirname),
        env: {
          NODE_ENV: 'production',
          JWT_SECRET: '20192128',
          NITRO_HOST: '127.0.0.1',
          NITRO_PORT: '3000'
        }
      }
    ]
  }