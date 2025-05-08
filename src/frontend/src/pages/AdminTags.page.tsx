import {
    Container,
    Text,
    Center,
    Loader,
    Group,
    ActionIcon,
    Modal,
    Button,
    Badge,
    Stack,
    Tooltip,
} from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconTrash, IconPlus, IconDatabase } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import '@mantine/core/styles.layer.css';
import 'mantine-datatable/styles.layer.css';

interface TagItem {
    id: number;
    name: string;
    colour: string;
    icon: string;
    orderInNavbar?: number;
    createdAt: string;
    updatedAt: string;
    datasetsCount?: number; // Added property for dataset count
}

export function AdminTags() {
    const [tags, setTags] = useState<TagItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activePage, setActivePage] = useState(1);
    const [deleteModalOpened, setDeleteModalOpened] = useState(false);
    const [tagToDelete, setTagToDelete] = useState<TagItem | null>(null);

    const itemsPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        axiosInstance
            .get('/tags')
            .then((response) => {
                setTags(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching tags:', error);
                notifications.show({
                    title: 'Error',
                    message: 'Failed to fetch tags.',
                    color: 'red',
                });
                setError('Failed to fetch tags.');
                setLoading(false);
            });
    }, []);

    const handleDeleteTag = () => {
        if (!tagToDelete) return;

        axiosInstance
            .delete(`/tags/${tagToDelete.id}`)
            .then(() => {
                notifications.show({
                    title: 'Success',
                    message: `Tag "${tagToDelete.name}" deleted successfully.`,
                    color: 'green',
                });
                setTags((prev) => prev.filter((tag) => tag.id !== tagToDelete.id));
                setDeleteModalOpened(false);
                setTagToDelete(null);
            })
            .catch((error) => {
                console.error('Error deleting tag:', error);
                notifications.show({
                    title: 'Error',
                    message: 'Failed to delete tag.',
                    color: 'red',
                });
            });
    };

    const paginatedTags = tags.slice(
        (activePage - 1) * itemsPerPage,
        activePage * itemsPerPage
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
                    Manage Tags
                </Text>
                <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={() => notifications.show({
                        title: 'Feature Coming Soon',
                        message: 'Creating new tags directly will be available in a future update.',
                        color: 'blue',
                    })}
                >
                    Add New Tag
                </Button>
            </Group>

            <DataTable
                withTableBorder
                textSelectionDisabled
                columns={[
                    {
                        accessor: 'name',
                        title: 'Name',
                        render: (record) => <Text fw={500}>{record.name}</Text>,
                    },
                    {
                        accessor: 'colour',
                        title: 'Color',
                        render: (record) => (
                            <Badge
                                style={{
                                    backgroundColor: record.colour,
                                    color: getBestTextColor(record.colour),
                                    width: '80px',
                                    height: '25px',
                                }}
                            >
                                {record.colour}
                            </Badge>
                        ),
                    },
                    {
                        accessor: 'icon',
                        title: 'Icon',
                        render: (record) => <Text>{record.icon}</Text>,
                    },
                    {
                        accessor: 'datasetsCount',
                        title: 'Datasets',
                        render: (record) => (
                            <Group gap={4} align="center">
                                <IconDatabase size={16} />
                                <Text>{record.datasetsCount || 0}</Text>
                            </Group>
                        ),
                        sortable: true,
                    },
                    {
                        accessor: 'orderInNavbar',
                        title: 'Nav Order',
                        render: (record) => <Text>{record.orderInNavbar || 'N/A'}</Text>,
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
                                <Tooltip label="View tag datasets" position="top" withArrow>
                                    <ActionIcon
                                        size="sm"
                                        variant="subtle"
                                        color="blue"
                                        onClick={() => navigate(`/data-menu/tag/${record.id}`)}
                                    >
                                        <IconEdit size={16} />
                                    </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Delete tag" position="top" withArrow>
                                    <ActionIcon
                                        size="sm"
                                        variant="subtle"
                                        color="red"
                                        onClick={() => {
                                            setTagToDelete(record);
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
                records={paginatedTags}
                totalRecords={tags.length}
                recordsPerPage={itemsPerPage}
                page={activePage}
                onPageChange={setActivePage}
                emptyState={
                    <Text ta="center" c="dimmed">
                        No tags found
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
                        Are you sure you want to delete the tag{' '}
                        <Text span fw={700}>
                            {tagToDelete?.name}
                        </Text>
                        ?
                    </Text>
                    <Text size="sm" c="dimmed">
                        This will remove the tag from all associated datasets.
                    </Text>
                </Stack>
                <Group justify="right" mt="md">
                    <Button variant="default" onClick={() => setDeleteModalOpened(false)}>
                        Cancel
                    </Button>
                    <Button color="red" onClick={handleDeleteTag}>
                        Delete
                    </Button>
                </Group>
            </Modal>
        </Container>
    );
}

// Helper function to determine best text color (black or white) based on background color
function getBestTextColor(hexColor: string): string {
    // Default to white if color is invalid
    if (!hexColor || !hexColor.match(/^#[0-9A-Fa-f]{6}$/)) {
        return '#ffffff';
    }

    // Extract RGB components
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return black for light colors and white for dark colors
    return luminance > 0.5 ? '#000000' : '#ffffff';
}
