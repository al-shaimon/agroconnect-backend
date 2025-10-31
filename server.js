import app from './src/app.js';
import connectDB from './src/config/db.js';
import { config } from './src/config/config.js';

// Connect to database
connectDB();

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
});
