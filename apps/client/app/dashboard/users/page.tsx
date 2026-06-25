'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  IconButton,
  Chip,
  Switch,
  FormControlLabel,
  InputAdornment,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';

// Types
interface User {
  id: string;
  matricule: string;
  name: string;
  email: string;
  role: 'sys' | 'doc' | 'dir';
  directionId?: string;
  direction?: { name: string };
  isActive: boolean;
  createdAt: string;
}

interface Direction {
  id: string;
  name: string;
  code: string;
}

// Validation Schemas
const createUserSchema = z.object({
  matricule: z
    .string()
    .min(1, 'Le matricule est requis')
    .length(6, 'Le matricule doit contenir exactement 6 caractères')
    .regex(/^[A-Za-z0-9]+$/, 'Lettres et chiffres seulement'),
  name: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  role: z.enum(['sys', 'doc', 'dir']),
  directionId: z.string().optional(),
  password: z.string().min(8, 'Minimum 8 caractères'),
  confirmPassword: z.string(),
  phoneNumber: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
}).refine((data) => {
  if (data.role === 'dir') {
    return !!data.directionId;
  }
  return true;
}, {
  message: 'La direction est requise pour les utilisateurs DIR',
  path: ['directionId'],
});

const updateUserSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  role: z.enum(['sys', 'doc', 'dir']),
  directionId: z.string().optional(),
  phoneNumber: z.string().optional(),
  isActive: z.boolean(),
  password: z.string().min(8, 'Minimum 8 caractères').optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
}).refine((data) => {
  if (data.role === 'dir') {
    return !!data.directionId;
  }
  return true;
}, {
  message: 'La direction est requise pour les utilisateurs DIR',
  path: ['directionId'],
}).refine((data) => {
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

const updatePasswordSchema = z.object({
  password: z.string().min(8, 'Minimum 8 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type CreateUserForm = z.infer<typeof createUserSchema>;
type UpdateUserForm = z.infer<typeof updateUserSchema>;
type UpdatePasswordForm = z.infer<typeof updatePasswordSchema>;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forms
  const createForm = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      matricule: '',
      name: '',
      email: '',
      role: 'dir',
      directionId: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
    },
  });

  const updateForm = useForm<UpdateUserForm>({
    resolver: zodResolver(updateUserSchema),
  });

  const passwordForm = useForm<UpdatePasswordForm>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const watchRole = createForm.watch('role');
  const watchUpdateRole = updateForm.watch('role');

  // Helper function to get auth token
  const getAuthToken = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
  };

  useEffect(() => {
    fetchUsers();
    fetchDirections();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Don't show error toast for auth failures (will redirect to login)
        if (response.status === 401 || response.status === 403) {
          return;
        }
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.map((user: any) => ({
        ...user,
        id: user._id,
        direction: user.directionId || null, // Map directionId to direction for DataGrid
      })));
    } catch (error) {
      console.error('Error fetching users:', error);
      // Only show error if it's not an auth error
      if (error instanceof Error && !error.message.includes('401') && !error.message.includes('403')) {
        toast.error('Erreur lors du chargement des utilisateurs');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDirections = async () => {
    try {
      const token = getAuthToken();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/directions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Don't show error toast for auth failures (will redirect to login)
        if (response.status === 401 || response.status === 403) {
          return;
        }
        throw new Error('Failed to fetch directions');
      }

      const data = await response.json();
      setDirections(data.map((dir: any) => ({
        ...dir,
        id: dir._id,
      })));
    } catch (error) {
      console.error('Error fetching directions:', error);
      // Only show error if it's not an auth error
      if (error instanceof Error && !error.message.includes('401') && !error.message.includes('403')) {
        toast.error('Erreur lors du chargement des directions');
      }
    }
  };

  const handleCreateUser = async (data: CreateUserForm) => {
    try {
      const token = getAuthToken();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          matricule: data.matricule,
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
          directionId: data.directionId || undefined,
          phoneNumber: data.phoneNumber || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create user');
      }

      toast.success('Utilisateur créé avec succès');
      setCreateDialogOpen(false);
      createForm.reset();
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Erreur lors de la création de l\'utilisateur');
    }
  };

  const handleUpdateUser = async (data: UpdateUserForm) => {
    try {
      const token = getAuthToken();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${selectedUser?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          role: data.role,
          directionId: data.directionId || undefined,
          phoneNumber: data.phoneNumber || undefined,
          isActive: data.isActive,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update user');
      }

      // If password was provided, update it too
      if (data.password) {
        const pwdResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${selectedUser?.id}/password`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            password: data.password,
          }),
        });

        if (!pwdResponse.ok) {
          const pwdError = await pwdResponse.json();
          toast.warning(`Compte mis à jour, mais erreur mot de passe: ${pwdError.message}`);
        }
      }

      toast.success('Utilisateur modifié avec succès');
      setUpdateDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.message || 'Erreur lors de la modification de l\'utilisateur');
    }
  };

  const handleUpdatePassword = async (data: UpdatePasswordForm) => {
    try {
      const token = getAuthToken();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${selectedUser?.id}/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: data.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update password');
      }

      const result = await response.json();
      toast.success(result.message || 'Mot de passe modifié avec succès');
      setPasswordDialogOpen(false);
      passwordForm.reset();
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error(error.message || 'Erreur lors de la modification du mot de passe');
    }
  };

  const handleDeleteUser = async () => {
    try {
      const token = getAuthToken();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${selectedUser?.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete user');
      }

      const result = await response.json();
      toast.success(result.message || 'Utilisateur supprimé avec succès');
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const openUpdateDialog = (user: User) => {
    setSelectedUser(user);
    updateForm.reset({
      name: user.name,
      email: user.email,
      role: user.role,
      directionId: user.directionId || '',
      phoneNumber: '',
      isActive: user.isActive,
      password: '',
      confirmPassword: '',
    });
    setUpdateDialogOpen(true);
  };

  const openPasswordDialog = (user: User) => {
    setSelectedUser(user);
    passwordForm.reset();
    setPasswordDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      sys: '#ef4444',
      doc: '#3b82f6',
      dir: '#10b981',
      public: '#6b7280',
    };
    const labels: Record<string, string> = {
      sys: 'SYS',
      doc: 'DOC',
      dir: 'DIR',
      public: 'PUBLIC',
    };
    const tooltips: Record<string, string> = {
      sys: 'Super Administrateur - Accès complet au système',
      doc: 'Gestionnaire de Documents - Gère les documents et demandes',
      dir: 'Utilisateur Direction - Crée des demandes de documents',
      public: 'Utilisateur Public - Lecture seule',
    };
    return (
      <Tooltip title={tooltips[role]} arrow>
        <Chip
          label={labels[role]}
          size="small"
          sx={{
            backgroundColor: colors[role],
            color: 'white',
            fontWeight: 'bold',
            cursor: 'help',
          }}
        />
      </Tooltip>
    );
  };

  const columns: GridColDef[] = [
    {
      field: 'matricule',
      headerName: 'Matricule',
      width: 120,
      renderCell: (params) => (
        <Typography className="font-mono font-semibold">
          {params.value}
        </Typography>
      ),
    },
    { field: 'name', headerName: 'Nom', width: 200 },
    { field: 'email', headerName: 'Email', width: 220 },
    {
      field: 'role',
      headerName: 'Type',
      width: 100,
      renderCell: (params) => getRoleBadge(params.value),
    },
    {
      field: 'direction',
      headerName: 'Direction',
      width: 180,
      valueGetter: (value, row) => row.direction?.name || '-',
    },
    {
      field: 'isActive',
      headerName: 'Statut',
      width: 100,
      renderCell: (params) => (
        <Tooltip
          title={params.value ? 'Compte activé - Peut se connecter' : 'Compte désactivé - Connexion bloquée'}
          arrow
        >
          <Chip
            label={params.value ? 'Actif' : 'Inactif'}
            size="small"
            color={params.value ? 'success' : 'error'}
            variant="outlined"
            sx={{ cursor: 'help' }}
          />
        </Tooltip>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <Tooltip key="edit-tooltip" title="Modifier les informations" arrow>
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="Modifier"
            onClick={() => openUpdateDialog(params.row)}
            sx={{ color: '#eabb1c' }}
            showInMenu={false}
          />
        </Tooltip>,
        <Tooltip key="delete-tooltip" title="Supprimer l'utilisateur" arrow>
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="Supprimer"
            onClick={() => openDeleteDialog(params.row)}
            sx={{ color: '#ef4444' }}
            showInMenu={false}
          />
        </Tooltip>,
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h4" className="text-white font-bold mb-2">
            Gestion des Utilisateurs
          </Typography>
          <Typography variant="body1" className="text-gray-400">
            Gérer les comptes utilisateurs du système
          </Typography>
        </div>
        <Tooltip title="Créer un nouveau compte utilisateur" arrow>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{
              backgroundColor: '#eabb1c',
              color: '#000000',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#d4a818',
              },
            }}
          >
            Nouvel Utilisateur
          </Button>
        </Tooltip>
      </div>

      {/* DataGrid */}
      <Card
        sx={{
          backgroundColor: '#1a1a1a',
          border: '1px solid rgba(234, 187, 28, 0.2)',
        }}
      >
        <DataGrid
          rows={users}
          columns={columns}
          loading={loading}
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={setSelectedRows}
          rowSelectionModel={selectedRows}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderColor: 'rgba(234, 187, 28, 0.1)',
              color: 'white',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'rgba(234, 187, 28, 0.1)',
              borderColor: 'rgba(234, 187, 28, 0.2)',
              color: '#eabb1c',
              fontWeight: 'bold',
            },
            '& .MuiDataGrid-footerContainer': {
              borderColor: 'rgba(234, 187, 28, 0.2)',
              color: 'white',
            },
            '& .MuiCheckbox-root': {
              color: '#eabb1c',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'rgba(234, 187, 28, 0.05)',
            },
            '& .MuiTablePagination-root': {
              color: 'white',
            },
          }}
        />
      </Card>

      {/* Create User Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1a1a1a',
            border: '1px solid rgba(234, 187, 28, 0.2)',
          },
        }}
      >
        <DialogTitle sx={{ color: '#eabb1c', fontWeight: 'bold' }}>
          Créer un Nouvel Utilisateur
        </DialogTitle>
        <form onSubmit={createForm.handleSubmit(handleCreateUser)}>
          <DialogContent className="space-y-4">
            <Controller
              name="matricule"
              control={createForm.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Matricule"
                  placeholder="Ex: ABC123"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  inputProps={{
                    maxLength: 6,
                    style: { textTransform: 'uppercase' },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(234, 187, 28, 0.3)' },
                    },
                    '& .MuiInputLabel-root': { color: '#d1d5db' },
                  }}
                />
              )}
            />

            <Controller
              name="name"
              control={createForm.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Nom Complet"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(234, 187, 28, 0.3)' },
                    },
                    '& .MuiInputLabel-root': { color: '#d1d5db' },
                  }}
                />
              )}
            />

            <Controller
              name="email"
              control={createForm.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Email"
                  type="email"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(234, 187, 28, 0.3)' },
                    },
                    '& .MuiInputLabel-root': { color: '#d1d5db' },
                  }}
                />
              )}
            />

            <Controller
              name="role"
              control={createForm.control}
              render={({ field, fieldState }) => (
                <FormControl fullWidth error={!!fieldState.error}>
                  <InputLabel sx={{ color: '#d1d5db' }}>Type d'utilisateur</InputLabel>
                  <Select
                    {...field}
                    label="Type d'utilisateur"
                    sx={{
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(234, 187, 28, 0.3)',
                      },
                    }}
                  >
                    <MenuItem value="sys">SYS - Super Admin</MenuItem>
                    <MenuItem value="doc">DOC - Gestionnaire Documents</MenuItem>
                    <MenuItem value="dir">DIR - Direction</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            {watchRole === 'dir' && (
              <Controller
                name="directionId"
                control={createForm.control}
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <InputLabel sx={{ color: '#d1d5db' }}>Direction</InputLabel>
                    <Select
                      {...field}
                      label="Direction"
                      sx={{
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(234, 187, 28, 0.3)',
                        },
                      }}
                    >
                      {directions.map((dir) => (
                        <MenuItem key={dir.id} value={dir.id}>
                          {dir.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            )}

            <Controller
              name="password"
              control={createForm.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Mot de passe"
                  type={showPassword ? 'text' : 'password'}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} arrow>
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: '#eabb1c' }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(234, 187, 28, 0.3)' },
                    },
                    '& .MuiInputLabel-root': { color: '#d1d5db' },
                  }}
                />
              )}
            />

            <Controller
              name="confirmPassword"
              control={createForm.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Confirmer le mot de passe"
                  type={showConfirmPassword ? 'text' : 'password'}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} arrow>
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            sx={{ color: '#eabb1c' }}
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(234, 187, 28, 0.3)' },
                    },
                    '& .MuiInputLabel-root': { color: '#d1d5db' },
                  }}
                />
              )}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setCreateDialogOpen(false)}
              sx={{ color: 'white' }}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: '#eabb1c',
                color: '#000000',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: '#d4a818' },
              }}
            >
              Créer
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Update User Dialog */}
      <Dialog
        open={updateDialogOpen}
        onClose={() => setUpdateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1a1a1a',
            border: '1px solid rgba(234, 187, 28, 0.2)',
          },
        }}
      >
        <DialogTitle sx={{ color: '#eabb1c', fontWeight: 'bold' }}>
          Modifier l'Utilisateur
        </DialogTitle>
        <form onSubmit={updateForm.handleSubmit(handleUpdateUser)}>
          <DialogContent className="space-y-4">
            <Controller
              name="name"
              control={updateForm.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Nom Complet"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(234, 187, 28, 0.3)' },
                    },
                    '& .MuiInputLabel-root': { color: '#d1d5db' },
                  }}
                />
              )}
            />

            <Controller
              name="email"
              control={updateForm.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Email"
                  type="email"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(234, 187, 28, 0.3)' },
                    },
                    '& .MuiInputLabel-root': { color: '#d1d5db' },
                  }}
                />
              )}
            />

            <Controller
              name="role"
              control={updateForm.control}
              render={({ field, fieldState }) => (
                <FormControl fullWidth error={!!fieldState.error}>
                  <InputLabel sx={{ color: '#d1d5db' }}>Type d'utilisateur</InputLabel>
                  <Select
                    {...field}
                    label="Type d'utilisateur"
                    sx={{
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(234, 187, 28, 0.3)',
                      },
                    }}
                  >
                    <MenuItem value="sys">SYS - Super Admin</MenuItem>
                    <MenuItem value="doc">DOC - Gestionnaire Documents</MenuItem>
                    <MenuItem value="dir">DIR - Direction</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            {watchUpdateRole === 'dir' && (
              <Controller
                name="directionId"
                control={updateForm.control}
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <InputLabel sx={{ color: '#d1d5db' }}>Direction</InputLabel>
                    <Select
                      {...field}
                      label="Direction"
                      sx={{
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(234, 187, 28, 0.3)',
                        },
                      }}
                    >
                      {directions.map((dir) => (
                        <MenuItem key={dir.id} value={dir.id}>
                          {dir.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            )}

            <Controller
              name="isActive"
              control={updateForm.control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={field.onChange}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#eabb1c',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#eabb1c',
                        },
                      }}
                    />
                  }
                  label={
                    <span className="text-white">
                      Compte {field.value ? 'Actif' : 'Inactif'}
                    </span>
                  }
                />
              )}
            />

            <Divider sx={{ my: 2, borderColor: 'rgba(234, 187, 28, 0.1)' }} />
            <Typography variant="subtitle2" sx={{ color: '#eabb1c', mb: 1 }}>
              Changer le mot de passe (optionnel)
            </Typography>

            <Controller
              name="password"
              control={updateForm.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Nouveau mot de passe"
                  type={showPassword ? 'text' : 'password'}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={showPassword ? 'Masquer' : 'Afficher'} arrow>
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: '#eabb1c' }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(234, 187, 28, 0.1)' },
                    },
                    '& .MuiInputLabel-root': { color: '#d1d5db' },
                  }}
                />
              )}
            />

            <Controller
              name="confirmPassword"
              control={updateForm.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Confirmer le nouveau mot de passe"
                  type={showConfirmPassword ? 'text' : 'password'}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={showConfirmPassword ? 'Masquer' : 'Afficher'} arrow>
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            sx={{ color: '#eabb1c' }}
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(234, 187, 28, 0.1)' },
                    },
                    '& .MuiInputLabel-root': { color: '#d1d5db' },
                  }}
                />
              )}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setUpdateDialogOpen(false)}
              sx={{ color: 'white' }}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: '#eabb1c',
                color: '#000000',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: '#d4a818' },
              }}
            >
              Enregistrer
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Update Password Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1a1a1a',
            border: '1px solid rgba(234, 187, 28, 0.2)',
          },
        }}
      >
        <DialogTitle sx={{ color: '#eabb1c', fontWeight: 'bold' }}>
          Modifier le Mot de Passe
        </DialogTitle>
        <form onSubmit={passwordForm.handleSubmit(handleUpdatePassword)}>
          <DialogContent className="space-y-4">
            <Typography className="text-gray-400 mb-4">
              Utilisateur: <strong className="text-white">{selectedUser?.name}</strong>
            </Typography>

            <Controller
              name="password"
              control={passwordForm.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Nouveau mot de passe"
                  type={showPassword ? 'text' : 'password'}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} arrow>
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: '#eabb1c' }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(234, 187, 28, 0.3)' },
                    },
                    '& .MuiInputLabel-root': { color: '#d1d5db' },
                  }}
                />
              )}
            />

            <Controller
              name="confirmPassword"
              control={passwordForm.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Confirmer le mot de passe"
                  type={showConfirmPassword ? 'text' : 'password'}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} arrow>
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            sx={{ color: '#eabb1c' }}
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(234, 187, 28, 0.3)' },
                    },
                    '& .MuiInputLabel-root': { color: '#d1d5db' },
                  }}
                />
              )}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setPasswordDialogOpen(false)}
              sx={{ color: 'white' }}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: '#eabb1c',
                color: '#000000',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: '#d4a818' },
              }}
            >
              Modifier
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1a1a1a',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          },
        }}
      >
        <DialogTitle sx={{ color: '#ef4444', fontWeight: 'bold' }}>
          Confirmer la Suppression
        </DialogTitle>
        <DialogContent>
          <Typography className="text-white">
            Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
            <strong className="text-[#eabb1c]">{selectedUser?.name}</strong> ?
          </Typography>
          <Typography className="text-gray-400 mt-2 text-sm">
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ color: 'white' }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleDeleteUser}
            variant="contained"
            sx={{
              backgroundColor: '#ef4444',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': { backgroundColor: '#dc2626' },
            }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
