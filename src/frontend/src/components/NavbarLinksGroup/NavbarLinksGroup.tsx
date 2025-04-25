import { useState } from 'react';
import { IconCalendarStats, IconChevronRight } from '@tabler/icons-react';
import { Box, Collapse, Group, Text, ThemeIcon, UnstyledButton } from '@mantine/core';
import { NavLink } from 'react-router-dom'; // Import NavLink
import classes from './NavbarLinksGroup.module.css';

interface LinksGroupProps {
  icon: React.FC<any>;
  label: string;
  initiallyOpened?: boolean;
  link?: string;
  links?: { label: string; link: string }[];
}

export function LinksGroup({ icon: Icon, label, initiallyOpened, links, link }: LinksGroupProps) {
  const hasLinks = Array.isArray(links);
  const [opened, setOpened] = useState(initiallyOpened || false);
  const items = (hasLinks ? links : []).map((link) => (
    <NavLink
      to={link.link}
      key={link.label}
      end // Ensure only exact matches are highlighted
      className={({ isActive }) =>
        isActive ? `${classes.link} ${classes.activeLink}` : classes.link
      }
    >
      {link.label}
    </NavLink>
  ));

  return (
    <>
      <NavLink
        onClick={() => setOpened((o) => !o)}
        className={({ isActive }) =>
          isActive && link != null ? `${classes.controlActive}` : `${classes.control}`
        }
        to={link == null ? '#' : link}
        end // Ensure only exact matches are highlighted for parent links
      >
        <Group justify="space-between" gap={0}>
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            <ThemeIcon variant="light" size={30}>
              <Icon size={18} />
            </ThemeIcon>
            <Box ml="md">{label}</Box>
          </Box>
          {hasLinks && (
            <IconChevronRight
              className={classes.chevron}
              stroke={1.5}
              size={16}
              style={{ transform: opened ? 'rotate(-90deg)' : 'none' }}
            />
          )}
        </Group>
      </NavLink>
      {hasLinks ? <Collapse in={opened}>{items}</Collapse> : null}
    </>
  );
}
