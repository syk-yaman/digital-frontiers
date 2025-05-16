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
    Tooltip,
} from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import { notifications } from '@mantine/notifications';
import { IconEye, IconCheck, IconEdit, IconTrash, IconX, IconVideo, IconMap } from '@tabler/icons-react';
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
    createdAt: string;
}

export function AdminShowcaseRequests() {
    const [showcases, setShowcases] = useState<ShowcaseItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteModalOpened, setDeleteModalOpened] = useState(false);
    const [showcaseToDelete, setShowcaseToDelete] = useState<ShowcaseItem | null>(null);
    const [isProcessing, setIsProcessing] = useState<number | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        axiosInstance
            .get('/showcases/requests')
            .then((response) => {
                setShowcases(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching showcase requests:', error);
                notifications.show({
                    title: 'Error',
                    message: 'Failed to fetch showcase requests.',
                    color: 'red',
                });
                setError('Failed to fetch showcase requests.');
                setLoading(false);
            });
    }, []);

    const handleApproveShowcase = (id: number) => {
        setIsProcessing(id);
        axiosInstance
            .put(`/showcases/${id}/approve`)
            .then(() => {
                notifications.show({
                    title: 'Success',
                    message: 'Showcase approved successfully.',
                    color: 'green',
                });
                setShowcases((prev) => prev.filter((showcase) => showcase.id !== id));
            })
            .catch((error) => {
                console.error('Error approving showcase:', error);
                notifications.show({
                    title: 'Error',
                    message: 'Failed to approve showcase.',
                    color: 'red',
                });
            })
            .finally(() => {
                setIsProcessing(null);
            });
    };

    const handleDenyShowcase = (id: number) => {
        setIsProcessing(id);
        axiosInstance
            .put(`/showcases/${id}/deny`)
            .then(() => {
                notifications.show({
                    title: 'Success',
                    message: 'Showcase has been denied.',
                    color: 'green',
                });
                setShowcases((prev) => prev.filter((showcase) => showcase.id !== id));
            })
            .catch((error) => {
                console.error('Error denying showcase:', error);
                notifications.show({
                    title: 'Error',
                    message: 'Failed to deny showcase.',
                    color: 'red',
                });
            })
            .finally(() => {
                setIsProcessing(null);
            });
    }

    const handleDeleteShowcase = () => {
        if (!showcaseToDelete) return;

        setIsProcessing(showcaseToDelete.id);
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
            })
            .finally(() => {
                setIsProcessing(null);
            });
    };

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
            <Text size="xl" fw={700} mb="lg">
                Incoming Showcase Requests
            </Text>

            <DataTable
                withTableBorder
                textSelectionDisabled
                columns={[
                    {
                        accessor: 'title',
                        title: 'Title',
                        render: (record) => <Text fw={500}>{record.title}</Text>,
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
                                        disabled={isProcessing === record.id}
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
                                        disabled={isProcessing === record.id}
                                    >
                                        <IconEdit size={16} />
                                    </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Deny showcase" position="top" withArrow>
                                    <ActionIcon
                                        size="sm"
                                        variant="subtle"
                                        color="red"
                                        onClick={() => handleDenyShowcase(record.id)}
                                        loading={isProcessing === record.id}
                                        disabled={isProcessing !== null}
                                    >
                                        <IconX size={16} />
                                    </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Approve showcase" position="top" withArrow>
                                    <ActionIcon
                                        size="sm"
                                        variant="subtle"
                                        color="teal"
                                        onClick={() => handleApproveShowcase(record.id)}
                                        loading={isProcessing === record.id}
                                        disabled={isProcessing !== null}
                                    >
                                        <IconCheck size={16} />
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
                                        disabled={isProcessing === record.id}
                                    >
                                        <IconTrash size={16} />
                                    </ActionIcon>
                                </Tooltip>
                            </Group>
                        ),
                    },
                ]}
                records={showcases}
                emptyState={
                    <Text ta="center" c="dimmed">
                        No showcase requests found
                    </Text>
                }
            />

            <Modal
                opened={deleteModalOpened}
                onClose={() => setDeleteModalOpened(false)}
                title="Confirm Deletion"
                centered
            >
                <Text>
                    Are you sure you want to delete the showcase{' '}
                    <Text fw={700} component="span">
                        {showcaseToDelete?.title}
                    </Text>
                    ?
                </Text>
                <Group justify="right" mt="md">
                    <Button variant="default" onClick={() => setDeleteModalOpened(false)} disabled={isProcessing !== null}>
                        Cancel
                    </Button>
                    <Button
                        color="red"
                        onClick={handleDeleteShowcase}
                        loading={isProcessing === showcaseToDelete?.id}
                        disabled={isProcessing !== null && isProcessing !== showcaseToDelete?.id}
                    >
                        Delete
                    </Button>
                </Group>
            </Modal>
        </Container>
    );
}
