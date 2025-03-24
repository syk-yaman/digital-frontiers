import {
    IconAdjustments,
    IconCalendarStats,
    IconFileAnalytics,
    IconGauge,
    IconLock,
    IconNotes,
    IconPresentationAnalytics,
    IconUser,
    IconTrash,
    IconCheck,
    IconError404,
} from '@tabler/icons-react';
import {
    Code,
    Group,
    ScrollArea,
    Container,
    Flex,
    Grid,
    Skeleton,
    Table,
    Text,
    Button,
    Badge,
    Space,
    Loader,
    Transition,
} from '@mantine/core';
import { LinksGroup } from '../components/NavbarLinksGroup/NavbarLinksGroup';
import classes from './NavbarNested.module.css';
import { StatsGrid } from '@/components/Statsgrid/StatsGrid';
import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/config';
import { notifications, Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';

interface DatasetItem {
    id: number;
    name: string;
    dataOwnerName: string;
    datasetType: string;
    updateFrequency: number;
    updateFrequencyUnit: string;
    links: any[];
    locations: any[];
    tags: { name: string; colour: string }[];
    createdAt: string;
}

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
    const [datasets, setDatasets] = useState<DatasetItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        fetch(`${API_BASE_URL}/datasets`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch datasets');
                }
                return response.json();
            })
            .then((data) => {
                setDatasets(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching datasets:', error);
                setLoading(false);
            });
    }, []);

    const handleDelete = (id: number) => {
        fetch(`${API_BASE_URL}/datasets/${id}`, {
            method: 'DELETE',
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to delete dataset');
                }
                setDatasets((prevDatasets) => prevDatasets.filter((dataset) => dataset.id !== id));
                notifications.show({
                    title: 'Success',
                    message: 'Dataset deleted',
                    color: 'green',
                    icon: <IconCheck />,
                });
            })
            .catch((error) => {
                console.error('Error deleting dataset:', error);
                notifications.show({
                    title: 'Error',
                    message: 'Failed to delete dataset:' + error,
                    color: 'red',
                    icon: <IconError404 />,
                });
            });
    };

    const rows = datasets.map((dataset) => (
        <tr key={dataset.id}>
            <td>{dataset.name}</td>
            <td>{dataset.dataOwnerName}</td>
            <td>{dataset.datasetType}</td>
            <td>{dataset.updateFrequency}</td>
            <td>{dataset.updateFrequencyUnit}</td>
            <td>{dataset.links.length}</td>
            <td>{dataset.locations.length}</td>
            <td>
                {dataset.tags.map((tag) => (
                    <Badge key={tag.name} color={tag.colour}>
                        {tag.name}
                    </Badge>
                ))}
            </td>
            <td>{new Date(dataset.createdAt).toLocaleDateString()}</td>
            <td>
                <Button variant="outline" color="red" onClick={() => handleDelete(dataset.id)}>
                    <IconTrash size={16} />
                </Button>
            </td>
        </tr>
    ));

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
                <Container my="md">
                    {loading ? (
                        <Loader />
                    ) : (
                        <Table striped highlightOnHover>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Owner</th>
                                    <th>Type</th>
                                    <th>Frequency</th>
                                    <th>Unit</th>
                                    <th>Links</th>
                                    <th>Locations</th>
                                    <th>Tags</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>{rows}</tbody>
                        </Table>
                    )}
                </Container>
                <Notifications />
            </Container>
        </Flex>
    );
}