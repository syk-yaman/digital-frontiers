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
} from '@tabler/icons-react';
import {
  Anchor,
  Box,
  Burger,
  Button,
  Center,
  Collapse,
  Divider,
  Drawer,
  Group,
  HoverCard,
  ScrollArea,
  SimpleGrid,
  Text,
  ThemeIcon,
  UnstyledButton,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { NavLink } from 'react-router-dom';
import classes from './HeaderMegaMenu.module.css';

const mockdata = [
  {
    icon: IconPlane,
    title: 'Aiccraft',
    description: 'This Pokémon’s cry is very loud and distracting',
  },
  {
    icon: IconPlant,
    title: 'Environment & Nature',
    description: 'The fluid of Smeargle’s tail secretions changes',
  },
  {
    icon: IconBuilding,
    title: 'Built enviroment',
    description: 'Yanma is capable of seeing 360 degrees without',
  },
  {
    icon: IconCat,
    title: 'Life',
    description: 'The shell’s rounded shape and the grooves on its.',
  },
  {
    icon: IconChartPie3,
    title: 'Analytics',
    description: 'This Pokémon uses its flying ability to quickly chase',
  },
  {
    icon: IconSunElectricity,
    title: 'Solar power',
    description: 'Combusken battles with the intensely hot flames it spews',
  },
];

export function HeaderMegaMenu() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
  const theme = useMantineTheme();

  const links = mockdata.map((item) => (
    <UnstyledButton className={classes.subLink} key={item.title}>
      <Group wrap="nowrap" align="flex-start">
        <ThemeIcon size={34} variant="default" radius="md">
          <item.icon size={22} color={theme.colors.blue[6]} />
        </ThemeIcon>
        <div>
          <Text size="sm" fw={500}>
            {item.title}
          </Text>
          <Text size="xs" c="dimmed">
            {item.description}
          </Text>
        </div>
      </Group>
    </UnstyledButton>
  ));

  return (
    <Box pb={120}>
      <header className={classes.header}>
        <Group justify="space-between" h="100%">
          <Text fw={700} size="lg">
            Digital Frontiers
          </Text>

          <Group h="100%" gap={0} visibleFrom="sm">
            {/* Use NavLink instead of <a> */}
            <NavLink to="/" className={classes.link}>
              Home
            </NavLink>

            <HoverCard width={600} position="bottom" radius="md" shadow="md" withinPortal>
              <HoverCard.Target>
                <NavLink to="/data-menu" className={classes.link}>
                  <Center inline>
                    <Box component="span" mr={5}>
                      Data menu
                    </Box>
                    <IconChevronDown size={16} color={theme.colors.blue[6]} />
                  </Center>
                </NavLink>
              </HoverCard.Target>

              <HoverCard.Dropdown style={{ overflow: 'hidden' }}>
                <Group justify="space-between" px="md">
                  <Text fw={500}>Latest added tags</Text>
                  <Anchor component={NavLink} to="/tags" fz="xs">
                    View all
                  </Anchor>
                </Group>

                <Divider my="sm" />

                <SimpleGrid cols={2} spacing={0}>
                  {links}
                </SimpleGrid>

                <div className={classes.dropdownFooter}>
                  <Group justify="space-between">
                    <div>
                      <Text fw={500} fz="sm">
                        Add your dataset now
                      </Text>
                      <Text size="xs" c="dimmed">
                        Your dataset will be shown here so people can use it too
                      </Text>
                    </div>
                    <Button variant="default" component={NavLink} to="/add-dataset">
                      Add dataset
                    </Button>
                  </Group>
                </div>
              </HoverCard.Dropdown>
            </HoverCard>

            <NavLink to="/showcases" className={classes.link}>
              Showcases
            </NavLink>
            <NavLink to="/about" className={classes.link}>
              About
            </NavLink>
          </Group>

          <Group visibleFrom="sm">
            <Button variant="default" component={NavLink} to="/login">
              Log in
            </Button>
            <Button component={NavLink} to="/signup">
              Sign up
            </Button>
          </Group>

          <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="sm" />
        </Group>
      </header>

      {/* Mobile Drawer */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Navigation"
        hiddenFrom="sm"
        zIndex={1000000}
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
