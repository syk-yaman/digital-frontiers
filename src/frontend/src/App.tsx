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

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <BrowserRouter>
        <HeaderMegaMenu />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/data-menu" element={<Datamenu />} />
        </Routes>
        <FooterLinks />
      </BrowserRouter>
    </MantineProvider>
  );
}
