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
    Typography,
    Chip,
    Switch,
    FormControlLabel,
    Tooltip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
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
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';

// Types
interface Direction {
    id: string;
    name: string;
    code: string;
    description?: string;
    head?: string;
    isActive: boolean;
    createdAt: string;
}

interface User {
    id: string;
    name: string;
    matricule: string;
}

// Validation Schemas
const createDirectionSchema = z.object({
    name: z.string().min(1, 'Le nom est requis'),
    code: z
        .string()
        .min(1, 'Le code est requis')
        .regex(/^[A-Za-z0-9]+$/, 'Lettres et chiffres seulement'),
});

const updateDirectionSchema = z.object({
    name: z.string().min(1, 'Le nom est requis'),
    code: z
        .string()
        .min(1, 'Le code est requis')
        .regex(/^[A-Za-z0-9]+$/, 'Lettres et chiffres seulement'),
    isActive: z.boolean(),
});

type CreateDirectionForm = z.infer<typeof createDirectionSchema>;
type UpdateDirectionForm = z.infer<typeof updateDirectionSchema>;

export default function DirectionsPage() {
    const [directions, setDirections] = useState<Direction[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);
    const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null);

    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // Forms
    const createForm = useForm<CreateDirectionForm>({
        resolver: zodResolver(createDirectionSchema),
        defaultValues: {
            name: '',
            code: '',
        },
    });

    const updateForm = useForm<UpdateDirectionForm>({
        resolver: zodResolver(updateDirectionSchema),
    });

    // Helper function to get auth token
    const getAuthToken = () => {
        return document.cookie
            .split('; ')
            .find(row => row.startsWith('token='))
            ?.split('=')[1];
    };

    useEffect(() => {
        fetchDirections();
        fetchUsers();
    }, []);

    const fetchDirections = async () => {
        try {
            setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const token = getAuthToken();

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                // Don't throw error for auth failures (will redirect to login)
                if (response.status === 401 || response.status === 403) {
                    return;
                }
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data.map((user: any) => ({
                id: user._id,
                name: user.name,
                matricule: user.matricule,
            })));
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleCreateDirection = async (data: CreateDirectionForm) => {
        try {
            const token = getAuthToken();

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/directions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: data.name,
                    code: data.code.toUpperCase(),
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create direction');
            }

            toast.success('Direction créée avec succès');
            setCreateDialogOpen(false);
            createForm.reset();
            fetchDirections();
        } catch (error: any) {
            console.error('Error creating direction:', error);
            toast.error(error.message || 'Erreur lors de la création de la direction');
        }
    };

    const handleUpdateDirection = async (data: UpdateDirectionForm) => {
        try {
            const token = getAuthToken();

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/directions/${selectedDirection?.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: data.name,
                    code: data.code.toUpperCase(),
                    isActive: data.isActive,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update direction');
            }

            toast.success('Direction modifiée avec succès');
            setUpdateDialogOpen(false);
            fetchDirections();
        } catch (error: any) {
            console.error('Error updating direction:', error);
            toast.error(error.message || 'Erreur lors de la modification de la direction');
        }
    };

    const handleDeleteDirection = async () => {
        try {
            const token = getAuthToken();

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/directions/${selectedDirection?.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete direction');
            }

            const result = await response.json();
            toast.success(result.message || 'Direction supprimée avec succès');
            setDeleteDialogOpen(false);
            setSelectedDirection(null);
            fetchDirections();
        } catch (error: any) {
            console.error('Error deleting direction:', error);
            toast.error(error.message || 'Erreur lors de la suppression de la direction');
        }
    };

    const openUpdateDialog = (direction: Direction) => {
        setSelectedDirection(direction);
        updateForm.reset({
            name: direction.name,
            code: direction.code,
            isActive: direction.isActive,
        });
        setUpdateDialogOpen(true);
    };

    const openDeleteDialog = (direction: Direction) => {
        setSelectedDirection(direction);
        setDeleteDialogOpen(true);
    };

    const columns: GridColDef[] = [
        {
            field: 'code',
            headerName: 'Code',
            width: 120,
            renderCell: (params) => (
                <Typography className="font-mono font-semibold">
                    {params.value}
                </Typography>
            ),
        },
        { field: 'name', headerName: 'Nom', width: 400 },
        {
            field: 'isActive',
            headerName: 'Statut',
            width: 100,
            renderCell: (params) => (
                <Tooltip
                    title={params.value ? 'Direction active' : 'Direction désactivée'}
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
                <Tooltip key="edit-tooltip" title="Modifier la direction" arrow>
                    <GridActionsCellItem
                        key="edit"
                        icon={<EditIcon />}
                        label="Modifier"
                        onClick={() => openUpdateDialog(params.row)}
                        sx={{ color: '#eabb1c' }}
                        showInMenu={false}
                    />
                </Tooltip>,
                <Tooltip key="delete-tooltip" title="Supprimer la direction" arrow>
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
                        Gestion des Directions
                    </Typography>
                    <Typography variant="body1" className="text-gray-400">
                        Gérer les directions de l'entreprise
                    </Typography>
                </div>
                <Tooltip title="Créer une nouvelle direction" arrow>
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
                        Nouvelle Direction
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
                    rows={directions}
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

            {/* Create Direction Dialog */}
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
                    Créer une Nouvelle Direction
                </DialogTitle>
                <form onSubmit={createForm.handleSubmit(handleCreateDirection)}>
                    <DialogContent className="space-y-4">
                        <Controller
                            name="name"
                            control={createForm.control}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="Nom de la Direction"
                                    placeholder="Ex: Direction des Ressources Humaines"
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
                            name="code"
                            control={createForm.control}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="Code"
                                    placeholder="Ex: DRH"
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message}
                                    inputProps={{
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

            {/* Update Direction Dialog */}
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
                    Modifier la Direction
                </DialogTitle>
                <form onSubmit={updateForm.handleSubmit(handleUpdateDirection)}>
                    <DialogContent className="space-y-4">
                        <Controller
                            name="name"
                            control={updateForm.control}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="Nom de la Direction"
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
                            name="code"
                            control={updateForm.control}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="Code"
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message}
                                    inputProps={{
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
                                            Direction {field.value ? 'Active' : 'Inactive'}
                                        </span>
                                    }
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
                        Êtes-vous sûr de vouloir supprimer la direction{' '}
                        <strong className="text-[#eabb1c]">{selectedDirection?.name}</strong> ?
                    </Typography>
                    <Typography className="text-gray-400 mt-2 text-sm">
                        Cette action désactivera la direction.
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
                        onClick={handleDeleteDirection}
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
