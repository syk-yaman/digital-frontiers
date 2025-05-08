import {
    Container,
    Text,
    Center,
    Loader,
    Group,
    ActionIcon,
    Modal,
    Button,
    Stack,
    Badge,
    Avatar,
    Tooltip,
    TextInput,
    Select,
    Checkbox,
    ScrollArea,
    Box,
    Card,
    SimpleGrid,
    PasswordInput,
} from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import { notifications } from '@mantine/notifications';
import {
    IconEdit,
    IconTrash,
    IconDatabase,
    IconUserPlus,
    IconCopy,
    IconCheck,
    IconUser
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import '@mantine/core/styles.layer.css';
import 'mantine-datatable/styles.layer.css';
import { useForm } from '@mantine/form';
import { useClipboard } from '@mantine/hooks';

interface UserItem {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    company: string;
    type: string;
    isAdmin: boolean;
    isActivated?: boolean;
    createdAt: string;
    updatedAt: string;
}

interface DatasetItem {
    id: number;
    name: string;
    datasetType: string;
    createdAt: string;
    approvedAt: string | null;
}

interface UserFormValues {
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    password?: string;
    type: string;
    isAdmin: boolean;
    isActivated: boolean;
}

export function AdminUsers() {
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activePage, setActivePage] = useState(1);
    const [deleteModalOpened, setDeleteModalOpened] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);
    const [formModalOpened, setFormModalOpened] = useState(false);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [datasetsModalOpened, setDatasetsModalOpened] = useState(false);
    const [userDatasets, setUserDatasets] = useState<DatasetItem[]>([]);
    const [datasetsLoading, setDatasetsLoading] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const clipboard = useClipboard();

    const itemsPerPage = 10;
    const navigate = useNavigate();

    const userTypes = [
        { value: 'public_sector', label: 'Public Sector' },
        { value: 'sme', label: 'SME' },
        { value: 'large_business', label: 'Large Business' },
        { value: 'university', label: 'University' },
        { value: 'citizen_scientist', label: 'Citizen Scientist' },
        { value: 'none', label: 'None' },
    ];

    // Form setup for creating/editing users
    const form = useForm<UserFormValues>({
        initialValues: {
            firstName: '',
            lastName: '',
            email: '',
            company: '',
            password: '',
            type: 'none',
            isAdmin: false,
            isActivated: true,
        },
        validate: {
            firstName: (value) => (value.trim().length < 2 ? 'First name must be at least 2 characters' : null),
            lastName: (value) => (value.trim().length < 2 ? 'Last name must be at least 2 characters' : null),
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
            company: (value) => (value.trim().length < 2 ? 'Company must be at least 2 characters' : null),
            password: (value, values) => {
                // Only require password when creating a new user or explicitly changing it
                if (!editingUserId && (value ?? '').length < 8) {
                    return 'Password must be at least 8 characters';
                }
                // For editing, allow empty password (no change)
                if (editingUserId && value !== '' && (value?.length ?? 0) < 8) {
                    return 'Password must be at least 8 characters if provided';
                }
                return null;
            },
        }
    });

    // Fetch users data
    const fetchUsers = () => {
        setLoading(true);
        axiosInstance
            .get('/users')
            .then((response) => {
                setUsers(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching users:', error);
                notifications.show({
                    title: 'Error',
                    message: 'Failed to fetch users.',
                    color: 'red',
                });
                setError('Failed to fetch users.');
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Function to fetch user's datasets
    const fetchUserDatasets = (userId: string) => {
        setDatasetsLoading(true);
        setSelectedUserId(userId);

        axiosInstance
            .get(`/users/${userId}/datasets`)
            .then((response) => {
                setUserDatasets(response.data);
                setDatasetsLoading(false);
                setDatasetsModalOpened(true);
            })
            .catch((error) => {
                console.error('Error fetching user datasets:', error);
                notifications.show({
                    title: 'Error',
                    message: 'Failed to fetch user datasets.',
                    color: 'red',
                });
                setDatasetsLoading(false);
            });
    };

    // Handle user deletion
    const handleDeleteUser = () => {
        if (!userToDelete) return;

        setIsDeleting(true);
        axiosInstance
            .delete(`/users/${userToDelete.id}`)
            .then((response) => {
                notifications.show({
                    title: 'Success',
                    message: response.data.message || 'User deleted successfully.',
                    color: 'green',
                });
                // Update the users list
                setUsers((prev) => prev.filter((user) => user.id !== userToDelete.id));
                setDeleteModalOpened(false);
                setUserToDelete(null);
            })
            .catch((error) => {
                console.error('Error deleting user:', error);
                notifications.show({
                    title: 'Error',
                    message: error.response?.data?.message || 'Failed to delete user.',
                    color: 'red',
                });
            })
            .finally(() => {
                setIsDeleting(false);
            });
    };

    // Open create user dialog
    const openCreateDialog = () => {
        form.reset();
        setEditingUserId(null);
        setFormModalOpened(true);
    };

    // Open edit user dialog
    const openEditDialog = (user: UserItem) => {
        form.setValues({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            company: user.company,
            password: '', // Don't show existing password
            type: user.type,
            isAdmin: user.isAdmin,
            isActivated: user.isActivated || false,
        });
        setEditingUserId(user.id);
        setFormModalOpened(true);
    };

    // Handle form submission (create/edit user)
    const handleSubmitUser = (values: UserFormValues) => {
        setIsSubmitting(true);

        // Remove password if empty (edit mode and no password change)
        const payload = { ...values };
        if (editingUserId && !payload.password) {
            delete payload.password;
        }

        const isEditing = editingUserId !== null;
        const endpoint = isEditing ? `/users/${editingUserId}` : '/users';
        const method = isEditing ? 'put' : 'post';

        axiosInstance({
            method,
            url: endpoint,
            data: payload
        })
            .then((response) => {
                notifications.show({
                    title: 'Success',
                    message: `User ${isEditing ? 'updated' : 'created'} successfully.`,
                    color: 'green',
                });

                // Update the users list - either add the new user or update the existing one
                if (isEditing) {
                    setUsers(prev =>
                        prev.map(user => user.id === editingUserId ? response.data : user)
                    );
                } else {
                    setUsers(prev => [...prev, response.data]);
                }

                setFormModalOpened(false);
                form.reset();
            })
            .catch((error) => {
                console.error(`Error ${isEditing ? 'updating' : 'creating'} user:`, error);
                notifications.show({
                    title: 'Error',
                    message: error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} user.`,
                    color: 'red',
                });
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    const closeFormModal = () => {
        setFormModalOpened(false);
        setEditingUserId(null);
        form.reset();
    };

    // Copy email to clipboard
    const copyEmailToClipboard = (email: string) => {
        clipboard.copy(email);
        notifications.show({
            title: 'Email Copied',
            message: 'Email address has been copied to clipboard.',
            color: 'green',
            icon: <IconCheck size={16} />,
        });
    };

    const paginatedUsers = users.slice(
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

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`;
    };

    return (
        <Container>
            <Group justify="space-between" mb="lg">
                <Text size="xl" fw={700}>
                    All Users
                </Text>
                <Button
                    leftSection={<IconUserPlus size={16} />}
                    onClick={openCreateDialog}
                >
                    Add New User
                </Button>
            </Group>

            <DataTable
                withTableBorder
                textSelectionDisabled
                columns={[
                    {
                        accessor: 'user',
                        title: 'User',
                        render: (record) => (
                            <Group gap="sm">
                                <Avatar color="blue" radius="xl">
                                    {getInitials(record.firstName, record.lastName)}
                                </Avatar>
                                <div>
                                    <Text fw={500}>
                                        {record.firstName} {record.lastName}
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                        {record.email}
                                    </Text>
                                </div>
                            </Group>
                        ),
                    },
                    {
                        accessor: 'role',
                        title: 'Role',
                        render: (record) => (
                            <Badge color={record.isAdmin ? 'orange' : 'blue'}>
                                {record.isAdmin ? 'Admin' : 'User'}
                            </Badge>
                        ),
                    },
                    {
                        accessor: 'company',
                        title: 'Organization',
                        render: (record) => <Text>{record.company || 'N/A'}</Text>,
                    },
                    {
                        accessor: 'status',
                        title: 'Status',
                        render: (record) => (
                            <Badge color={record.isActivated ? 'green' : 'gray'}>
                                {record.isActivated ? 'Active' : 'Inactive'}
                            </Badge>
                        ),
                    },
                    {
                        accessor: 'createdAt',
                        title: 'Joined',
                        render: (record) => new Date(record.createdAt).toLocaleDateString(),
                    },
                    {
                        accessor: 'actions',
                        title: 'Actions',
                        render: (record) => (
                            <Group gap={4} justify="right" wrap="nowrap">
                                <Tooltip label="Edit user" position="top" withArrow>
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
                                        color="green"
                                        onClick={() => fetchUserDatasets(record.id)}
                                    >
                                        <IconDatabase size={16} />
                                    </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Copy email" position="top" withArrow>
                                    <ActionIcon
                                        size="sm"
                                        variant="subtle"
                                        color="teal"
                                        onClick={() => copyEmailToClipboard(record.email)}
                                    >
                                        <IconCopy size={16} />
                                    </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Delete user" position="top" withArrow>
                                    <ActionIcon
                                        size="sm"
                                        variant="subtle"
                                        color="red"
                                        onClick={() => {
                                            setUserToDelete(record);
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
                records={paginatedUsers}
                totalRecords={users.length}
                recordsPerPage={itemsPerPage}
                page={activePage}
                onPageChange={setActivePage}
                emptyState={
                    <Text ta="center" c="dimmed">
                        No users found
                    </Text>
                }
            />

            {/* Delete Confirmation Modal */}
            <Modal
                opened={deleteModalOpened}
                onClose={() => setDeleteModalOpened(false)}
                title="Confirm Deletion"
                centered
            >
                <Stack>
                    <Text>
                        Are you sure you want to delete the user{' '}
                        <Text span fw={700}>
                            {userToDelete?.firstName} {userToDelete?.lastName}
                        </Text>
                        ?
                    </Text>
                    <Text size="sm" c="dimmed">
                        This action will transfer all of the user's datasets to your admin account.
                    </Text>
                </Stack>
                <Group justify="right" mt="md">
                    <Button variant="default" onClick={() => setDeleteModalOpened(false)} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button color="red" onClick={handleDeleteUser} loading={isDeleting}>
                        Delete
                    </Button>
                </Group>
            </Modal>

            {/* Create/Edit User Modal */}
            <Modal
                opened={formModalOpened}
                onClose={closeFormModal}
                title={editingUserId ? "Edit User" : "Create New User"}
                centered
                size="lg"
            >
                <form onSubmit={form.onSubmit(handleSubmitUser)}>
                    <SimpleGrid cols={2} mb="md">
                        <TextInput
                            label="First Name"
                            placeholder="Enter first name"
                            required
                            {...form.getInputProps('firstName')}
                        />
                        <TextInput
                            label="Last Name"
                            placeholder="Enter last name"
                            required
                            {...form.getInputProps('lastName')}
                        />
                    </SimpleGrid>

                    <TextInput
                        label="Email"
                        placeholder="user@example.com"
                        required
                        mb="md"
                        {...form.getInputProps('email')}
                    />

                    <TextInput
                        label="Company/Organization"
                        placeholder="Enter company or organization"
                        required
                        mb="md"
                        {...form.getInputProps('company')}
                    />

                    <PasswordInput
                        label={editingUserId ? "New Password (leave empty to keep current)" : "Password"}
                        placeholder={editingUserId ? "Enter new password" : "Enter password"}
                        required={!editingUserId}
                        mb="md"
                        {...form.getInputProps('password')}
                    />

                    <Select
                        label="User Type"
                        placeholder="Select user type"
                        data={userTypes}
                        required
                        mb="md"
                        {...form.getInputProps('type')}
                    />

                    <Group mb="xl">
                        <Checkbox
                            label="Admin privileges"
                            {...form.getInputProps('isAdmin', { type: 'checkbox' })}
                        />
                        <Checkbox
                            label="Account activated"
                            {...form.getInputProps('isActivated', { type: 'checkbox' })}
                        />
                    </Group>

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
                            {editingUserId ? "Save Changes" : "Create User"}
                        </Button>
                    </Group>
                </form>
            </Modal>

            {/* User Datasets Modal */}
            <Modal
                opened={datasetsModalOpened}
                onClose={() => setDatasetsModalOpened(false)}
                title="User Datasets"
                centered
                size="xl"
            >
                {datasetsLoading ? (
                    <Center p="xl">
                        <Loader />
                    </Center>
                ) : userDatasets.length === 0 ? (
                    <Center p="xl">
                        <Stack align="center">
                            <IconDatabase size={40} opacity={0.5} />
                            <Text c="dimmed">This user has no datasets.</Text>
                        </Stack>
                    </Center>
                ) : (
                    <ScrollArea h={400}>
                        <SimpleGrid cols={2} spacing="md">
                            {userDatasets.map((dataset) => (
                                <Card key={dataset.id} withBorder shadow="sm" p="md" radius="md">
                                    <Group justify="space-between" mb="xs">
                                        <Text fw={500}>{dataset.name}</Text>
                                        <Badge color={dataset.datasetType === 'open' ? 'blue' : 'orange'}>
                                            {dataset.datasetType === 'open' ? 'Open' : 'Controlled'}
                                        </Badge>
                                    </Group>
                                    <Text size="sm" c="dimmed" mb="md">
                                        Created: {new Date(dataset.createdAt).toLocaleDateString()}
                                    </Text>
                                    <Group justify="space-between">
                                        <Button
                                            variant="light"
                                            size="xs"
                                            onClick={() => navigate(`/dataset/${dataset.id}`)}
                                        >
                                            View Dataset
                                        </Button>
                                    </Group>
                                </Card>
                            ))}
                        </SimpleGrid>
                    </ScrollArea>
                )}
                <Group justify="right" mt="md">
                    <Button onClick={() => setDatasetsModalOpened(false)}>Close</Button>
                </Group>
            </Modal>
        </Container>
    );
}
