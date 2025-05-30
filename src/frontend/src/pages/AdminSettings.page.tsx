import React, { useEffect, useState } from 'react';
import { TextInput, Textarea, Button, Group, Paper, Title, Stack, Text, Box, Loader, ActionIcon } from '@mantine/core';
import axiosInstance from '@/utils/axiosInstance';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconTrash } from '@tabler/icons-react';

export function AdminSettingsPage() {
    const [values, setValues] = useState({
        hero_secondary_text: '',
        hero_main_text: '',
        dataset_submission_message: '',
        terms_and_conditions: '',
        partners: [] as { name: string; imageLink: string }[],
        about: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axiosInstance.get('/settings')
            .then(res => {
                // Defensive: ensure partners is always an array of objects with name and imageLink
                let partners: { name: string; imageLink: string }[] = [];
                // Fix: If backend returns a string, try to parse it as JSON
                let rawPartners = res.data.partners;
                if (typeof rawPartners === 'string') {
                    try {
                        rawPartners = JSON.parse(rawPartners);
                    } catch {
                        rawPartners = [];
                    }
                }
                if (Array.isArray(rawPartners)) {
                    partners = rawPartners.map((p: any) => ({
                        name: typeof p?.name === 'string' ? p.name : '',
                        imageLink: typeof p?.imageLink === 'string' ? p.imageLink : ''
                    }));
                }
                setValues({
                    hero_secondary_text: res.data.hero_secondary_text ?? '',
                    hero_main_text: res.data.hero_main_text ?? '',
                    dataset_submission_message: res.data.dataset_submission_message ?? '',
                    terms_and_conditions: res.data.terms_and_conditions ?? '',
                    partners,
                    about: res.data.about ?? '',
                });
            });
    }, []);

    const handleChange = (field: string, value: string) => {
        setValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async (key: string) => {
        setLoading(true);
        let value = values[key as keyof typeof values];
        // For partners, always send as JSON string to backend
        if (key === 'partners') {
            value = JSON.stringify(
                (value as any[]).map((p) => ({
                    name: p.name ?? '',
                    imageLink: p.imageLink ?? ''
                }))
            );
        }
        try {
            await axiosInstance.put('/settings', { key, value });
            notifications.show({
                title: 'Success',
                message: 'Saved successfully',
                color: 'green',
            });
        } catch (e: any) {
            notifications.show({
                title: 'Error',
                message: e?.response?.data?.message || 'Error saving setting',
                color: 'red',
            });
        }
        setLoading(false);
    };

    // Partners UI handlers
    const handlePartnerChange = (idx: number, field: 'name' | 'imageLink', value: string) => {
        setValues((prev) => {
            const partners = Array.isArray(prev.partners) ? [...prev.partners] : [];
            partners[idx] = { ...partners[idx], [field]: value };
            return { ...prev, partners };
        });
    };

    const handleAddPartner = () => {
        setValues((prev) => ({
            ...prev,
            partners: Array.isArray(prev.partners)
                ? [...prev.partners, { name: '', imageLink: '' }]
                : [{ name: '', imageLink: '' }]
        }));
    };

    const handleRemovePartner = (idx: number) => {
        setValues((prev) => {
            const partners = Array.isArray(prev.partners) ? [...prev.partners] : [];
            partners.splice(idx, 1);
            return { ...prev, partners };
        });
    };

    return (
        <Box maw={700} mx="auto">
            <Title order={2} mb="md">Platform Settings</Title>
            {loading && (
                <Group justify="center" mb="md">
                    <Loader size="sm" />
                </Group>
            )}
            <Stack gap="md">
                <Paper p="md" withBorder>
                    <Text fw={500} mb={4}>Hero Main Text</Text>
                    <TextInput
                        value={values.hero_main_text}
                        onChange={e => handleChange('hero_main_text', e.target.value)}
                        placeholder="Main text for homepage hero"
                    />
                    <Group mt="xs">
                        <Button onClick={() => handleSave('hero_main_text')}>Save</Button>
                    </Group>
                </Paper>
                <Paper p="md" withBorder>
                    <Text fw={500} mb={4}>Hero Secondary Text</Text>
                    <TextInput
                        value={values.hero_secondary_text}
                        onChange={e => handleChange('hero_secondary_text', e.target.value)}
                        placeholder="Secondary text for homepage hero"
                    />
                    <Group mt="xs">
                        <Button onClick={() => handleSave('hero_secondary_text')}>Save</Button>
                    </Group>
                </Paper>
                <Paper p="md" withBorder>
                    <Text fw={500} mb={4}>Dataset Submission Message</Text>
                    <Textarea
                        value={values.dataset_submission_message}
                        onChange={e => handleChange('dataset_submission_message', e.target.value)}
                        placeholder="Message shown after dataset submission"
                        autosize
                        minRows={2}
                    />
                    <Group mt="xs">
                        <Button onClick={() => handleSave('dataset_submission_message')}>Save</Button>
                    </Group>
                </Paper>
                <Paper p="md" withBorder>
                    <Text fw={500} mb={4}>Terms and Conditions</Text>
                    <Textarea
                        value={values.terms_and_conditions}
                        onChange={e => handleChange('terms_and_conditions', e.target.value)}
                        placeholder="content (could be HTML) for terms and conditions"
                        autosize
                        minRows={4}
                    />
                    <Group mt="xs">
                        <Button onClick={() => handleSave('terms_and_conditions')}>Save</Button>
                    </Group>
                </Paper>
                <Paper p="md" withBorder>
                    <Text fw={500} mb={4}>About</Text>
                    <Textarea
                        value={values.about}
                        onChange={e => handleChange('about', e.target.value)}
                        placeholder="content (could be HTML) for about section"
                        autosize
                        minRows={4}
                    />
                    <Group mt="xs">
                        <Button onClick={() => handleSave('about')}>Save</Button>
                    </Group>
                </Paper>
                <Paper p="md" withBorder>
                    <Text fw={500} mb={4}>Partners</Text>
                    <Text size="sm" c="dimmed" mb={8}>
                        Add partners below. Each partner has a name and an image link.
                    </Text>
                    <Stack gap="xs">
                        {Array.isArray(values.partners) && values.partners.map((partner, idx) => (
                            <Group key={idx} align="center">
                                <TextInput
                                    value={partner.name}
                                    onChange={e => handlePartnerChange(idx, 'name', e.target.value)}
                                    placeholder="Partner name"
                                    style={{ flex: 2 }}
                                />
                                <TextInput
                                    value={partner.imageLink}
                                    onChange={e => handlePartnerChange(idx, 'imageLink', e.target.value)}
                                    placeholder="Image link"
                                    style={{ flex: 3 }}
                                />
                                <ActionIcon color="red" variant="light" onClick={() => handleRemovePartner(idx)}>
                                    <IconTrash size={18} />
                                </ActionIcon>
                            </Group>
                        ))}
                        <Button
                            leftSection={<IconPlus size={16} />}
                            variant="light"
                            color="blue"
                            onClick={handleAddPartner}
                            mt="xs"
                        >
                            Add Partner
                        </Button>
                    </Stack>
                    <Group mt="xs">
                        <Button onClick={() => handleSave('partners')}>Save Partners</Button>
                    </Group>
                </Paper>
            </Stack>
        </Box>
    );
}
