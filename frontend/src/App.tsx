import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import CreateSharePage from './pages/CreateShare';
import ViewSharePage from './pages/ViewShare';
import AdminPage from './pages/Admin';
import HomePage from './pages/Home';
import { ThemeSwitcher } from './components/ThemeSwitcher';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <ThemeSwitcher />
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'font-sans',
            style: {
              background: '#fff',
              color: '#333',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreateSharePage />} />
          <Route path="/share/:id" element={<ViewSharePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
