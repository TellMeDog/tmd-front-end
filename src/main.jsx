import { createRoot } from 'react-dom/client';
import Framework7 from 'framework7/lite-bundle';
import Framework7React from 'framework7-react';

// Framework7 core & react styles
import 'framework7/css/bundle';
import 'framework7-icons/css/framework7-icons.css';
import './css/app.css';

import App from './App.jsx';

Framework7.use(Framework7React);

createRoot(document.getElementById('root')).render(<App />);
