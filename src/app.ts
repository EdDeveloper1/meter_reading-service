import express from 'express';
import bodyParser from 'body-parser';
import measureRoutes from './routes/measureRoutes';
import connectDB from './database';

const app = express();
app.use(bodyParser.json()); 

app.use(express.json({ limit: '100mb' })); 
app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use('/api', measureRoutes);

connectDB();

export default app;
