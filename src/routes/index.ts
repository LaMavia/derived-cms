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
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
</head>
<body>
  <div id="root"></div>
  <script src="/Index.js"></script>
</body>
</html>
`

r.get('Index', '/*', ctx => {
  !ctx.body && (ctx.body = template)
})

export default r
