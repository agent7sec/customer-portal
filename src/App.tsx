import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { LoginPage } from './routes/LoginPage';
import { SignUpPage } from './routes/SignUpPage';
import { CallbackPage } from './routes/CallbackPage';
import { DashboardPage } from './routes/DashboardPage';
import { UploadPage } from './routes/UploadPage';
import { AnalysisDetailsPage } from './routes/AnalysisDetailsPage';
import { CertificatesPage } from './routes/CertificatesPage';
import { SubscriptionPage } from './routes/SubscriptionPage';
import { AccountSettingsPage } from './routes/AccountSettingsPage';
import { NotFoundPage } from './routes/NotFoundPage';

const theme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 6,
  },
};

function App() {
  return (
    <ErrorBoundary>
      <ConfigProvider theme={theme}>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/callback" element={<CallbackPage />} />

              {/* Protected Routes with Layout */}
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/analyses/:id" element={<AnalysisDetailsPage />} />
                <Route path="/certificates" element={<CertificatesPage />} />
                <Route path="/subscription" element={<SubscriptionPage />} />
                <Route path="/settings/*" element={<AccountSettingsPage />} />
              </Route>

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ConfigProvider>
    </ErrorBoundary>
  );
}

export default App;
