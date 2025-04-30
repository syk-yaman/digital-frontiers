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
} from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconTrash, IconMail, IconUserPlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import '@mantine/core/styles.layer.css';
import 'mantine-datatable/styles.layer.css';

interface UserItem {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isAdmin: boolean;
    createdAt: string;
    updatedAt: string;
    organization?: string;
}

export function AdminUsers() {
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activePage, setActivePage] = useState(1);
    const [deleteModalOpened, setDeleteModalOpened] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);

    const itemsPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
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
    }, []);

    const handleDeleteUser = () => {
        if (!userToDelete) return;

        // This functionality is not yet implemented in the backend
        notifications.show({
            title: 'Feature Coming Soon',
            message: 'User deletion will be available in a future update.',
            color: 'blue',
        });
        setDeleteModalOpened(false);
        setUserToDelete(null);
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
                    onClick={() => notifications.show({
                        title: 'Feature Coming Soon',
                        message: 'Creating new users directly will be available in a future update.',
                        color: 'blue',
                    })}
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
                        accessor: 'organization',
                        title: 'Organization',
                        render: (record) => <Text>{record.organization || 'N/A'}</Text>,
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
                                        onClick={() => {
                                            // Feature not yet implemented
                                            notifications.show({
                                                title: 'Feature Coming Soon',
                                                message: 'User editing will be available in a future update.',
                                                color: 'blue',
                                            });
                                        }}
                                    >
                                        <IconEdit size={16} />
                                    </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Send email" position="top" withArrow>
                                    <ActionIcon
                                        size="sm"
                                        variant="subtle"
                                        color="green"
                                        onClick={() => {
                                            window.location.href = `mailto:${record.email}`;
                                        }}
                                    >
                                        <IconMail size={16} />
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
                        This will permanently remove the user and all associated data.
                    </Text>
                </Stack>
                <Group justify="right" mt="md">
                    <Button variant="default" onClick={() => setDeleteModalOpened(false)}>
                        Cancel
                    </Button>
                    <Button color="red" onClick={handleDeleteUser}>
                        Delete
                    </Button>
                </Group>
            </Modal>
        </Container>
    );
}
