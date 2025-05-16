import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { Router } from './Router';
import { theme } from './theme';
import { Routes, Route } from 'react-router-dom';
import { HeaderMegaMenu } from './components/Header/HeaderMegaMenu';
import { Datamenu } from './pages/Datamenu.page';
import { FooterLinks } from './components/Footer/FooterLinks';
import { BrowserRouter } from 'react-router-dom';
import { HomePage } from './pages/Home.page';
import './style.css';
import { Dataset } from './pages/Dataset.page';
import ScrollToTop from './components/ScrollToTop';
import { SigninPage } from './pages/Signin.page';
import { AddDatasetPage } from './pages/AddDataset.page';
import { AuthProvider } from './context/AuthContext';
import { TermsPage } from './pages/Terms.page';
import { PrivateRoute } from './components/PrivateRoute';
import { MyDatasetsPage } from './pages/MyDatasets.page';
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import { AdminPage } from './pages/Admin.page';
import { AdminHome } from './pages/AdminHome.page';
import { AdminDatasets } from './pages/AdminDatasets.page';
import { AdminDatasetRequests } from './pages/AdminDatasetRequests.page';
import { TagDatasets } from './pages/TagDatasets.page';
import { AdminTags } from './pages/AdminTags.page';
import { AdminTagRequests } from './pages/AdminTagRequests.page';
import { AdminUsers } from './pages/AdminUsers.page';
import { AdminShowcases } from './pages/AdminShowcases.page';
import { AdminShowcaseRequests } from './pages/AdminShowcaseRequests.page';
import { AddShowcase } from './pages/AddShowcase.page';
import { ShowcasesPage } from './pages/Showcases.page';
import { ShowcasePage } from './pages/Showcase.page';
import { PrivateAdminRoute } from './components/PrivateAdminRoute';
import { MyShowcasesPage } from './pages/MyShowcases.page';

export default function App() {
  return (
    <AuthProvider>
      <MantineProvider
        theme={{
          fontFamily: 'Public Sans, sans-serif',
          colors: {},
        }}
        defaultColorScheme="dark"
      >
        <BrowserRouter>
          <ScrollToTop />
          <Notifications />
          <HeaderMegaMenu />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/data-menu" element={<Datamenu />} />
            <Route path="/data-menu/tag/:tagId" element={<TagDatasets />} />
            <Route path="/dataset/:id" element={<Dataset />} />
            <Route path="/showcases" element={<ShowcasesPage />} />
            <Route path="/showcase/:id" element={<ShowcasePage />} />
            <Route path="/signin" element={<SigninPage />} />
            <Route path="/add-dataset" element={<PrivateRoute><AddDatasetPage /></PrivateRoute>} />
            <Route path="/edit-dataset/:id" element={<PrivateRoute><AddDatasetPage /></PrivateRoute>} />
            <Route path="/add-showcase" element={<PrivateRoute><AddShowcase /></PrivateRoute>} />
            <Route path="/edit-showcase/:id" element={<PrivateRoute><AddShowcase /></PrivateRoute>} />
            <Route path="/admin" element={<PrivateAdminRoute><AdminPage /></PrivateAdminRoute>}>
              <Route index element={<PrivateAdminRoute><AdminHome /></PrivateAdminRoute>} />
              <Route path="datasets" element={<PrivateAdminRoute><AdminDatasets /></PrivateAdminRoute>} />
              <Route path="datasets/requests" element={<PrivateAdminRoute><AdminDatasetRequests /></PrivateAdminRoute>} />
              <Route path="tags" element={<PrivateAdminRoute><AdminTags /></PrivateAdminRoute>} />
              <Route path="tags/requests" element={<PrivateAdminRoute><AdminTagRequests /></PrivateAdminRoute>} />
              <Route path="showcases" element={<PrivateAdminRoute><AdminShowcases /></PrivateAdminRoute>} />
              <Route path="showcases/requests" element={<PrivateAdminRoute><AdminShowcaseRequests /></PrivateAdminRoute>} />
              <Route path="users" element={<PrivateAdminRoute><AdminUsers /></PrivateAdminRoute>} />
            </Route>
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/my-datasets" element={<PrivateRoute><MyDatasetsPage /></PrivateRoute>} />
            <Route path="/my-showcases" element={<PrivateRoute><MyShowcasesPage /></PrivateRoute>} />
          </Routes>
          <FooterLinks />
        </BrowserRouter>
      </MantineProvider>
    </AuthProvider>
  );
}
