// server.js
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const customRoutes = require('./custom-routes');

server.use(middlewares);
server.use(customRoutes);
server.use('', router);
server.listen(process.env.PORT || 5000, () => {
  console.log('JSON Server is running');
});
