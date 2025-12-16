import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Listings = lazy(() => import('./pages/Listings'));
const ListingDetail = lazy(() => import('./pages/ListingDetail'));
const MapView = lazy(() => import('./pages/MapView'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CreateListing = lazy(() => import('./pages/CreateListing'));
const EditListing = lazy(() => import('./pages/EditListing'));
const RoommateFinder = lazy(() => import('./pages/RoommateFinder'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const CreateBlog = lazy(() => import('./pages/CreateBlog'));
const Profile = lazy(() => import('./pages/Profile'));
const SavedListings = lazy(() => import('./pages/SavedListings'));
const StayedListings = lazy(() => import('./pages/StayedListings'));
const SavedRoommates = lazy(() => import('./pages/SavedRoommates'));
const Messages = lazy(() => import('./pages/Messages'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const About = lazy(() => import('./pages/About'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const FAQ = lazy(() => import('./pages/FAQ'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/listings" element={<Listings />} />
                <Route path="/listings/:id" element={<ListingDetail />} />
                <Route path="/map" element={<MapView />} />
                <Route path="/roommate-finder" element={<RoommateFinder />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogPost />} />
                <Route path="/about" element={<About />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/faq" element={<FAQ />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/create-listing" element={
                  <ProtectedRoute landlordOnly>
                    <CreateListing />
                  </ProtectedRoute>
                } />
                <Route path="/edit-listing/:id" element={
                  <ProtectedRoute landlordOnly>
                    <EditListing />
                  </ProtectedRoute>
                } />
                <Route path="/create-blog" element={
                  <ProtectedRoute>
                    <CreateBlog />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/saved" element={
                  <ProtectedRoute>
                    <SavedListings />
                  </ProtectedRoute>
                } />
                <Route path="/stayed" element={
                  <ProtectedRoute>
                    <StayedListings />
                  </ProtectedRoute>
                } />
                <Route path="/saved-roommates" element={
                  <ProtectedRoute>
                    <SavedRoommates />
                  </ProtectedRoute>
                } />
                <Route path="/messages" element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                } />
                <Route path="/messages/:listingId/:recipientId" element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                } />
                <Route path="/messages/:recipientId" element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <AdminPanel />
                  </ProtectedRoute>
                } />
              </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
          <Toaster position="top-right" />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;








