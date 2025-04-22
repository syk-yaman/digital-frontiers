import {
    IconAdjustments,
    IconCalendarStats,
    IconDatabase,
    IconFileAnalytics,
    IconGauge,
    IconHome,
    IconLock,
    IconNotes,
    IconPresentationAnalytics,
    IconTag,
    IconUser,
} from '@tabler/icons-react';
import { Box, Code, Group, Modal, ScrollArea, Text } from '@mantine/core';
import classes from './Admin.page.module.css';
import { MantineLogo } from '@mantinex/mantine-logo';
import { useState } from 'react';
import { LinksGroup } from '@/components/NavbarLinksGroup/NavbarLinksGroup';
import { changelog, version } from '@/components/Header/changelog';
import { useDisclosure } from '@mantine/hooks';
import { Routes, Route } from 'react-router-dom';
import { AdminHome } from './AdminHome.page';
import { AdminDatasets } from './AdminDatasets.page';

const menuData = [
    { label: 'Home', icon: IconHome, link: '/' }, // Add the link property for Home
    {
        label: 'Datasets',
        icon: IconDatabase,
        initiallyOpened: true,
        links: [
            { label: 'View all', link: '/datasets' }, // Ensure the link matches the route path
            { label: 'Incoming add requests', link: '/datasets/requests' }, // Example for another sub-page
        ],
    },
    {
        label: 'Tags',
        icon: IconTag,
        links: [
            { label: 'View all', link: '/tags' },
            { label: 'Incoming add requests', link: '/tags/requests' },
        ],
    },
    {
        label: 'Users',
        icon: IconUser,
        links: [
            { label: 'View all', link: '/users' },
        ],
    },
    { label: 'Settings', icon: IconAdjustments, link: '/settings' }, // Add the link property for Settings
];

export function AdminPage() {
    const links = menuData.map((item) => <LinksGroup {...item} key={item.label} />);
    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

    return (
        <div style={{ display: 'flex' }}>
            <nav className={classes.navbar}>
                <div className={classes.header}>
                    <Group justify="space-between">
                        <Text size="lg">Admin dashboard</Text>
                        <Code style={{ cursor: 'pointer' }} onClick={openModal} fw={700}>{version}</Code>
                    </Group>
                </div>

                <ScrollArea className={classes.links}>
                    <div className={classes.linksInner}>{links}</div>
                </ScrollArea>

                <Modal
                    opened={modalOpened}
                    onClose={closeModal}
                    c='#FFC747'
                    className={classes.modalcustom}
                    title="Changelog"
                    size="md"
                    zIndex={999999}
                    centered
                >
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
            </nav>

            <main style={{ flex: 1, padding: '20px' }}>
                <Routes>
                    <Route path="/" element={<AdminHome />} /> {/* Home sub-page */}
                    <Route path="/datasets" element={<AdminDatasets />} /> {/* View All Datasets sub-page */}
                    {/* Add other sub-page routes here */}
                </Routes>
            </main>
        </div>
    );
}