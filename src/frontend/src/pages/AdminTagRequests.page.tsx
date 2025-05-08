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
    Alert,
    TextInput,
    ColorInput,
    NumberInput,
    Box,
} from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconTrash, IconDatabase, IconCheck, IconInfoCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import '@mantine/core/styles.layer.css';
import 'mantine-datatable/styles.layer.css';
import { useForm } from '@mantine/form';
import { isHexColor } from '@/utils/validators';

interface TagItem {
    id: number;
    name: string;
    colour: string;
    icon: string;
    orderInNavbar?: number;
    createdAt: string;
    updatedAt: string;
    datasetsCount?: number;
}

interface TagFormValues {
    name: string;
    colour: string;
    icon: string;
    orderInNavbar?: number | null;
}

export function AdminTagRequests() {
    const [tags, setTags] = useState<TagItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activePage, setActivePage] = useState(1);
    const [deleteModalOpened, setDeleteModalOpened] = useState(false);
    const [tagToDelete, setTagToDelete] = useState<TagItem | null>(null);
    const [formModalOpened, setFormModalOpened] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [editingTagId, setEditingTagId] = useState<number | null>(null);
    const [approveModalOpened, setApproveModalOpened] = useState(false);
    const [tagToApprove, setTagToApprove] = useState<TagItem | null>(null);

    const itemsPerPage = 10;
    const navigate = useNavigate();

    // Form setup for editing a tag
    const form = useForm<TagFormValues>({
        initialValues: {
            name: '',
            colour: '#1c7ed6',
            icon: '🏷️',
            orderInNavbar: null,
        },
        validate: {
            name: (value) => (value.trim().length < 2 ? 'Name must be at least 2 characters' : null),
            colour: (value) => (isHexColor(value) ? null : 'Must be a valid hex color (e.g. #FF5733)'),
            icon: (value) => (value.trim().length === 0 ? 'Icon is required' : null),
            orderInNavbar: (value) => (value !== null && value !== undefined && value < 0 ? 'Order must be a positive number' : null),
        },
    });

    const fetchTags = () => {
        setLoading(true);
        axiosInstance
            .get('/tags/requests')
            .then((response) => {
                setTags(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching pending tags:', error);
                notifications.show({
                    title: 'Error',
                    message: 'Failed to fetch pending tags.',
                    color: 'red',
                });
                setError('Failed to fetch pending tags.');
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchTags();
    }, []);

    const handleDeleteTag = () => {
        if (!tagToDelete) return;

        axiosInstance
            .delete(`/tags/${tagToDelete.id}`)
            .then((response) => {
                const message = response.data?.message || `Tag "${tagToDelete.name}" deleted successfully.`;
                notifications.show({
                    title: 'Success',
                    message,
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

    const handleApproveTag = () => {
        if (!tagToApprove) return;

        setIsApproving(true);
        axiosInstance
            .put(`/tags/${tagToApprove.id}/approve`)
            .then((response) => {
                notifications.show({
                    title: 'Success',
                    message: `Tag "${tagToApprove.name}" approved successfully.`,
                    color: 'green',
                });
                // Remove the approved tag from the list
                setTags((prev) => prev.filter((tag) => tag.id !== tagToApprove.id));
                setApproveModalOpened(false);
                setTagToApprove(null);
            })
            .catch((error) => {
                console.error('Error approving tag:', error);
                notifications.show({
                    title: 'Error',
                    message: 'Failed to approve tag.',
                    color: 'red',
                });
            })
            .finally(() => {
                setIsApproving(false);
            });
    };

    const openEditDialog = (tag: TagItem) => {
        form.setValues({
            name: tag.name,
            colour: tag.colour,
            icon: tag.icon,
            orderInNavbar: tag.orderInNavbar || null,
        });
        setEditingTagId(tag.id);
        setFormModalOpened(true);
    };

    const handleSubmitTag = (values: TagFormValues) => {
        setIsSubmitting(true);

        // Convert empty orderInNavbar to undefined so it doesn't get sent to the API
        const payload = {
            ...values,
            orderInNavbar: values.orderInNavbar === null ? undefined : values.orderInNavbar
        };

        axiosInstance({
            method: 'put',
            url: `/tags/${editingTagId}`,
            data: payload
        })
            .then((response) => {
                notifications.show({
                    title: 'Success',
                    message: `Tag updated successfully.`,
                    color: 'green',
                });

                // Update the tag in the existing list
                setTags(prev =>
                    prev.map(tag => tag.id === editingTagId ? { ...response.data, datasetsCount: tag.datasetsCount } : tag)
                );

                setFormModalOpened(false);
                form.reset();
            })
            .catch((error) => {
                console.error('Error updating tag:', error);
                const errorMessage = error.response?.data?.message || 'Failed to update tag.';

                // Show different messages based on error status
                if (error.response?.status === 400) {
                    notifications.show({
                        title: 'Validation Error',
                        message: errorMessage,
                        color: 'red',
                    });
                } else if (error.response?.status === 403) {
                    notifications.show({
                        title: 'Permission Denied',
                        message: 'You don\'t have permission to edit tags.',
                        color: 'red',
                    });
                } else if (error.response?.status === 409) {
                    notifications.show({
                        title: 'Conflict',
                        message: errorMessage,
                        color: 'orange',
                    });
                } else {
                    notifications.show({
                        title: 'Error',
                        message: errorMessage,
                        color: 'red',
                    });
                }
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    const closeFormModal = () => {
        setFormModalOpened(false);
        setEditingTagId(null);
        form.reset();
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
            <Text size="xl" fw={700} mb="lg">
                Pending Tag Approvals
            </Text>

            <Alert
                icon={<IconInfoCircle size="1rem" />}
                title="Note"
                color="blue"
                mb="lg"
            >
                You can approve tags manually here, or they will be automatically approved when approving datasets.
            </Alert>

            {tags.length === 0 ? (
                <Center style={{ height: '40vh' }}>
                    <Text c="dimmed">No pending tag approvals found.</Text>
                </Center>
            ) : (
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
                                    <Tooltip label="Approve tag" position="top" withArrow>
                                        <ActionIcon
                                            size="sm"
                                            variant="subtle"
                                            color="green"
                                            onClick={() => {
                                                setTagToApprove(record);
                                                setApproveModalOpened(true);
                                            }}
                                        >
                                            <IconCheck size={16} />
                                        </ActionIcon>
                                    </Tooltip>
                                    <Tooltip label="Edit tag" position="top" withArrow>
                                        <ActionIcon
                                            size="sm"
                                            variant="subtle"
                                            color="blue"
                                            onClick={() => openEditDialog(record)}
                                        >
                                            <IconEdit size={16} />
                                        </ActionIcon>
                                    </Tooltip>
                                    <Tooltip label="View datasets" position="top" withArrow>
                                        <ActionIcon
                                            size="sm"
                                            variant="subtle"
                                            color="teal"
                                            onClick={() => navigate(`/data-menu/tag/${record.id}`)}
                                        >
                                            <IconDatabase size={16} />
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
            )}

            {/* Delete Confirmation Modal */}
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

            {/* Approve Confirmation Modal */}
            <Modal
                opened={approveModalOpened}
                onClose={() => setApproveModalOpened(false)}
                title="Confirm Approval"
                centered
            >
                <Text>
                    Are you sure you want to approve the tag{' '}
                    <Text span fw={700}>
                        {tagToApprove?.name}
                    </Text>
                    ?
                </Text>
                <Group justify="right" mt="md">
                    <Button variant="default" onClick={() => setApproveModalOpened(false)} disabled={isApproving}>
                        Cancel
                    </Button>
                    <Button
                        color="green"
                        onClick={handleApproveTag}
                        loading={isApproving}
                    >
                        Approve
                    </Button>
                </Group>
            </Modal>

            {/* Edit Tag Modal */}
            <Modal
                opened={formModalOpened}
                onClose={closeFormModal}
                title="Edit Tag"
                centered
            >
                <form onSubmit={form.onSubmit(handleSubmitTag)}>
                    <TextInput
                        label="Tag Name"
                        placeholder="Enter tag name"
                        required
                        mb="md"
                        {...form.getInputProps('name')}
                    />

                    <ColorInput
                        label="Tag Color"
                        placeholder="Choose a color"
                        format="hex"
                        swatchesPerRow={7}
                        required
                        mb="md"
                        {...form.getInputProps('colour')}
                    />

                    <TextInput
                        label="Icon"
                        description="Enter an emoji or icon character"
                        placeholder="🏷️"
                        required
                        mb="md"
                        {...form.getInputProps('icon')}
                    />

                    <NumberInput
                        label="Navbar Order"
                        description="Order in the navigation menu (optional)"
                        placeholder="Leave empty if not in navbar"
                        min={0}
                        mb="xl"
                        {...form.getInputProps('orderInNavbar')}
                    />

                    <Box mt="md">
                        <Text fw={500} mb="xs">Preview:</Text>
                        <Badge
                            style={{
                                backgroundColor: form.values.colour,
                                color: getBestTextColor(form.values.colour)
                            }}
                            size="lg"
                            leftSection={form.values.icon}
                        >
                            {form.values.name || 'Tag Name'}
                        </Badge>
                    </Box>

                    <Group justify="right" mt="md">
                        <Button
                            variant="default"
                            onClick={closeFormModal}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            loading={isSubmitting}
                        >
                            Save Changes
                        </Button>
                    </Group>
                </form>
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
