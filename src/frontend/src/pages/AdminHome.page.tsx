import { Card, Text, Group, SimpleGrid, Progress, Badge } from '@mantine/core';
import { LineChart } from '@mantine/charts';
import { useEffect, useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';

export function AdminHome() {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await axiosInstance.get('/stats/admin-home');
                setStats(res.data);
            } catch (e) {
                setStats(null);
            }
        }
        fetchStats();
    }, []);

    return (
        <div>
            <Text size="xl" fw={700} mb="lg">
                Platform Overview
            </Text>
            <SimpleGrid cols={3} spacing="lg" >
                <Card shadow="sm" padding="lg">
                    <Group justify="space-between" mb="xs">
                        <Text >Total Users</Text>

                    </Group>
                    <Text size="xl" w={700}>
                        {stats?.totalUsers ?? '...'}
                    </Text>
                </Card>

                <Card shadow="sm" padding="lg">
                    <Group justify="space-between" mb="xs">
                        <Text >Datasets Added</Text>

                    </Group>
                    <Text size="xl" >
                        {stats?.totalDatasets ?? '...'}
                    </Text>
                </Card>

                <Card shadow="sm" padding="lg">
                    <Group justify="space-between" mb="xs">
                        <Text >Live datasets</Text>
                    </Group>
                    <Text size="xl" >
                        {stats?.liveDatasets ?? '...'}
                    </Text>
                </Card>
            </SimpleGrid>

            <Text size="xl" fw={700} mt="xl" mb="lg">
                Statistics
            </Text>
            <SimpleGrid cols={2} spacing="lg" >
                <Card shadow="sm" padding="lg">
                    <Text mb="xs">
                        User growth over time
                    </Text>
                    <LineChart
                        h={220}
                        data={stats?.userGrowth ?? []}
                        dataKey="date"
                        series={[{ name: 'count', color: 'blue', label: 'Users' }]}
                        withDots
                        valueFormatter={(value: number) => value.toString()}
                    />
                </Card>

                <Card shadow="sm" padding="lg">
                    <Text mb="xs">
                        Dataset approved
                    </Text>
                    <Progress value={stats?.approvedPercent ?? 0} color="green" size="lg" />
                    <Text size="sm" mt="xs">
                        {stats?.approvedPercent ?? 0}% of total datasets added
                    </Text>
                </Card>
            </SimpleGrid>
        </div>
    );
}
