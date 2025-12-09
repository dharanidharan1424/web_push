'use client'

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
)

interface SubscribersChartProps {
    data: { name: string; count: number }[]
}

export function SubscribersBarChart({ data }: SubscribersChartProps) {
    const chartData = {
        labels: data.map(d => d.name),
        datasets: [
            {
                label: 'Subscribers',
                data: data.map(d => d.count),
                backgroundColor: 'rgba(37, 99, 235, 0.8)', // Blue-600
                borderRadius: 4,
            },
        ],
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: { color: '#1f2937' } // Gray-800
            },
            title: {
                display: true,
                text: 'Subscribers per Website',
                color: '#1f2937'
            },
        },
        scales: {
            y: {
                ticks: { color: '#4b5563' }, // Gray-600
                grid: { color: '#e5e7eb' } // Gray-200
            },
            x: {
                ticks: { color: '#4b5563' },
                grid: { display: false }
            }
        }
    }

    return <Bar options={options} data={chartData} />
}

interface NotificationsChartProps {
    data: { date: string; count: number }[]
}

export function NotificationsLineChart({ data }: NotificationsChartProps) {
    const chartData = {
        labels: data.map(d => d.date),
        datasets: [
            {
                label: 'Notifications Sent',
                data: data.map(d => d.count),
                borderColor: 'rgba(16, 185, 129, 1)', // Emerald-500
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.3,
            },
        ],
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: { color: '#1f2937' }
            },
            title: {
                display: true,
                text: 'Notifications (Last 7 Days)',
                color: '#1f2937'
            },
        },
        scales: {
            y: {
                ticks: { color: '#4b5563' },
                grid: { color: '#e5e7eb' }
            },
            x: {
                ticks: { color: '#4b5563' },
                grid: { color: '#e5e7eb' }
            }
        }
    }

    return <Line options={options} data={chartData} />
}
