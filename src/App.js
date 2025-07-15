import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Ensure the CSS is imported

import { MessageProvider } from "./contexts/MessageContext";

//wrapers

import ClientProtectedRoute from './ClientProtectedRoute';
import ProfessionalProtectedRoute from './ProfessionalProtectedRoute';



// Import pages
import HomePage from './pages/client/HomePage';
import AppStart from './pages/client/AppStart';
import HelpForm from './pages/client/HelpForm';
import AboutForm from './pages/client/AboutForm';
import SummaryForm from './pages/client/SummaryForm';
import SMSVerificationC from './pages/client/SMSVerification';
import RequestDetailsPage from './pages/client/RequestDetailsPage';
import ClientDashboard from './pages/client/Dashboard';
import MyRequests from './pages/client/MyRequests';
import ClosedRequests from './pages/client/ClosedRequests';
import ProfessionalsList from './pages/client/ProfessionalList';
import ProfilePage from './pages/client/ProfilePage';
import SignInPage from "./pages/client/SignInPage";
import RatingPage from "./pages/client/RatingPage";


import ProfessionalPhoneScreen from './pages/professionals/PhoneScreen';
import SMSVerification from './pages/professionals/SMSVerification';
import ProfessionalRegistration from './pages/professionals/ProfessionalRegistration';
import ExpertInterface from './pages/professionals/ExpertInterface';
import BusinessCard from './pages/professionals/BusinessCard';
import EditProfessionalSettings from './pages/professionals/EditProfessionalSettings';
import ExpertMainPage from './pages/professionals/ExpertMainPage';
import AppWrapper from "./pages/AppWrapper"; // ✅ Import AppWrapper

import ExplainScreen from './pages/professionals/ExplainScreen';
import ProfessionalRequestDetailsPage from './pages/professionals/ProfessionalRequestDetailsPage';
import NewRequestsPage from './pages/professionals/NewRequestsPage';
import InProcessRequestsPage from './pages/professionals/InProcessRequestsPage';
import MineRequestsPage from './pages/professionals/MineRequestsPage';
import ClosedRequestsPage from './pages/professionals/ClosedRequestsPage';
import OnboardingLandingPage from './pages/OnboardingLandingPage'; // Import the new page

function App() {
  return (
    <MessageProvider>

    <Router>
            <AppWrapper> {/* ✅ Wrap the whole app inside AppWrapper */}

      <LanguageProvider>
        <Routes>
          {/* Client Side Routes */}
          <Route path="/" element={<AppStart />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/main" element={<HelpForm />} />
          <Route path="/about" element={<AboutForm />} />
          <Route path="/summary" element={<SummaryForm />} />
          <Route path="/sms" element={<SMSVerificationC />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/request/rate/:id" element={<RatingPage />} />

          {/* New Onboarding Landing Page Route */}
          <Route path="/onboarding/:id" element={<OnboardingLandingPage />} />

          /////////////////////// protected///////////////////


          <Route
            path="/dashboard/my-requests"
            element={
              <ClientProtectedRoute>
                <MyRequests />
              </ClientProtectedRoute>
            }
          />

          <Route
            path="/dashboard/closed-requests"
            element={
              <ClientProtectedRoute>
                <ClosedRequests />
              </ClientProtectedRoute>
            }
          />

           <Route
            path="/request"
            element={
              <ClientProtectedRoute>
                <RequestDetailsPage />
              </ClientProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ClientProtectedRoute>
                <ClientDashboard />
              </ClientProtectedRoute>
            }
          />


          {/* Professional Side Routes */}
          <Route path="/pro/enter" element={<ProfessionalPhoneScreen />} />
          <Route path="/pro/sms-verification" element={<SMSVerification />} />
          <Route path="/pro/register" element={<ProfessionalRegistration />} />
          <Route path="/pro/bs-card" element={<BusinessCard />} />
          <Route path="/pro/edit-settings" element={<EditProfessionalSettings />} />
          <Route path="/pro/expert-main" element={<ExpertMainPage />} />
          <Route path="/pro/explain" element={<ExplainScreen />} />

///////////////////protected///////////////
             <Route
              path="/pro/expert-interface"
              element={
                <ProfessionalProtectedRoute>
                  <ExpertInterface />
                </ProfessionalProtectedRoute>
              }
            />

            <Route
              path="/pro/requests/new"
              element={
                <ProfessionalProtectedRoute>
                  <NewRequestsPage />
                </ProfessionalProtectedRoute>
              }
            />

            <Route
              path="/pro/requests/in-process"
              element={
                <ProfessionalProtectedRoute>
                  <InProcessRequestsPage />
                </ProfessionalProtectedRoute>
              }
            />

            <Route
              path="/pro/requests/mine"
              element={
                <ProfessionalProtectedRoute>
                  <MineRequestsPage />
                </ProfessionalProtectedRoute>
              }
            />

            <Route
              path="/pro/requests/closed"
              element={
                <ProfessionalProtectedRoute>
                  <ClosedRequestsPage />
                </ProfessionalProtectedRoute>
              }
            />

            <Route
              path="/pro/requests/:id"
              element={
                <ProfessionalProtectedRoute>
                  <ProfessionalRequestDetailsPage />
                </ProfessionalProtectedRoute>
              }
            />

        </Routes>
      </LanguageProvider>
      {/* Place ToastContainer here */}
      <ToastContainer position="top-right" autoClose={5000} style={{position: "absolute"}} />

      </AppWrapper>

    </Router>
    </MessageProvider>

  );
}

export default App;
