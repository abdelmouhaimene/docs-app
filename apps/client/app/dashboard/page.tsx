'use client';

import { useEffect, useState } from 'react';
import {
  Grid2 as Grid,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import {
  Description as DocumentIcon,
  People as PeopleIcon,
  Apartment as DirectionIcon,
  TrendingUp as TrendingIcon,
  CloudUpload as UploadIcon,
  PendingActions as PendingIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
} from '@mui/icons-material';

interface DashboardStats {
  totalDocuments: number;
  totalUsers: number;
  totalDirections: number;
  pendingRequests: number;
  approvedDocuments: number;
  rejectedRequests: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    totalUsers: 0,
    totalDirections: 0,
    pendingRequests: 0,
    approvedDocuments: 0,
    rejectedRequests: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1];

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch stats');

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Documents',
      value: stats.totalDocuments,
      icon: <DocumentIcon sx={{ fontSize: 40 }} />,
      color: '#eabb1c',
      bgColor: 'rgba(234, 187, 28, 0.1)',
    },
    {
      title: 'Utilisateurs',
      value: stats.totalUsers,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
    },
    {
      title: 'Directions',
      value: stats.totalDirections,
      icon: <DirectionIcon sx={{ fontSize: 40 }} />,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
    },
    {
      title: 'En Attente',
      value: stats.pendingRequests,
      icon: <PendingIcon sx={{ fontSize: 40 }} />,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
    },
    {
      title: 'Approuvés',
      value: stats.approvedDocuments,
      icon: <ApprovedIcon sx={{ fontSize: 40 }} />,
      color: '#22c55e',
      bgColor: 'rgba(34, 197, 94, 0.1)',
    },
    {
      title: 'Rejetés',
      value: stats.rejectedRequests,
      icon: <RejectedIcon sx={{ fontSize: 40 }} />,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h4" className="text-white font-bold mb-2">
            Tableau de Bord
          </Typography>
          <Typography variant="body1" className="text-gray-400">
            Bienvenue sur votre espace d'administration
          </Typography>
        </div>
      </div>

      {/* Stats Grid */}
      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
            <Card
              sx={{
                backgroundColor: '#1a1a1a',
                border: '1px solid rgba(234, 187, 28, 0.2)',
                borderRadius: 2,
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 24px ${card.color}30`,
                  borderColor: card.color,
                },
              }}
            >
              <CardContent>
                <Box className="flex items-center justify-between mb-4">
                  <Box
                    sx={{
                      backgroundColor: card.bgColor,
                      borderRadius: 2,
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box sx={{ color: card.color }}>{card.icon}</Box>
                  </Box>
                  <IconButton
                    size="small"
                    sx={{
                      color: card.color,
                      '&:hover': { backgroundColor: card.bgColor },
                    }}
                  >
                    <TrendingIcon />
                  </IconButton>
                </Box>

                <Typography className="text-gray-400 text-sm mb-1">
                  {card.title}
                </Typography>
                <Typography
                  variant="h3"
                  className="font-bold"
                  sx={{ color: card.color }}
                >
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

    </div>
  );
}
