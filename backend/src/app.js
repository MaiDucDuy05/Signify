import express from 'express';
import apiRoutes from './routes/api.js';

export const app = express();

app.use(express.json());
app.use('/api', apiRoutes);