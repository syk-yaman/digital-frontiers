import {
    IconAdjustments,
    IconCalendarStats,
    IconFileAnalytics,
    IconGauge,
    IconLock,
    IconNotes,
    IconPresentationAnalytics,
    IconUser,
} from '@tabler/icons-react';
import { Code, Group, ScrollArea, Container, Flex, Grid, Skeleton } from '@mantine/core';
import { LinksGroup } from '../components/NavbarLinksGroup/NavbarLinksGroup';
import classes from './NavbarNested.module.css';
import { StatsGrid } from '@/components/Statsgrid/StatsGrid';

const child = <Skeleton height={140} radius="md" animate={false} />;

const mockdata = [
    { label: 'Dashboard', icon: IconGauge },
    {
        label: 'Datasets',
        icon: IconNotes,
        initiallyOpened: true,
        links: [
            { label: 'Overview', link: '/' },
            { label: 'Manage', link: '/' },
            { label: 'Add requests', link: '/' },
            { label: 'Real time', link: '/' },
        ],
    },
    {
        label: 'Tags',
        icon: IconCalendarStats,
        links: [
            { label: 'General', link: '/' },
            { label: 'Previous releases', link: '/' },
            { label: 'Releases schedule', link: '/' },
        ],
    },
    { label: 'Showcases', icon: IconPresentationAnalytics },
    { label: 'Users', icon: IconUser },
    { label: 'Settings', icon: IconAdjustments },
    {
        label: 'Security',
        icon: IconLock,
        links: [
            { label: 'Enable 2FA', link: '/' },
            { label: 'Change password', link: '/' },
            { label: 'Recovery codes', link: '/' },
        ],
    },
];

export function NavbarNested() {
    const links = mockdata.map((item) => <LinksGroup {...item} key={item.label} />);

    return (
        <Flex>
            <nav className={classes.navbar}>
                <div className={classes.header}>
                    <Group justify="space-between">
                        <Code fw={700}>v0.2.1</Code>
                    </Group>
                </div>
                <ScrollArea className={classes.links}>
                    <div className={classes.linksInner}>{links}</div>
                </ScrollArea>
                <div className={classes.footer}></div>
            </nav>
            <Container>
                <StatsGrid></StatsGrid>
                {/* Add any other main content here */}
                <Container my="md">
                    <Grid>
                        <Grid.Col span={{ base: 12, xs: 4 }}>{child}</Grid.Col>
                        <Grid.Col span={{ base: 12, xs: 8 }}>{child}</Grid.Col>
                        <Grid.Col span={{ base: 12, xs: 8 }}>{child}</Grid.Col>
                        <Grid.Col span={{ base: 12, xs: 4 }}>{child}</Grid.Col>
                        <Grid.Col span={{ base: 12, xs: 3 }}>{child}</Grid.Col>
                        <Grid.Col span={{ base: 12, xs: 3 }}>{child}</Grid.Col>
                        <Grid.Col span={{ base: 12, xs: 6 }}>{child}</Grid.Col>
                    </Grid>
                </Container>
            </Container>
        </Flex>
    );
}