进入client目录，输入yarn，配置环境；yarn run dev；
进入server目录，输入yarn，配置环境；yarn run dev；

注意：如果出现了bug，需要检查server中的package.json的这部分是否如下：
"scripts": {
    "dev": "node index.js"
  },