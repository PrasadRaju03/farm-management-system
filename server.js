import express from 'express';
import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import managerRoutes from './routes/managerRoutes.js';
import technicianRoutes from './routes/technicianRoutes.js';
import userRoutes from './routes/userRoutes.js';
import config from './config/env.js';

const app = express();

app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/manager', managerRoutes);
app.use('/technician', technicianRoutes);
app.use('/user', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
});

// Only start server if run directly (not imported as a module)
if (process.argv[1] === new URL(import.meta.url).pathname) {
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
}

export default app;