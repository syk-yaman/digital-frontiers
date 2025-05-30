import { IconBrandInstagram, IconBrandTwitter, IconBrandYoutube } from '@tabler/icons-react';
import { ActionIcon, Container, Group, Text } from '@mantine/core';
import { MantineLogo } from '@mantinex/mantine-logo';
import { Link as RouterLink } from 'react-router-dom';
import classes from './FooterLinks.module.css';

const data = [
  {
    title: 'Links',
    links: [
      { label: 'Home', link: '/' },
      { label: 'Data menu', link: '/data-menu' },
      { label: 'Showcases', link: '/showcases' },
      { label: 'About', link: '/about' },
      { label: 'Terms of Service', link: '/terms' },
    ],
  },
  {
    title: 'Open Source',
    links: [
      { label: 'GitHub repository', link: 'https://github.com/syk-yaman/digital-frontiers' },
      { label: 'GitHub discussions', link: 'https://github.com/syk-yaman/digital-frontiers/issues' },
    ],
  },
  {
    title: 'Stay in touch',
    links: [
      { label: 'Facebook', link: 'https://www.facebook.com/queenelizabetholympicpark' },
      { label: 'X', link: 'https://x.com/noordinarypark' },
      { label: 'Instagram', link: 'https://www.instagram.com/queenelizabetholympicpark/' },
      { label: 'YouTube', link: 'https://www.youtube.com/@NoOrdinaryPark' },
      { label: 'LinkedIn', link: 'https://www.linkedin.com/company/the-london-legacy-development-corporation/' },
      { label: 'TikTok', link: 'https://www.tiktok.com/@noordinarypark' },
    ],
  },
];

export function FooterLinks() {
  const groups = data.map((group) => {
    const links = group.links.map((link, index) => {
      // Use RouterLink for internal links, <a> for external
      const isExternal = link.link.startsWith('http');
      if (isExternal) {
        return (
          <Text<'a'>
            key={index}
            className={classes.link}
            component="a"
            href={link.link}
            target="_blank"
            rel="noopener noreferrer"
            c="white"
          >
            {link.label}
          </Text>
        );
      } else {
        return (
          <Text
            key={index}
            className={classes.link}
            component={RouterLink}
            to={link.link}
            c="white"
          >
            {link.label}
          </Text>
        );
      }
    });

    return (
      <div className={classes.wrapper} key={group.title}>
        <Text className={classes.title} c="white">{group.title}</Text>
        {links}
      </div>
    );
  });

  return (
    <footer style={{ backgroundColor: '#1F5754' }} className={classes.footer}>
      <Container className={classes.inner}>
        <div className={classes.logo}>
          <Text fw={700} c="white" size="lg">Digital Frontiers</Text>

          <Text size="xs" c="white" className={classes.description}>
            A Data-as-a-Service (DaaS) platform for the Queen Elizabeth Olympic Park Innovation District
          </Text>
        </div>
        <div className={classes.groups}>{groups}</div>
      </Container>
      <Container className={classes.afterFooter}>
        <Text c="white" size="sm">
          <span style={{ color: '#FFC747' }}>©</span> {new Date().getFullYear()} LLDC.  All rights reserved.
        </Text>
      </Container>
    </footer>
  );
}