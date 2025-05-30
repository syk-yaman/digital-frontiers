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
import { useContext, useState, useEffect } from 'react';
import axiosInstance from '@/utils/axiosInstance';
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
  const [latestTags, setLatestTags] = useState<{ id?: number; icon: any; title: string; description?: string }[]>([]);

  const theme = useMantineTheme();

  // Detect current route
  const location = useLocation();
  const isHome = location.pathname === '/';

  const authContext = useContext(AuthContext);

  const isAuthenticated = authContext?.isAuthenticated;
  const user = authContext?.user;
  const logout = authContext?.logout;

  useEffect(() => {
    // Fetch the latest tags from the backend using the general axios instance
    axiosInstance.get('/tags/navbar')
      .then((response) => {
        const fetchedTags = response.data.map((tag: any) => ({
          id: tag.id, // Store the tag ID for navigation
          icon: IconCategory, // Replace with a dynamic icon if available
          title: tag.name,
          description: `Explore datasets tagged with "${tag.name}".`,
        }));
        // Add the "Show all" item at the end
        setLatestTags([...fetchedTags, { icon: IconList, title: 'Show all' }]);
      })
      .catch((error) => {
        console.error('Error fetching latest tags:', error);
      });
  }, []);

  const links = latestTags.map((item) => (
    <UnstyledButton
      className={classes.subLink}
      key={item.title}
      component={NavLink}
      to={item.title === 'Show all' ? '/data-menu' : `/data-menu/tag/${item.id}`}
    >
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
      <Menu.Item component={NavLink}
        to="/my-datasets" leftSection={<IconDatabase size={18} />}>
        Datasets
      </Menu.Item>
      <Menu.Item component={NavLink}
        to="/my-showcases" leftSection={<IconNews size={18} />}>
        Showcases
      </Menu.Item>
      <Menu.Item component={NavLink}
        to="/my-access-requests" leftSection={<IconCircleDashedCheck size={18} />}>
        Access requests
      </Menu.Item>
    </>
  );

  const userMenuItems = (
    <>
      <Menu.Item style={{ cursor: 'not-allowed' }} leftSection={<IconUser size={18} />}>
        Profile
      </Menu.Item>
      <Menu.Item style={{ cursor: 'not-allowed' }} leftSection={<IconLock size={18} />}>
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
      style={{ backgroundColor: 'transparent' }}
    >
      <header className={classes.header}
        style={{
          borderBottom: isHome ? 'none' : `none`,
          backgroundColor: isHome ? 'transparent' : '#1F5754',
          position: isHome ? 'absolute' : 'relative',
          width: '100%',
          zIndex: 1000,
        }}
      >
        <Group justify="space-between" h="100%">
          <a href="/" className="logo" style={{ display: 'flex', alignItems: 'normal', textDecoration: 'none' }}>
            <svg xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 350 230"
              style={{ fill: '#ffffff', marginTop: '2px', height: 'auto', width: '58px' }} version="1.1">
              <defs>
                <clipPath id="clip1">
                  <path d="M 33 0 L 348.710938 0 L 348.710938 144 L 33 144 Z M 33 0 " />
                </clipPath>
                <clipPath id="clip2">
                  <path d="M 29 195 L 324 195 L 324 226.199219 L 29 226.199219 Z M 29 195 " />
                </clipPath>
              </defs>
              <g id="surface1">
                <path style={{ stroke: 'none', fillRule: 'nonzero', fill: '#FFFFFF', fillOpacity: 1 }} d="M 139.375 40.863281 L 174.1875 71.871094 L 27.660156 138.746094 L 139.375 40.863281 " />
                <path style={{ stroke: 'none', fillRule: 'nonzero', fill: '#FFFFFF', fillOpacity: 1 }} d="M 0 18.867188 L 98.519531 65.855469 L 25.714844 130.585938 L 0 18.867188 " />
                <g clip-path="url(#clip1)" clip-rule="nonzero">
                  <path style={{ stroke: 'none', fillRule: 'nonzero', fill: '#FFFFFF', fillOpacity: 1 }} d="M 33.917969 143.160156 L 320.230469 143.160156 L 348.707031 0.00390625 L 33.917969 143.160156 " />
                </g>
                <g clip-path="url(#clip2)" clip-rule="nonzero">
                  <path style={{ stroke: 'none', fillRule: 'nonzero', fill: 'rgb(100%,100%,100%)', fillOpacity: 1 }} d="M 323.632813 225.640625 L 313.542969 209.929688 L 323.113281 195.734375 L 316.695313 195.734375 L 308.640625 207.9375 L 304.8125 207.9375 L 304.8125 195.734375 L 299.308594 195.734375 L 299.308594 225.640625 L 304.8125 225.640625 L 304.8125 212.523438 L 308.519531 212.523438 L 316.933594 225.640625 Z M 287.78125 204.90625 C 287.78125 208.492188 286.347656 209.609375 282.957031 209.609375 L 278.011719 209.609375 L 278.011719 200.4375 L 283.117188 200.4375 C 286.425781 200.4375 287.78125 201.59375 287.78125 204.90625 Z M 293.484375 204.707031 C 293.484375 198.5625 290.097656 195.734375 283.078125 195.734375 L 272.511719 195.734375 L 272.511719 225.640625 L 278.011719 225.640625 L 278.011719 213.878906 L 283.117188 213.878906 L 289.019531 225.640625 L 295.480469 225.640625 L 288.101563 212.800781 C 291.570313 211.964844 293.484375 209.09375 293.484375 204.707031 Z M 254.644531 199.761719 L 254.765625 199.761719 L 255.601563 202.871094 L 259.191406 214.554688 L 250.097656 214.554688 L 253.726563 202.871094 Z M 262.578125 225.640625 L 268.761719 225.640625 L 258.035156 195.734375 L 251.453125 195.734375 L 240.804688 225.640625 L 246.667969 225.640625 L 248.664063 219.222656 L 260.625 219.222656 Z M 235.0625 205.582031 C 235.0625 209.691406 233.347656 210.726563 229.640625 210.726563 L 224.773438 210.726563 L 224.773438 200.4375 L 229.640625 200.4375 C 233.507813 200.4375 235.0625 201.675781 235.0625 205.582031 Z M 240.726563 205.621094 C 240.726563 198.84375 237.496094 195.734375 229.640625 195.734375 L 219.273438 195.734375 L 219.273438 225.640625 L 224.773438 225.640625 L 224.773438 215.234375 L 229.640625 215.234375 C 237.535156 215.234375 240.726563 211.84375 240.726563 205.621094 Z M 203.242188 196.53125 C 201.566406 195.8125 198.734375 195.214844 196.300781 195.214844 C 186.972656 195.214844 182.78125 200.320313 182.78125 210.449219 C 182.78125 221.214844 187.011719 226.199219 195.984375 226.199219 C 198.574219 226.199219 201.40625 225.480469 203.359375 224.523438 L 202.722656 219.9375 C 201.007813 220.695313 199.015625 221.214844 196.699219 221.214844 C 190.839844 221.214844 188.566406 218.703125 188.566406 210.488281 C 188.566406 202.753906 190.757813 200.277344 196.582031 200.277344 C 198.894531 200.277344 201.089844 200.757813 202.644531 201.355469 Z M 171.378906 225.640625 L 176.960938 225.640625 L 176.960938 195.734375 L 171.378906 195.734375 Z M 160.453125 205.582031 C 160.453125 209.691406 158.738281 210.726563 155.027344 210.726563 L 150.164063 210.726563 L 150.164063 200.4375 L 155.027344 200.4375 C 158.898438 200.4375 160.453125 201.675781 160.453125 205.582031 Z M 166.113281 205.621094 C 166.113281 198.84375 162.886719 195.734375 155.027344 195.734375 L 144.660156 195.734375 L 144.660156 225.640625 L 150.164063 225.640625 L 150.164063 215.234375 L 155.027344 215.234375 C 162.925781 215.234375 166.113281 211.84375 166.113281 205.621094 Z M 108.011719 195.734375 L 108.011719 225.640625 L 112.878906 225.640625 L 112.878906 208.375 L 112.839844 205.144531 L 112.917969 205.105469 L 114.074219 208.136719 L 121.054688 225.640625 L 124.800781 225.640625 L 131.820313 208.136719 L 132.976563 205.105469 L 133.097656 205.144531 L 133.015625 208.375 L 133.015625 225.640625 L 138.039063 225.640625 L 138.039063 195.734375 L 131.941406 195.734375 L 124.203125 214.792969 L 123.085938 217.785156 L 122.96875 217.785156 L 121.8125 214.792969 L 114.152344 195.734375 Z M 77.902344 195.734375 L 88.3125 215.832031 L 88.3125 225.640625 L 93.9375 225.640625 L 93.9375 215.832031 L 104.183594 195.734375 L 98.164063 195.734375 L 92.539063 207.894531 L 91.304688 210.847656 L 91.183594 210.847656 L 89.867188 207.9375 L 84.125 195.734375 Z M 65.941406 220.578125 L 65.941406 195.734375 L 60.398438 195.734375 L 60.398438 225.640625 L 78.859375 225.640625 L 78.980469 220.578125 Z M 49.273438 210.6875 C 49.273438 218.902344 47.398438 221.136719 42.253906 221.136719 C 37.109375 221.136719 35.195313 218.941406 35.195313 210.6875 C 35.195313 202.433594 37.109375 200.320313 42.214844 200.320313 C 47.4375 200.320313 49.273438 202.394531 49.273438 210.6875 Z M 55.015625 210.6875 C 55.015625 199.917969 51.386719 195.253906 42.253906 195.253906 C 33.082031 195.253906 29.410156 199.917969 29.410156 210.6875 C 29.410156 221.457031 33.199219 226.199219 42.253906 226.199219 C 51.386719 226.199219 55.015625 221.613281 55.015625 210.6875 " />
                </g>
                <path style={{ stroke: 'none', fillRule: 'nonzero', fill: 'rgb(100%,100%,100%)', fillOpacity: 1 }} d="M 321.777344 182.480469 L 321.777344 158.417969 L 317.347656 158.417969 L 317.347656 168.074219 L 307.5625 168.074219 L 307.5625 158.417969 L 303.136719 158.417969 L 303.136719 182.480469 L 307.5625 182.480469 L 307.5625 172.148438 L 317.347656 172.148438 L 317.347656 182.480469 Z M 300.023438 162.523438 L 299.929688 158.417969 L 282.089844 158.417969 L 281.992188 162.523438 L 288.761719 162.523438 L 288.761719 182.480469 L 293.253906 182.480469 L 293.253906 162.523438 Z M 268.714844 178.53125 L 268.714844 171.859375 L 278.082031 171.859375 L 278.082031 168.234375 L 268.714844 168.234375 L 268.714844 162.429688 L 279.75 162.429688 L 279.683594 158.417969 L 264.285156 158.417969 L 264.285156 182.480469 L 280.164063 182.480469 L 280.261719 178.53125 Z M 254.820313 165.316406 C 254.820313 167.464844 253.796875 168.460938 251.550781 168.460938 L 246.449219 168.460938 L 246.449219 162.234375 L 251.355469 162.234375 C 253.761719 162.234375 254.820313 163.070313 254.820313 165.316406 Z M 255.527344 175.195313 C 255.527344 177.890625 254.277344 178.757813 251.804688 178.757813 L 246.449219 178.757813 L 246.449219 171.828125 L 251.710938 171.828125 C 254.402344 171.828125 255.527344 172.855469 255.527344 175.195313 Z M 259.953125 175.546875 C 259.953125 172.40625 258.480469 170.511719 255.816406 169.773438 L 255.816406 169.710938 C 257.773438 168.941406 259.054688 167.304688 259.054688 164.511719 C 259.054688 160.632813 256.554688 158.417969 251.515625 158.417969 L 242.179688 158.417969 L 242.179688 182.480469 L 251.773438 182.480469 C 257.578125 182.480469 259.953125 179.847656 259.953125 175.546875 Z M 227.808594 161.65625 L 227.90625 161.65625 L 228.578125 164.160156 L 231.464844 173.558594 L 224.152344 173.558594 L 227.070313 164.160156 Z M 234.191406 182.480469 L 239.164063 182.480469 L 230.535156 158.417969 L 225.242188 158.417969 L 216.675781 182.480469 L 221.390625 182.480469 L 222.996094 177.3125 L 232.621094 177.3125 Z M 214.816406 182.480469 L 214.878906 178.40625 L 203.460938 178.40625 L 203.425781 178.308594 L 204.902344 176.285156 L 214.816406 161.753906 L 214.816406 158.417969 L 198.292969 158.417969 L 198.132813 162.523438 L 209.425781 162.523438 L 209.457031 162.589844 L 207.980469 164.640625 L 197.84375 179.527344 L 197.84375 182.480469 Z M 188.988281 182.480469 L 193.480469 182.480469 L 193.480469 158.417969 L 188.988281 158.417969 Z M 174.746094 178.40625 L 174.746094 158.417969 L 170.285156 158.417969 L 170.285156 182.480469 L 185.140625 182.480469 L 185.238281 178.40625 Z M 154.789063 178.53125 L 154.789063 171.859375 L 164.160156 171.859375 L 164.160156 168.234375 L 154.789063 168.234375 L 154.789063 162.429688 L 165.828125 162.429688 L 165.761719 158.417969 L 150.363281 158.417969 L 150.363281 182.480469 L 166.246094 182.480469 L 166.339844 178.53125 Z M 135.992188 182.480469 L 135.992188 158.417969 L 132.078125 158.417969 L 132.078125 172.019531 L 132.140625 174.585938 L 132.078125 174.617188 L 130.632813 172.46875 L 121.039063 158.417969 L 117.191406 158.417969 L 117.191406 182.480469 L 121.136719 182.480469 L 121.136719 168.265625 L 121.105469 165.667969 L 121.167969 165.636719 L 122.613281 167.816406 L 132.878906 182.480469 Z M 101.695313 178.53125 L 101.695313 171.859375 L 111.0625 171.859375 L 111.0625 168.234375 L 101.695313 168.234375 L 101.695313 162.429688 L 112.730469 162.429688 L 112.667969 158.417969 L 97.269531 158.417969 L 97.269531 182.480469 L 113.148438 182.480469 L 113.246094 178.53125 Z M 81.773438 178.53125 L 81.773438 171.859375 L 91.140625 171.859375 L 91.140625 168.234375 L 81.773438 168.234375 L 81.773438 162.429688 L 92.808594 162.429688 L 92.746094 158.417969 L 77.347656 158.417969 L 77.347656 182.480469 L 93.226563 182.480469 L 93.324219 178.53125 Z M 72.40625 158.417969 L 67.980469 158.417969 L 67.980469 173.816406 C 67.980469 177.28125 66.4375 178.820313 62.972656 178.820313 C 59.507813 178.820313 57.90625 177.28125 57.90625 173.816406 L 57.90625 158.417969 L 53.511719 158.417969 L 53.511719 173.847656 C 53.511719 180.039063 56.847656 182.929688 62.972656 182.929688 C 69.132813 182.929688 72.40625 180.007813 72.40625 173.847656 Z M 44.945313 170.449219 C 44.945313 177.058594 43.4375 178.855469 39.296875 178.855469 C 35.160156 178.855469 33.617188 177.089844 33.617188 170.449219 C 33.617188 163.808594 35.160156 162.105469 39.265625 162.105469 C 43.46875 162.105469 44.945313 163.773438 44.945313 170.449219 Z M 49.5625 170.449219 C 49.5625 161.785156 46.644531 158.03125 39.296875 158.03125 C 31.917969 158.03125 28.96875 161.785156 28.96875 170.449219 C 28.96875 178.855469 31.824219 182.703125 38.625 182.929688 L 42.507813 187.386719 L 47.703125 186.070313 L 42.890625 182.445313 C 47.605469 181.386719 49.5625 177.601563 49.5625 170.449219 " />
              </g>
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 2 22"
              style={{
                display: 'inline-block',
                marginLeft: '10px', /* Adjust spacing between logo and line */
                height: '32px',
                width: '2px',
                fill: '#FFC747',
                marginTop: '6px',
                backgroundColor: '#FFC747', /* Matches logo's color */
              }}
            >
            </svg>
            <span
              style={{
                marginTop: '8px',
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
              openDelay={100} closeDelay={300}
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
                  <Text fw={500}>Latest tags</Text>
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
                fontSize: '13px',
                visibility: 'hidden'
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
              trigger="hover" openDelay={100} closeDelay={300}
            >
              <Menu.Target>
                <UnstyledButton
                  className={cx(classes.menu, { [classes.menuActive]: dashboardMenuOpened })}
                >
                  <Group gap={7}>
                    <IconLayoutDashboardFilled radius="xl" size={24} />
                    <Text fw={500} size="sm" lh={1} mr={3}>
                      My items
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