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
import { Dataitem } from './pages/Dataitem.page';
import ScrollToTop from './components/ScrollToTop';
import { SigninPage } from './pages/Signin.page';
import { AddDataitemPage } from './pages/AddDataitem.page';
import { NavbarNested } from './pages/NavbarNested';

export default function App() {
  return (

    <MantineProvider
      theme=
      {{
        fontFamily: 'Public Sans, sans-serif',
        colors: {
        },
      }}
      defaultColorScheme="dark" >
      <BrowserRouter>
        <ScrollToTop />
        <HeaderMegaMenu />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/data-menu" element={<Datamenu />} />
          <Route path="/data-item/:id" element={<Dataitem />} />
          <Route path='/signin' element={<SigninPage />} />
          <Route path="/add-data-item" element={<AddDataitemPage />} />
          <Route path="/admin" element={<NavbarNested />} />
        </Routes>
        <FooterLinks />
      </BrowserRouter>
    </MantineProvider>
  );
}
