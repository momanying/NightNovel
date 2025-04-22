export default {
  // Vue、TypeScript和JavaScript文件
  '*.{vue,js,ts,tsx,jsx}': [
    'eslint --fix',
  ],
  
  // CSS和SCSS文件
  '*.{css,scss}': [
    'prettier --write'
  ],
  
  // Markdown、JSON等文件
  '*.{md,json,yaml,yml}': [
    'prettier --write'
  ]
} 