import {
    Container,
    Text,
    Center,
    Loader,
    Group,
    Badge,
    ActionIcon,
    Modal,
    Button,
    Stack,
    Tooltip,
    MultiSelect,
} from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import { notifications } from '@mantine/notifications';
import { IconEye, IconEdit, IconTrash, IconVideo, IconMap, IconPlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import '@mantine/core/styles.layer.css';
import 'mantine-datatable/styles.layer.css';

interface ShowcaseItem {
    id: number;
    title: string;
    description: string;
    youtubeLink?: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    dataset?: {
        id: number;
        name: string;
    };
    sliderImages: { id: number; fileName: string; isTeaser: boolean }[];
    locations: {
        id: number;
        lon: number;
        lat: number;
        description?: string;
        imageLink?: string;
        linkTitle?: string;
        linkAddress?: string;
    }[];
    approvedAt: string | null;
    deniedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export function AdminShowcases() {
    const [showcases, setShowcases] = useState<ShowcaseItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activePage, setActivePage] = useState(1);
    const [deleteModalOpened, setDeleteModalOpened] = useState(false);
    const [showcaseToDelete, setShowcaseToDelete] = useState<ShowcaseItem | null>(null);
    const [filteredDatasets, setFilteredDatasets] = useState<string[]>([]);

    const itemsPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        axiosInstance
            .get('/showcases')
            .then((response) => {
                setShowcases(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching showcases:', error);
                notifications.show({
                    title: 'Error',
                    message: 'Failed to fetch showcases.',
                    color: 'red',
                });
                setError('Failed to fetch showcases.');
                setLoading(false);
            });
    }, []);

    const handleDeleteShowcase = () => {
        if (!showcaseToDelete) return;

        axiosInstance
            .delete(`/showcases/${showcaseToDelete.id}`)
            .then(() => {
                notifications.show({
                    title: 'Success',
                    message: `Showcase "${showcaseToDelete.title}" deleted successfully.`,
                    color: 'green',
                });
                setShowcases((prev) => prev.filter((showcase) => showcase.id !== showcaseToDelete.id));
                setDeleteModalOpened(false);
                setShowcaseToDelete(null);
            })
            .catch((error) => {
                console.error('Error deleting showcase:', error);
                notifications.show({
                    title: 'Error',
                    message: 'Failed to delete showcase.',
                    color: 'red',
                });
            });
    };

    const filteredShowcases = showcases.filter((showcase) =>
        filteredDatasets.length === 0 ||
        (showcase.dataset && filteredDatasets.includes(showcase.dataset.name))
    );

    const paginatedShowcases = filteredShowcases.slice(
        (activePage - 1) * itemsPerPage,
        activePage * itemsPerPage
    );

    const allDatasets = Array.from(
        new Set(showcases.filter(s => s.dataset).map((showcase) => showcase.dataset?.name as string))
    );

    if (loading) {
        return (
            <Center style={{ height: '80vh' }}>
                <Loader size="lg" color="blue" />
            </Center>
        );
    }

    if (error) {
        return (
            <Center style={{ height: '80vh' }}>
                <Text color="red">{error}</Text>
            </Center>
        );
    }

    return (
        <Container>
            <Group justify="space-between" mb="lg">
                <Text size="xl" fw={700}>
                    All Showcases
                </Text>
                <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={() => navigate('/add-showcase')}
                >
                    Add New Showcase
                </Button>
            </Group>

            {allDatasets.length > 0 && (
                <MultiSelect
                    data={allDatasets.map((dataset) => ({ value: dataset, label: dataset }))}
                    placeholder="Filter by datasets"
                    value={filteredDatasets}
                    onChange={setFilteredDatasets}
                    mb="lg"
                />
            )}

            <DataTable
                withTableBorder
                textSelectionDisabled
                columns={[
                    {
                        accessor: 'title',
                        title: 'Title',
                        render: (record) => <Text fw={300}>{record.title}</Text>,
                        width: 200,
                    },
                    {
                        accessor: 'user',
                        title: 'Owner',
                        render: (record) => (
                            <Text>
                                {record.user.firstName} {record.user.lastName}
                            </Text>
                        ),
                    },
                    {
                        accessor: 'dataset',
                        title: 'Dataset',
                        render: (record) => (
                            <Text>{record.dataset ? record.dataset.name : 'None'}</Text>
                        ),
                    },
                    {
                        accessor: 'features',
                        title: 'Features',
                        width: 150,
                        render: (record) => (
                            <Group gap={10}>
                                {record.youtubeLink && (
                                    <Badge color="red" leftSection={<IconVideo size={12} />}>
                                        Video
                                    </Badge>
                                )}
                                {record.locations && record.locations.length > 0 && (
                                    <Badge color="blue" leftSection={<IconMap size={12} />}>
                                        {record.locations.length} Locations
                                    </Badge>
                                )}
                            </Group>
                        ),
                    },
                    {
                        accessor: 'approvalStatus',
                        title: 'Status',
                        render: (record) => {
                            if (record.deniedAt) {
                                return <Badge color="red">Denied</Badge>;
                            } else if (record.approvedAt) {
                                return <Badge color="green">Approved</Badge>;
                            } else {
                                return <Badge color="yellow">Pending</Badge>;
                            }
                        },
                    },
                    {
                        accessor: 'createdAt',
                        title: 'Created',
                        render: (record) => new Date(record.createdAt).toLocaleDateString(),
                    },
                    {
                        accessor: 'actions',
                        title: 'Actions',
                        render: (record) => (
                            <Group gap={4} justify="right" wrap="nowrap">
                                <Tooltip label="View showcase" position="top" withArrow>
                                    <ActionIcon
                                        size="sm"
                                        variant="subtle"
                                        color="green"
                                        onClick={() => navigate(`/showcase/${record.id}`)}
                                    >
                                        <IconEye size={16} />
                                    </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Edit showcase" position="top" withArrow>
                                    <ActionIcon
                                        size="sm"
                                        variant="subtle"
                                        color="blue"
                                        onClick={() => navigate(`/edit-showcase/${record.id}`)}
                                    >
                                        <IconEdit size={16} />
                                    </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Delete showcase" position="top" withArrow>
                                    <ActionIcon
                                        size="sm"
                                        variant="subtle"
                                        color="red"
                                        onClick={() => {
                                            setShowcaseToDelete(record);
                                            setDeleteModalOpened(true);
                                        }}
                                    >
                                        <IconTrash size={16} />
                                    </ActionIcon>
                                </Tooltip>
                            </Group>
                        ),
                    },
                ]}
                records={paginatedShowcases}
                totalRecords={filteredShowcases.length}
                recordsPerPage={itemsPerPage}
                page={activePage}
                onPageChange={setActivePage}
                emptyState={
                    <Text ta="center" c="dimmed">
                        No showcases found
                    </Text>
                }
            />

            <Modal
                opened={deleteModalOpened}
                onClose={() => setDeleteModalOpened(false)}
                title="Confirm Deletion"
                centered
            >
                <Stack>
                    <Text>
                        Are you sure you want to delete the showcase{' '}
                        <Text fw={700} component="span">
                            {showcaseToDelete?.title}
                        </Text>
                        ?
                    </Text>
                    <Text size="sm" c="dimmed">
                        This action cannot be undone.
                    </Text>
                </Stack>
                <Group justify="right" mt="md">
                    <Button variant="default" onClick={() => setDeleteModalOpened(false)}>
                        Cancel
                    </Button>
                    <Button color="red" onClick={handleDeleteShowcase}>
                        Delete
                    </Button>
                </Group>
            </Modal>
        </Container>
    );
}
