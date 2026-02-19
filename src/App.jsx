import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Inquiries from './pages/Inquiries';
import MasterListWrapper from './pages/MasterListWrapper';
import Projects from './pages/Projects';
import Contacts from './pages/Contacts';
import Loans from './pages/Loans';
import Tasks from './pages/Tasks';
import Deals from './pages/Deals';
import Bookings from './pages/Bookings';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import SubUsers from './pages/SubUsers';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { DataProvider } from './context/DataContext';

import UserDevices from './pages/UserDevices';
import PaymentDetails from './pages/PaymentDetails';
import Permissions from './pages/Permissions';
import ChangePassword from './pages/ChangePassword';
import WhatsAppIntegration from './pages/WhatsAppIntegration';
import GenericPage from './pages/GenericPage';
import DataMigration from './pages/DataMigration';
import ViewedProperties from './pages/ViewedProperties';
import ViewedInquiries from './pages/ViewedInquiries';
import AdvtBooster from './pages/AdvtBooster';

function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="searchProperty" element={<Properties />} />
            <Route path="viewProperty" element={<ViewedProperties />} />
            <Route path="addproperty" element={<Properties />} />
            <Route path="projects" element={<Projects />} />
            <Route path="searchInquiry" element={<Inquiries />} />
            <Route path="viewInquiry" element={<ViewedInquiries />} />
            <Route path="contact" element={<Contacts />} />
            <Route path="loans" element={<Loans />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="deals" element={<Deals />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="profile" element={<Profile />} />
            <Route path="subuser" element={<SubUsers />} />
            <Route path="settings" element={<Settings />} />
            <Route path="permission" element={<Permissions />} />
            <Route path="paymentdetail" element={<PaymentDetails />} />
            <Route path="userdevice" element={<UserDevices />} />
            <Route path="changepassword" element={<ChangePassword />} />
            <Route path="arealist" element={<MasterListWrapper title="Area" type="areas" />} />
            <Route path="subtypelist" element={<MasterListWrapper title="Sub Type" type="subTypes" />} />
            <Route path="societyList" element={<MasterListWrapper title="Society" type="societies" />} />
            <Route path="featureList" element={<MasterListWrapper title="Feature" type="features" />} />
            <Route path="amenities" element={<MasterListWrapper title="Amenity" type="amenities" />} />
            <Route path="sources" element={<MasterListWrapper title="Source" type="sources" />} />
            <Route path="contactgroup" element={<MasterListWrapper title="Contact Group" type="contactGroups" />} />
            <Route path="commission" element={<MasterListWrapper title="Commission" type="commissions" />} />
            <Route path="whatsapp" element={<WhatsAppIntegration />} />
            <Route path="datamigration" element={<DataMigration />} />
            <Route
              path="bulkProperty"
              element={
                <GenericPage
                  title="Bulk Property"
                  description="For bulk property import, contact support at +91 9723112599 or support@realtorapp.io."
                />
              }
            />
            <Route
              path="bulkInquiry"
              element={
                <GenericPage
                  title="Bulk Inquiry"
                  description="🚨 Server Down. Our servers are currently unreachable. Please try again later."
                />
              }
            />
            <Route
              path="detailSupport/videoTutorials"
              element={
                <GenericPage
                  title="Video Tutorials"
                  description="🚨 Server Down. Our servers are currently unreachable. Please try again later."
                />
              }
            />
            <Route
              path="detailSupport/userRoles"
              element={
                <GenericPage
                  title="User Roles"
                  description="🚨 Server Down. Our servers are currently unreachable. Please try again later."
                />
              }
            />
            <Route
              path="detailSupport/accountOverview"
              element={
                <GenericPage
                  title="Account Overview"
                  description="🚨 Server Down. Our servers are currently unreachable. Please try again later."
                />
              }
            />
            <Route
              path="detailSupport/configuration"
              element={
                <GenericPage
                  title="Configuration"
                  description="🚨 Server Down. Our servers are currently unreachable. Please try again later."
                />
              }
            />
            <Route
              path="detailSupport/addingProperties"
              element={
                <GenericPage
                  title="Adding Properties"
                  description="🚨 Server Down. Our servers are currently unreachable. Please try again later."
                />
              }
            />
            <Route
              path="policy/PrivacyPolicy"
              element={
                <GenericPage
                  title="Privacy Policy"
                  description={`
                    **1. Information We Collect**
                    We collect personal information such as name, email address, phone number, and property details when you use our services.

                    **2. How We Use Your Information**
                    - To provide and maintain our Service
                    - To notify you about changes to our Service
                    - To provide customer support
                    - To monitor the usage of the Service

                    **3. Data Security**
                    We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it.

                    **4. Changes to This Privacy Policy**
                    We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.

                    **Contact Us**
                    If you have any questions about this Privacy Policy, please contact us.
                  `}
                />
              }
            />
            <Route
              path="policy/RefundPolicy"
              element={
                <GenericPage
                  title="Refund Policy"
                  description={`
                    **Subscription Refunds**
                    Refunds for subscription cancellations will be processed on a pro-rata basis within 7-10 business days.

                    **Service Issues**
                    If you experience technical issues preventing access to the service for more than 24 hours, you may be eligible for a credit.

                    **Contact Support**
                    For any billing queries, please reach out to our support team.
                  `}
                />
              }
            />
            <Route
              path="policy/Terms&Conditions"
              element={
                <GenericPage
                  title="Terms & Conditions"
                  description={`
                    **1. Acceptance of Terms**
                    By accessing or using our service, you agree to be bound by these Terms.

                    **2. Accounts**
                    When you create an account with us, you must provide us information that is accurate, complete, and current at all times.

                    **3. Intellectual Property**
                    The Service and its original content, features and functionality are and will remain the exclusive property of Real Dave Inc.

                    **4. Termination**
                    We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever.
                  `}
                />
              }
            />
            <Route
              path="policy/Shipping"
              element={
                <GenericPage
                  title="Shipping Policy"
                  description={`
                    **Digital Delivery**
                    This is a SaaS (Software as a Service) product. No physical goods are shipped.

                    **Activation**
                    Account activation occurs immediately upon successful payment verification.

                    **Access**
                    You will receive login credentials via email instantly after registration.
                  `}
                />
              }
            />
            <Route
              path="support"
              element={
                <GenericPage
                  title="Support"
                  description="For support, call +91 9423127235, WhatsApp +91 9423127235, or email support@training@aawas.co.in."
                />
              }
            />
            <Route
              path="advtBooster"
              element={<AdvtBooster />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}

export default App;
