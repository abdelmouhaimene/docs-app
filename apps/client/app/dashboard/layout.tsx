'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Description as DocumentIcon,
  People as PeopleIcon,
  Apartment as DirectionIcon,
  Assignment as RequestIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const drawerWidth = 280;
const drawerWidthCollapsed = 80;

interface User {
  name: string;
  email: string;
  role: string;
  matricule: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Clear token and user data
    document.cookie = 'token=; path=/; max-age=0';
    localStorage.removeItem('user');
    toast.success('Déconnexion réussie');
    router.push('/login');
  };

  // All available menu items with role-based access
  const allMenuItems = [
    { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/dashboard', roles: ['sys', 'dir', 'doc'] },
    { text: 'Demandes', icon: <RequestIcon />, path: '/dashboard/requests', roles: ['sys', 'dir', 'doc'] },
    { text: 'Documents', icon: <DocumentIcon />, path: '/dashboard/documents', roles: ['sys', 'dir', 'doc'] },
    { text: 'Utilisateurs', icon: <PeopleIcon />, path: '/dashboard/users', roles: ['sys'] },
    { text: 'Directions', icon: <DirectionIcon />, path: '/dashboard/directions', roles: ['sys'] },
    { text: 'Paramètres', icon: <SettingsIcon />, path: '/dashboard/settings', roles: ['sys', 'dir', 'doc'] },
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item =>
    item.roles.includes(user?.role?.toLowerCase() || '')
  );

  const drawer = (
    <div className="h-full bg-black border-r border-[#eabb1c]/20 flex flex-col">
      {/* Logo Section */}
      <div className="p-4 border-b border-[#eabb1c]/20">
        <div className="flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="MCA Logo"
              width={50}
              height={50}
              className="object-contain"
            />
            {sidebarOpen && (
              <div>
                <Typography className="text-[#eabb1c] font-bold text-lg">
                  MCA DOCS
                </Typography>
                <Typography className="text-gray-400 text-xs">
                  Gestion Documents
                </Typography>
              </div>
            )}
          </div>
          <IconButton
            onClick={() => setSidebarOpen(!sidebarOpen)}
            sx={{
              color: '#eabb1c',
              display: { xs: 'none', md: 'flex' }
            }}
          >
            {sidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </div>
      </div>

      {/* Navigation */}
      <List className="px-2 py-4 flex-1">
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding className="mb-2">
            <Tooltip title={!sidebarOpen ? item.text : ''} placement="right" arrow>
              <ListItemButton
                component={Link}
                href={item.path}
                className="rounded-lg hover:bg-[#eabb1c]/10 transition-colors"
                sx={{
                  justifyContent: sidebarOpen ? 'initial' : 'center',
                  '&:hover': {
                    backgroundColor: 'rgba(234, 187, 28, 0.1)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: '#eabb1c',
                    minWidth: 40,
                    justifyContent: 'center'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {sidebarOpen && (
                  <ListItemText
                    primary={item.text}
                    sx={{
                      '& .MuiTypography-root': {
                        color: 'white',
                        fontSize: '0.95rem',
                      },
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box className="flex h-screen bg-black">
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${sidebarOpen ? drawerWidth : drawerWidthCollapsed}px)` },
          ml: { md: `${sidebarOpen ? drawerWidth : drawerWidthCollapsed}px` },
          backgroundColor: '#000000',
          borderBottom: '1px solid rgba(234, 187, 28, 0.2)',
          transition: 'width 0.3s, margin 0.3s',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' }, color: '#eabb1c' }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: 'white' }}>
            Système de Gestion des Documents
          </Typography>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <Typography className="text-white text-sm font-medium">
                {user?.name || 'Loading...'}
              </Typography>
              <Typography className="text-gray-400 text-xs">
                {user?.role?.toUpperCase() || ''}
              </Typography>
            </div>
            <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
              <Avatar
                sx={{
                  bgcolor: '#eabb1c',
                  color: '#000000',
                  fontWeight: 'bold',
                }}
              >
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </div>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            sx={{
              '& .MuiPaper-root': {
                backgroundColor: '#1a1a1a',
                border: '1px solid rgba(234, 187, 28, 0.2)',
                color: 'white',
                minWidth: 200,
              },
            }}
          >
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon sx={{ color: '#eabb1c' }}>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profil</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon sx={{ color: '#eabb1c' }}>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Paramètres</ListItemText>
            </MenuItem>
            <Divider sx={{ borderColor: 'rgba(234, 187, 28, 0.2)' }} />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon sx={{ color: '#eabb1c' }}>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Déconnexion</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{
          width: { md: sidebarOpen ? drawerWidth : drawerWidthCollapsed },
          flexShrink: { md: 0 },
          transition: 'width 0.3s',
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: 'transparent',
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: sidebarOpen ? drawerWidth : drawerWidthCollapsed,
              backgroundColor: 'transparent',
              transition: 'width 0.3s',
              overflowX: 'hidden',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${sidebarOpen ? drawerWidth : drawerWidthCollapsed}px)` },
          mt: '64px',
          overflowY: 'auto',
          transition: 'width 0.3s',
        }}
        className="bg-gradient-to-br from-black via-gray-900 to-black"
      >
        {children}
      </Box>
    </Box>
  );
}
