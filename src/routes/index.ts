import Router from 'koa-router'

const r = new Router()

const template = `
<!DOCTYPE html>  
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>DerivedCMS</title>
  <link rel="icon" href="/static/images/icon.png">
  <link rel="stylesheet" href="/static/css/index.css" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
</head>
<body>
  <div id="root"></div>
  <script src="/static/Index.js"></script>
</body>
</html>
`.replace(/>\s+/, ">")

r.get('Index', '/*', async ctx => {
  ctx.body = template
})

export default r
