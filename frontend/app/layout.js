import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';

export const metadata = {
  title: 'Personal Tracker — Centralized SaaS Management System',
  description: 'Premium personal management system for productivity, finances, habits, fitness, travel, and creative client studio.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#efefee] text-[#0f110f] antialiased">
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

