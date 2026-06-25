'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Paper,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    IconButton,
    Tooltip,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    FormHelperText,
} from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridToolbar,
    GridActionsCellItem,
} from '@mui/x-data-grid';
import {
    Add as AddIcon,
    CloudUpload as UploadIcon,
    CheckCircle as CheckCircleIcon,
    RadioButtonUnchecked as UncheckedIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    RemoveCircle as RemoveCircleIcon,
    Chat as ChatIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import CommentDrawer from '@/components/comments/CommentDrawer';

// Interface matching new backend schema
interface Demande {
    _id: string;
    id: string; // for DataGrid
    nom: string;
    category: 'document' | 'procedure';
    matricule: string;
    consulte: boolean;
    accepte: boolean;
    integre: boolean;
    filePath: string;
    mimetype: string;
    size: number;
    createdAt: string;
}

// Validation Schema
const createDemandeSchema = z.object({
    nom: z.string().min(1, 'Le nom de la demande est requis'),
    category: z.enum(['document', 'procedure'], {
        required_error: 'La catégorie est requise',
    }),
});

type CreateDemandeForm = z.infer<typeof createDemandeSchema>;

export default function RequestsPage() {
    const router = useRouter();
    const [requests, setRequests] = useState<Demande[]>([]);
    const [loading, setLoading] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Comments State
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [commentTargetId, setCommentTargetId] = useState('');
    const [commentTargetName, setCommentTargetName] = useState('');

    const createForm = useForm<CreateDemandeForm>({
        resolver: zodResolver(createDemandeSchema),
        defaultValues: {
            nom: '',
            category: 'document',
        },
    });

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setCurrentUser(JSON.parse(userStr));
        } else {
            router.push('/login');
        }
    }, [router]);

    useEffect(() => {
        if (currentUser) {
            fetchRequests();
        }
    }, [currentUser]);

    const getAuthToken = () => {
        return document.cookie
            .split('; ')
            .find((row) => row.startsWith('token='))
            ?.split('=')[1];
    };

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const token = getAuthToken(); // If using auth guard later

            // Centralized endpoint - backend handles filtering by role/matricule
            let url = `${process.env.NEXT_PUBLIC_API_URL}/demandes`;

            const response = await fetch(url, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });

            if (!response.ok) {
                // Don't show error toast for auth failures (will redirect to login)
                if (response.status === 401 || response.status === 403) {
                    return;
                }
                throw new Error('Failed to fetch requests');
            }

            const data = await response.json();
            const mappedData = data.map((item: any) => ({
                ...item,
                id: item._id,
            }));
            setRequests(mappedData);
        } catch (error) {
            console.error('Error fetching requests:', error);
            // Only show error if it's not an auth error
            if (error instanceof Error && !error.message.includes('401') && !error.message.includes('403')) {
                toast.error('Erreur lors du chargement des demandes');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDemande = async (data: CreateDemandeForm) => {
        if (!selectedFile) {
            toast.error('Veuillez sélectionner un fichier');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('nom', data.nom);
            formData.append('category', data.category);
            formData.append('matricule', currentUser.matricule);
            formData.append('file', selectedFile);

            const token = getAuthToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/demandes`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                // No Content-Type header needed for FormData, browser sets it with boundary
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create request');
            }

            toast.success('Demande créée avec succès');
            setCreateDialogOpen(false);
            createForm.reset();
            setSelectedFile(null);
            fetchRequests();
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors de la création');
        }
    };

    const handleToggleStatus = async (id: string, field: 'consulte' | 'accepte' | 'integre', currentValue: boolean) => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/demandes/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ [field]: !currentValue }),
            });

            if (!response.ok) throw new Error('Failed to update status');

            toast.success('Statut mis à jour');
            fetchRequests();
        } catch (error) {
            toast.error('Erreur mise à jour statut');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) return;

        try {
            const token = getAuthToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/demandes/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to delete');

            toast.success('Demande supprimée');
            fetchRequests();
        } catch (error) {
            toast.error('Erreur suppression');
        }
    };

    const handleOpenRequest = async (row: Demande) => {
        const token = getAuthToken();

        // 1. Open file
        if (row.filePath) {
            // Static files are served at the root, not under /api/v1
            const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || '';
            const fileUrl = `${baseUrl}/uploads/documents/${row.filePath.split(/[/\\]/).pop()}`;
            window.open(fileUrl, '_blank');
        } else {
            toast.error('Fichier introuvable');
            return;
        }

        // 2. Refresh request from backend which triggers "consulte = true" for DOC users
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/demandes/${row._id}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });
            if (response.ok) {
                // Update local state if needed or just refetch list
                fetchRequests();
            }
        } catch (error) {
            console.error('Error opening request details:', error);
        }
    };

    const handleOpenComments = (row: Demande) => {
        setCommentTargetId(row._id);
        setCommentTargetName(row.nom);
        setCommentsOpen(true);
    };

    const handleAcceptRequest = async (row: Demande) => {
        if (!row.accepte) {
            await handleToggleStatus(row._id, 'accepte', false);
        }
    };

    const columns: GridColDef[] = [
        { field: 'nom', headerName: 'Nom de la demande', width: 250 },
        {
            field: 'category',
            headerName: 'Catégorie',
            width: 130,
            renderCell: (params) => (
                <Chip
                    label={params.value === 'procedure' ? 'Procédure' : 'Document'}
                    variant="outlined"
                    size="small"
                    sx={{
                        color: params.value === 'procedure' ? '#eabb1c' : '#3b82f6',
                        borderColor: params.value === 'procedure' ? 'rgba(234, 187, 28, 0.5)' : 'rgba(59, 130, 246, 0.5)'
                    }}
                />
            )
        },
        { field: 'matricule', headerName: 'Matricule', width: 120 },
        {
            field: 'fileName',
            headerName: 'Fichier',
            width: 200,
            valueGetter: (value: any, row: any) => {
                const rowData = row || (value && value.row);
                if (!rowData || !rowData.filePath) return 'Document';
                return rowData.filePath.split(/[/\\]/).pop();
            },
            renderCell: (params: any) => (
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }} title={params.value}>
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'createdAt',
            headerName: 'Date Création',
            width: 150,
            valueFormatter: (value: any) => {
                if (!value) return '-';
                try {
                    return new Date(value).toLocaleDateString();
                } catch (e) {
                    return 'Date invalide';
                }
            }
        },
        // Status Indicators
        {
            field: 'consulte',
            headerName: 'Consulté',
            width: 100,
            renderCell: (params) => (
                <Chip
                    label={params.value ? 'Oui' : 'Non'}
                    color={params.value ? 'success' : 'error'}
                    size="small"
                />
            )
        },
        {
            field: 'accepte',
            headerName: 'Accepté',
            width: 100,
            renderCell: (params) => (
                <Chip
                    label={params.value ? 'Oui' : 'Non'}
                    color={params.value ? 'success' : 'error'}
                    size="small"
                />
            )
        },
        {
            field: 'integre',
            headerName: 'Intégré',
            width: 100,
            renderCell: (params) => (
                <Chip
                    label={params.value ? 'Oui' : 'Non'}
                    color={params.value ? 'success' : 'error'}
                    size="small"
                />
            )
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 200,
            getActions: (params) => {
                const actions = [];
                const role = currentUser?.role;

                // All users can open/see the file
                actions.push(
                    <GridActionsCellItem
                        key="view"
                        icon={<VisibilityIcon />}
                        label="Consulter"
                        onClick={() => handleOpenRequest(params.row)}
                        showInMenu={false}
                        sx={{ color: '#3b82f6' }}
                    />
                );

                // Comments action (Available to all roles with access)
                actions.push(
                    <GridActionsCellItem
                        key="comments"
                        icon={<ChatIcon />}
                        label="Commentaires"
                        onClick={() => handleOpenComments(params.row)}
                        showInMenu={false}
                        sx={{ color: '#eabb1c' }}
                    />
                );

                // Only DOC user can Accept and Integrate
                if (role === 'doc') {
                    if (!params.row.accepte) {
                        actions.push(
                            <GridActionsCellItem
                                key="accept"
                                icon={<CheckCircleIcon />}
                                label="Accepter"
                                onClick={() => handleAcceptRequest(params.row)}
                                showInMenu={false}
                                sx={{ color: '#22c55e' }}
                            />
                        );
                    }

                    actions.push(
                        <GridActionsCellItem
                            key="integrate"
                            icon={params.row.integre ? <RemoveCircleIcon /> : <AddIcon />}
                            label={params.row.integre ? "Désintégrer" : "Intégrer"}
                            onClick={() => handleToggleStatus(params.row._id, 'integre', params.row.integre)}
                            showInMenu={false}
                            sx={{ color: params.row.integre ? '#ef4444' : '#eabb1c' }}
                        />
                    );
                }

                // Only DIR can delete, and only if (accepte = false and integre = false) and it's their own
                // Backend enforces ownership, UI handles visibility for clean UX
                if (role === 'dir' && !params.row.accepte && !params.row.integre && params.row.matricule === currentUser.matricule) {
                    actions.push(
                        <GridActionsCellItem
                            key="delete"
                            icon={<DeleteIcon />}
                            label="Supprimer"
                            onClick={() => handleDelete(params.row._id)}
                            sx={{ color: '#ef4444' }}
                        />
                    );
                }

                return actions;
            }
        }
    ];

    return (
        <Box className="h-[calc(100vh-100px)] w-full p-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#eabb1c] mb-2">Gestion des Demandes</h1>
                    <p className="text-gray-400">Suivi des demandes (Consulté / Accepté / Intégré)</p>
                </div>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateDialogOpen(true)}
                    sx={{
                        backgroundColor: '#eabb1c',
                        color: 'black',
                        '&:hover': { backgroundColor: '#d4a919' },
                    }}
                >
                    Nouvelle Demande
                </Button>
            </div>

            <Paper
                sx={{
                    height: 'calc(100% - 100px)',
                    width: '100%',
                    backgroundColor: '#1a1a1a',
                    color: 'white',
                    '& .MuiDataGrid-root': { borderColor: 'rgba(234, 187, 28, 0.1)' },
                    '& .MuiDataGrid-cell': { borderColor: 'rgba(234, 187, 28, 0.1)', color: '#d1d5db' },
                    '& .MuiDataGrid-columnHeaders': { backgroundColor: '#000000', color: '#eabb1c' },
                    '& .MuiDataGrid-footerContainer': { backgroundColor: '#000000', color: '#d1d5db' },
                }}
            >
                <DataGrid
                    rows={requests}
                    columns={columns}
                    loading={loading}
                    disableRowSelectionOnClick
                    slots={{ toolbar: GridToolbar }}
                    slotProps={{
                        toolbar: {
                            showQuickFilter: true,
                            quickFilterProps: { debounceMs: 500 },
                            sx: { color: '#eabb1c', '& .MuiInputBase-root': { color: 'white' }, '& .MuiSvgIcon-root': { color: '#eabb1c' } }
                        }
                    }}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                        sorting: { sortModel: [{ field: 'createdAt', sort: 'desc' }] },
                    }}
                    pageSizeOptions={[10, 25, 50]}
                />
            </Paper>

            <Dialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                PaperProps={{
                    sx: { backgroundColor: '#1a1a1a', color: 'white', border: '1px solid rgba(234, 187, 28, 0.2)' }
                }}
            >
                <DialogTitle sx={{ color: '#eabb1c' }}>Nouvelle Demande</DialogTitle>
                <form onSubmit={createForm.handleSubmit(handleCreateDemande)}>
                    <DialogContent className="space-y-4 min-w-[400px]">
                        <Controller
                            name="nom"
                            control={createForm.control}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="Nom de la demande"
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message}
                                    sx={{
                                        '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(234, 187, 28, 0.3)' } },
                                        '& .MuiInputLabel-root': { color: '#d1d5db' },
                                    }}
                                />
                            )}
                        />

                        <Controller
                            name="category"
                            control={createForm.control}
                            render={({ field, fieldState }) => (
                                <FormControl fullWidth error={!!fieldState.error}>
                                    <InputLabel id="category-label" sx={{ color: '#d1d5db' }}>Catégorie</InputLabel>
                                    <Select
                                        {...field}
                                        labelId="category-label"
                                        label="Catégorie"
                                        sx={{
                                            color: 'white',
                                            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(234, 187, 28, 0.3)' },
                                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(234, 187, 28, 0.5)' },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#eabb1c' },
                                            '& .MuiSvgIcon-root': { color: '#eabb1c' }
                                        }}
                                        MenuProps={{
                                            PaperProps: {
                                                sx: { backgroundColor: '#1a1a1a', color: 'white' }
                                            }
                                        }}
                                    >
                                        <MenuItem value="document">Document</MenuItem>
                                        <MenuItem value="procedure">Procédure</MenuItem>
                                    </Select>
                                    {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                                </FormControl>
                            )}
                        />

                        <div className="flex flex-col gap-2">
                            <Typography variant="body2" sx={{ color: '#d1d5db' }}>Document (PDF requis)</Typography>
                            <Button
                                component="label"
                                variant="outlined"
                                startIcon={<UploadIcon />}
                                sx={{
                                    color: selectedFile ? '#eabb1c' : 'white',
                                    borderColor: 'rgba(234, 187, 28, 0.3)'
                                }}
                            >
                                {selectedFile ? selectedFile.name : 'Choisir un fichier'}
                                <input
                                    type="file"
                                    hidden
                                    accept="application/pdf"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setSelectedFile(e.target.files[0]);
                                        }
                                    }}
                                />
                            </Button>
                        </div>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setCreateDialogOpen(false)} sx={{ color: 'white' }}>Annuler</Button>
                        <Button type="submit" variant="contained" sx={{ backgroundColor: '#eabb1c', color: 'black' }}>Créer</Button>
                    </DialogActions>
                </form>
            </Dialog>

            <CommentDrawer
                open={commentsOpen}
                onClose={() => setCommentsOpen(false)}
                targetId={commentTargetId}
                targetType="demande"
                targetName={commentTargetName}
            />
        </Box>
    );
}
