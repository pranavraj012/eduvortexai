import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Make sure React is in scope
const root = createRoot(document.getElementById('root')!);
root.render(<App />);
