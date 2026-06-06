import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import MoreEvents from './pages/MoreEvents';
import EventDetails from './pages/EventDetails';
import EventDetailsNew from './pages/EventDetailsNew';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import Favorites from './pages/Favorites';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import DashboardSimple from './pages/DashboardSimple';
import DashboardMinimal from './pages/DashboardMinimal';
import DashboardFinal from './pages/DashboardFinal';
import DebugAuth from './pages/DebugAuth';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Accessibility from './pages/Accessibility';
import CookiePolicy from './pages/CookiePolicy';
import AddEvent from './pages/AddEvent';
import EditEvent from './pages/EditEvent';
import MyTickets from './pages/MyTickets';
import Notifications from './pages/Notifications';
import ManageLayouts from './pages/admin/ManageLayouts';
import CreateLayout from './pages/admin/CreateLayout';
import EditLayout from './pages/admin/EditLayout';
import ManageDiscounts from './pages/admin/ManageDiscounts';
import CreateDiscount from './pages/admin/CreateDiscount';
import EditDiscount from './pages/admin/EditDiscount';
import UpgradePage from './pages/UpgradePage';
import ProtectedRoute from './guards/ProtectedRoute';
import AdminRoute from './guards/AdminRoute';
import { setCartQueryClient } from './store/cartStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

setCartQueryClient(queryClient);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Standalone pages (outside Layout) */}
          <Route path="/add-event" element={
            <AdminRoute>
              <AddEvent />
            </AdminRoute>
          } />
          <Route path="/edit-event/:eventId" element={
            <AdminRoute>
              <EditEvent />
            </AdminRoute>
          } />
          <Route path="/admin/layouts" element={
            <AdminRoute>
              <ManageLayouts />
            </AdminRoute>
          } />
          <Route path="/admin/layouts/create" element={
            <AdminRoute>
              <CreateLayout />
            </AdminRoute>
          } />
          <Route path="/admin/layouts/:layoutId" element={
            <AdminRoute>
              <EditLayout />
            </AdminRoute>
          } />
          <Route path="/admin/discounts" element={
            <AdminRoute>
              <ManageDiscounts />
            </AdminRoute>
          } />
          <Route path="/admin/discounts/create" element={
            <AdminRoute>
              <CreateDiscount />
            </AdminRoute>
          } />
          <Route path="/admin/discounts/:id/edit" element={
            <AdminRoute>
              <EditDiscount />
            </AdminRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/upgrade/:token" element={<UpgradePage />} />

          {/* Main app with Layout */}
          <Route path="/" element={<Layout />}>
            {/* Routes will be added incrementally as we migrate pages */}
            <Route index element={<Home />} />
            <Route path="/more-events" element={<MoreEvents />} />
            <Route path="/event/:eventId" element={<EventDetailsNew />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/favourites" element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            } />
            <Route path="/cart" element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            } />
            <Route path="/my-tickets" element={
              <ProtectedRoute>
                <MyTickets />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            } />
            <Route path="/debug-auth" element={<DebugAuth />} />

            {/* Legal Pages */}
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/accessibility" element={<Accessibility />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />

            {/* Catch all - 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
