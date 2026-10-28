const { createApp } = require('./app');
const port = process.env.PORT || 3300;
createApp().listen(port, '0.0.0.0', () => console.log('booking on http://localhost:' + port));
