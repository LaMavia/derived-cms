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
  <link rel="stylesheet" href="/css/index.css" />
</head>
<body>
  <div id="root"></div>
  <script src="/Index.js"></script>
</body>
</html>
`

r.get('Index', '/*', ctx => {
  ctx.body = template
})

export default r
