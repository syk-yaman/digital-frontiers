import { HeaderMegaMenu } from '@/components/Header/HeaderMegaMenu';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { Welcome } from '../components/Welcome/Welcome';
import { FooterLinks } from '@/components/Footer/FooterLinks';
import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.css';
import { Image } from '@mantine/core';

// ✅ Types are available here
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { LatLngTuple } from 'leaflet';
import { FeaturesGrid } from '@/components/FeaturesGrid/FeaturesGrid';

const position: LatLngTuple = [51.505, -0.09];

export function HomePage() {
  return (
    <>
      <HeaderMegaMenu />
      <Carousel withIndicators height={500}> 
        <Carousel.Slide>
          <Image
          src="https://placehold.co/1600x500/d0d0d0/FFF?text=Placeholder"
        />
        </Carousel.Slide>
        <Carousel.Slide><Image
          src="https://placehold.co/1600x500/d0d0d0/FFF?text=Placeholder"
        /></Carousel.Slide>
        <Carousel.Slide><Image
          src="https://placehold.co/1600x500/d0d0d0/FFF?text=Placeholder"
        /></Carousel.Slide>
        {/* ...other slides */}
      </Carousel>
      <FeaturesGrid/>
      <ColorSchemeToggle />
      <FooterLinks />
    </>
  );
}
