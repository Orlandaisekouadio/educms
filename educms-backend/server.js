require('dotenv').config();
const app = require('./src/app');
const { testConnection } = require('./src/config/database');
require('./src/config/redis');

const PORT = parseInt(process.env.PORT) || 5000;

const start = async () => {
  const ok = await testConnection();
  if (!ok) {
    console.error('Cannot start without database. Check DB_* env vars.');
    process.exit(1);
  }
  app.listen(PORT, () => console.log(`EduCMS API listening on port ${PORT}`));
};

if (require.main === module) start();

module.exports = { app, start };
