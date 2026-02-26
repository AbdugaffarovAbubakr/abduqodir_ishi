const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const testRoutes = require('./routes/testRoutes');
const resultRoutes = require('./routes/resultRoutes');
const userRoutes = require('./routes/userRoutes');
const statsRoutes = require('./routes/statsRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/error');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/auth', authRoutes);
app.use('/devices', deviceRoutes);
app.use('/tests', testRoutes);
app.use('/results', resultRoutes);
app.use('/users', userRoutes);
app.use('/stats', statsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
