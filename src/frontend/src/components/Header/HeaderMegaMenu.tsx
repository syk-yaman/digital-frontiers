import {
  IconBook,
  IconChartPie3,
  IconChevronDown,
  IconCode,
  IconCoin,
  IconFingerprint,
  IconNotification,
  IconPlane,
  IconPlant,
  IconBuilding,
  IconCat,
  IconPower,
  IconSunElectricity,
  IconHeart,
  IconMenu,
  IconMenu2,
  IconMenu3,
  IconCategory,
  IconLayoutDashboard,
  IconLayoutDashboardFilled,
  IconPhoto,
  IconMessageCircle,
  IconSearch,
  IconSettings,
  IconDatabase,
  IconHome,
  IconNews,
  IconLockAccess,
  IconCircleDashedCheck,
  IconLogout,
  IconUser,
  IconPassword,
  IconLock,
  IconUserCircle,
  IconList,
} from '@tabler/icons-react';
import {
  ActionIcon,
  Anchor,
  Avatar,
  Box,
  Breadcrumbs,
  Burger,
  Button,
  Center,
  Collapse,
  Divider,
  Drawer,
  Group,
  HoverCard,
  Menu,
  Modal,
  ScrollArea,
  SimpleGrid,
  Text,
  ThemeIcon,
  UnstyledButton,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { NavLink, useLocation } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import classes from './HeaderMegaMenu.module.css';
import { changelog, version } from './changelog';
import cx from 'clsx';
import IconManager from '@deck.gl/layers/dist/icon-layer/icon-manager';

const mockdata = [
  {
    icon: IconPlane,
    title: 'Aircraft',
    description: 'Explore live data on aircraft activity over Queen Elizabeth Park.',
  },
  {
    icon: IconPlant,
    title: 'Environment & Nature',
    description: 'Insights into the park’s natural ecosystems, flora, and fauna.',
  },
  {
    icon: IconBuilding,
    title: 'Built Environment',
    description: 'Detailed data on structures and infrastructure within the park.',
  },
  {
    icon: IconCat,
    title: 'People',
    description: 'Discover visitor trends and demographic insights in the park.',
  },
  {
    icon: IconSunElectricity,
    title: 'Solar Power',
    description: 'Comprehensive analytics and visualizations of park data.',
  },
  {
    icon: IconList,
    title: 'Show all',
  }
];

export function HeaderMegaMenu() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const [dashboardMenuOpened, setDashboardMenuOpened] = useState(false);
  const [adminMenuOpened, setAdminMenuOpened] = useState(false);

  const theme = useMantineTheme();

  // Detect current route
  const location = useLocation();
  const isHome = location.pathname === '/';

  const authContext = useContext(AuthContext);

  const isAuthenticated = authContext?.isAuthenticated;
  const user = authContext?.user;
  const logout = authContext?.logout;

  const links = mockdata.map((item) => (
    <UnstyledButton className={classes.subLink} key={item.title}>
      <Group wrap="nowrap" >
        <ThemeIcon size={34} variant="default" radius="md">
          <item.icon size={22} color={'#FFC747'} />
        </ThemeIcon>
        <Text size="sm"  {...item.title.includes('all') ? { color: '#FFC747', fw: 500, td: 'underline' } : { fw: 500 }}>
          {item.title}
        </Text>
      </Group>
    </UnstyledButton>
  ));

  const myDashboardMenuItems = (
    <>
      <Menu.Item leftSection={<IconHome size={18} />}>
        Home
      </Menu.Item>
      <Menu.Item component={NavLink}
        to="/my-datasets" leftSection={<IconDatabase size={18} />}>
        My datasets
      </Menu.Item>
      <Menu.Item leftSection={<IconNews size={18} />}>
        My showcases
      </Menu.Item>
      <Menu.Item leftSection={<IconCircleDashedCheck size={18} />}>
        My access requests
      </Menu.Item>
    </>
  );

  const userMenuItems = (
    <>
      <Menu.Item leftSection={<IconUser size={18} />}>
        Profile
      </Menu.Item>
      <Menu.Item leftSection={<IconLock size={18} />}>
        Change password
      </Menu.Item>
      <Menu.Item component={NavLink}
        onClick={logout} to={''} leftSection={<IconLogout size={18} />}>
        Sign out
      </Menu.Item>
    </>
  );

  return (
    <Box
      //style={{ backgroundColor: '#94d1f1' }}
      style={{ backgroundColor: 'tansparent' }}
    >
      <header className={classes.header}
        //style={{ borderBottom: '#173B3B' }}
        style={{
          // borderBottom: 'none',
          // backgroundColor: 'transparent',
          borderBottom: isHome ? 'none' : `none`,
          backgroundColor: isHome ? 'transparent' : '#1F5754',
          position: isHome ? 'absolute' : 'relative', // Ensure the header stays on top of the background image
          width: '100%',
          zIndex: 1000,
        }}
      >
        <Group justify="space-between" h="100%">
          <a href="/" className="logo" style={{ display: 'flex', alignItems: 'normal', textDecoration: 'none' }}>
            <svg
              aria-label="Shift logo"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 254 65"
              style={{ fill: '#ffffff', height: '22px', width: 'auto' }} // Adjust styling as needed
            >
              <path className="s1" d="M.027 19.254v22.873H18.14V28.401h27.214v-9.147H.027Z"></path>
              <path className="s2" d="M27.241 55.853H0V65h45.355V42.127h-18.14l.026 13.726Z"></path>
              <path className="h" d="M97.492 19.254V65H83.885V46.7H65.76V65H52.153V19.254H65.76v18.3h18.141v-18.3h13.591Z"></path>
              <path
                className="i1"
                d="M126.987 38.563c3.779 0 7.473-1.13 10.616-3.248a19.241 19.241 0 0 0 7.04-8.649 19.437 19.437 0 0 0 1.093-11.136 19.344 19.344 0 0 0-5.224-9.873 19.066 19.066 0 0 0-9.78-5.283A18.963 18.963 0 0 0 119.69 1.46a19.147 19.147 0 0 0-8.583 7.09 19.395 19.395 0 0 0-3.235 10.704 19.438 19.438 0 0 0 1.447 7.387 19.299 19.299 0 0 0 4.142 6.265 19.1 19.1 0 0 0 6.205 4.186c2.32.971 4.808 1.47 7.321 1.47Z"
              ></path>
              <path className="i2" d="M104.328 46.7V65h45.333V46.7h-45.333Z"></path>
              <path className="f" d="M201.831 28.401v-9.147h-45.366V65h13.634V46.7h29.478v-9.146h-29.478V28.4h31.732Z"></path>
              <path className="t" d="M254 19.254h-45.377v9.147h15.834V65h13.607V28.401H254z"></path>
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 2 22"
              style={{
                display: 'inline-block',
                marginLeft: '10px', /* Adjust spacing between logo and line */
                height: '22px',
                width: '2px',
                fill: '#ffffff',
                marginTop: '2px',
                backgroundColor: '#ffffff', /* Matches logo's color */
              }}
            >
              <rect width="2" height="22" fill='#FFC747' />
            </svg>
            <span
              style={{
                marginLeft: '10px', // Adjust spacing between line and text
                color: '#ffffff', // Text color
                fontSize: '17px', // Adjust text size
                fontWeight: 'normal', // Make the text bold
                textDecoration: 'none', // Remove underline
              }}

            >
              Digital Frontiers
            </span>
          </a>

          {/* <Text fw={700} size="lg">
            Digital Frontiers
          </Text> */}

          <Group h="100%" gap={0} visibleFrom="sm">
            <NavLink to="/" className={classes.link}>
              Home
            </NavLink>

            <HoverCard
              openDelay={100} closeDelay={400}
              width={600} position="bottom"
              radius="md" shadow="md"
              transitionProps={{ transition: 'fade-down' }}
              offset={20}
              withinPortal>
              <HoverCard.Target>
                <NavLink to="/data-menu" className={classes.link}>
                  <Center inline>
                    <Box component="span" mr={5}>
                      Data menu
                    </Box>
                    <IconChevronDown size={16} color={'#FFC747'} />
                  </Center>
                </NavLink>
              </HoverCard.Target>

              <HoverCard.Dropdown style={{ overflow: 'hidden' }}>
                <Group justify="space-between" px="md">
                  <Text fw={500}>Available tags</Text>
                </Group>
                <Divider color={'#888888'} my="xs" size={'xs'} />
                <SimpleGrid cols={2} spacing={0}>
                  {links}
                </SimpleGrid>
              </HoverCard.Dropdown>
            </HoverCard>

            <NavLink to="/showcases" className={classes.link}>
              Showcases
            </NavLink>
            <NavLink to="/about" className={classes.link}>
              About
            </NavLink>
          </Group>

          <Group >
            <Button
              variant="outline"
              style={{
                color: '#ffffffdd',
                backgroundColor: 'transparent',
                border: '1px solid #ffffff00',
                fontWeight: 'normal',
                padding: '2px 0px',
                transition: 'all 0.3s ease',
                fontSize: '13px'
              }}
              onClick={openModal}>
              {version}
            </Button>
            {isAuthenticated && user?.isAdmin && (<UnstyledButton component={NavLink}
              to="/admin"
              className={cx(classes.menu, { [classes.menuActive]: adminMenuOpened })}
            >
              <Group gap={7}>
                <IconSettings radius="xl" size={24} />
                <Text fw={500} size="sm" lh={1} mr={3}>
                  Admin
                </Text>
              </Group>
            </UnstyledButton>)}
            {isAuthenticated && (<Menu
              width={260}
              position="bottom-end"
              transitionProps={{ transition: 'pop-top-right' }}
              onClose={() => setDashboardMenuOpened(false)}
              onOpen={() => setDashboardMenuOpened(true)}
              withinPortal
              offset={20}
              trigger="hover" openDelay={100} closeDelay={100}
            >
              <Menu.Target>
                <UnstyledButton
                  className={cx(classes.menu, { [classes.menuActive]: dashboardMenuOpened })}
                >
                  <Group gap={7}>
                    <IconLayoutDashboardFilled radius="xl" size={24} />
                    <Text fw={500} size="sm" lh={1} mr={3}>
                      My dashboard
                    </Text>
                    <IconChevronDown size={12} stroke={1.5} />
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown >{myDashboardMenuItems}</Menu.Dropdown>
            </Menu>)}
            {isAuthenticated ? (
              <Menu
                width={260}
                position="bottom-end"
                transitionProps={{ transition: 'pop-top-right' }}
                onClose={() => setUserMenuOpened(false)}
                onOpen={() => setUserMenuOpened(true)}
                trigger="hover" openDelay={100} closeDelay={100}
                offset={20}
                withinPortal
              >
                <Menu.Target>
                  <UnstyledButton
                    className={cx(classes.menu, { [classes.menuActive]: userMenuOpened })}
                  >
                    <Group gap={7}>
                      <IconUserCircle radius="xl" size={24} />
                      <Text fw={500} size="sm" lh={1} mr={3}>
                        {user?.firstName ? user.firstName : 'User'}
                      </Text>
                      <IconChevronDown size={12} stroke={1.5} />
                    </Group>
                  </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown >{userMenuItems}</Menu.Dropdown>
              </Menu>
            ) : (
              <Button
                variant="outline"
                style={{ color: '#ffffff', border: '1px solid #fff' }}
                component={NavLink}
                to="/signin"
              >
                Sign In
              </Button>
            )}

          </Group>
        </Group>
      </header>
      <Modal opened={modalOpened} onClose={closeModal} c='#FFC747' className={classes.modalcustom} // Use the custom class here
        title="Changelog" size="md" zIndex={999999} centered>
        {changelog.map((log) => (
          <Box key={log.version} mb="sm">
            <Text c='white' fw={700} mb="xs">
              {log.version}
            </Text>
            <ul>
              {log.changes.map((change, index) => (
                <li key={index}>
                  <Text c='white' size="sm">{change}</Text>
                </li>
              ))}
            </ul>
          </Box>
        ))}
      </Modal>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Navigation"
        hiddenFrom="sm"
        zIndex={1000000}
        position="right"
      >
        <ScrollArea h="calc(100vh - 80px)" mx="-md">
          <Divider my="sm" />

          <NavLink to="/" className={classes.link}>
            Home
          </NavLink>
          <UnstyledButton className={classes.link} onClick={toggleLinks}>
            <Center inline>
              <Box component="span" mr={5}>
                Features
              </Box>
              <IconChevronDown size={16} color={theme.colors.blue[6]} />
            </Center>
          </UnstyledButton>
          <Collapse in={linksOpened}>{links}</Collapse>
          <NavLink to="/learn" className={classes.link}>
            Learn
          </NavLink>
          <NavLink to="/academy" className={classes.link}>
            Academy
          </NavLink>

          <Divider my="sm" />

          <Group justify="center" grow pb="xl" px="md">
            <Button variant="default" component={NavLink} to="/login">
              Log in
            </Button>
            <Button component={NavLink} to="/signup">
              Sign up
            </Button>
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  );
}