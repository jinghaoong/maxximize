import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoreVert from '@mui/icons-material/MoreVert';
import {
  Box,
  Card,
  CardContent,
  Container,
  IconButton,
  Typography
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import DayJS from 'dayjs';
import { useEffect, useState } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { ConfirmDialog } from '../../components/assetManagement/confirm-dialog';
import { MachineDialog } from '../../components/assetManagement/machine-dialog';
import { MachineMenu } from '../../components/assetManagement/machine-menu';
import { DashboardLayout } from '../../components/dashboard-layout';
import { NotificationAlert } from '../../components/notification-alert';
import { Toolbar } from '../../components/toolbar';
import { deleteMachine, fetchMachines } from '../../helpers/assetManagement';

const MachineManagement = (props) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const organisationId = user.organisation.id;

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertText, setAlertText] = useState();
  const [alertSeverity, setAlertSeverity] = useState('success');
  const handleAlertOpen = (text, severity) => {
    setAlertText(text);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };
  const handleAlertClose = () => {
    setAlertOpen(false);
    setAlertText(null);
    setAlertSeverity('success');
  };

  const [search, setSearch] = useState('');

  const handleSearch = (event) => {
    setSearch(event.target.value.toLowerCase().trim());
  };

  // FormDialog Helpers
  const [action, setAction] = useState();
  const [formDialogOpen, setFormDialogOpen] = useState(false);

  const handleAdd = () => {
    setAction('POST');
	setSelectedRow(null);
  };
  const handleFormDialogOpen = () => {
    setFormDialogOpen(true);
  };
  const handleFormDialogClose = () => {
    setFormDialogOpen(false);
  };

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const handleConfirmDialogOpen = () => {
    setConfirmDialogOpen(true);
  };
  const handleConfirmDialogClose = () => {
    setConfirmDialogOpen(false);
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleClickViewEdit = () => {
    setAction('PATCH');
  };

  const menuButton = (params) => {
    return (
      <IconButton
        onClick={(event) => {
          setSelectedRow(params.row);
          handleMenuClick(event);
        }}
      >
        <MoreVert />
      </IconButton>
    );
  };

  const [rows, setRows] = useState([]);
  const [selectedRow, setSelectedRow] = useState();
  const [selectedRowId, setSelectedRowId] = useState();

  const getMachines = async () => {
    fetchMachines(organisationId)
      .then((result) => setRows(result))
      .catch((err) => handleAlertOpen(`Failed to fetch any Machines`, 'error'));
  };

  const addMachine = (machine) => {
    const updatedMachines = [...rows, machine];
    setRows(updatedMachines);
    handleAlertOpen(`Added Machine ${machine.id} successfully!`, 'success');
  };

  const updateRow = (updatedMachine) => {
    const indexOfEditMachine = rows.findIndex(
      (currentMachine) => currentMachine.id === updatedMachine.id
    );
    const newMachines = [ ...rows ];
    newMachines[indexOfEditMachine] = updatedMachine;
    setRows(newMachines);

    handleAlertOpen(
      `Updated Machine ${updatedMachine.id} successfully!`,
      'success'
    );
  };

  useEffect(() => {
    getMachines();
  }, []);

  const handleDelete = async (id) => {
    deleteMachine(id)
      .then(() => {
        handleAlertOpen(`Successfully deleted Machine`, 'success');
      })
      .then(() => getMachines());
  };

  const [deleteDisabled, setDeleteDisabled] = useState();

  useEffect(() => {
    setDeleteDisabled(!selectedRowId);
  }, [selectedRowId]);

  let columns = [
    // {
    //   field: 'id',
    //   headerName: 'ID',
    //   flex: 1,
    // },
    {
      field: 'serialNumber',
      headerName: 'Serial Number',
      flex: 1,
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
    },
    {
      field: 'make',
      headerName: 'Make',
      flex: 1,
    },
    {
      field: 'model',
      headerName: 'Model',
      flex: 1,
    },
    {
      field: 'year',
      headerName: 'Year',
      flex: 1,
    },
    {
      field: 'lastServiced',
      headerName: 'Last Serviced',
      flex: 2,
      valueFormatter: (params) =>
        DayJS(params?.value).format('DD MMM YYYY hh:mm a'),
    },
    {
      field: 'isOperating',
      headerName: 'Operating',
      flex: 1,
      renderCell: (params) => {
        return params.value ? (
          <CheckCircleIcon color="success" />
        ) : (
          <CancelIcon color="error" />
        );
      },
    },
    {
      field: 'remarks',
      headerName: 'Remarks',
      flex: 2,
    },
    {
      field: 'productionLineId',
      headerName: 'PL Id',
      flex: 1,
      valueGetter: (params) => {
        if (params.row) {
          return params.row.productionLineId ? params.row.productionLineId : 'NA';
        } else {
          return '';
        }
      },
    },

    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: menuButton,
    },
  ];

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>
            Machine Management Module
            {user && ` | ${user?.organisation?.name}`}
          </title>
        </Helmet>
      </HelmetProvider>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 4,
          pb: 4,
        }}
      >
        <Container maxWidth={false}>
          <NotificationAlert
            open={alertOpen}
            severity={alertSeverity}
            text={alertText}
            handleClose={handleAlertClose}
          />
          <MachineMenu
            anchorEl={anchorEl}
            menuOpen={menuOpen}
            handleClickOpen={handleFormDialogOpen}
            handleMenuClose={handleMenuClose}
            handleClickViewEdit={handleClickViewEdit}
          />
          <ConfirmDialog
            open={confirmDialogOpen}
            handleClose={handleConfirmDialogClose}
            dialogTitle={`Delete Machine`}
            dialogContent={`Confirm deletion of Machine?`}
            dialogAction={() => {
              handleDelete(selectedRowId);
            }}
          />
          <MachineDialog
            action={action}
            open={formDialogOpen}
            machine={selectedRow}
            addMachine={addMachine}
            updateMachine={updateRow}
            handleClose={handleFormDialogClose}
            handleAlertOpen={handleAlertOpen}
          />
          <Toolbar
            name="Machines"
            deleteDisabled={deleteDisabled}
            handleSearch={handleSearch}
            handleAdd={handleAdd}
            handleFormDialogOpen={handleFormDialogOpen}
            handleConfirmDialogOpen={handleConfirmDialogOpen}
          />
          <Box
            sx={{
              mt: 3,
            }}
          >
            {rows.length > 0 ? (
              <DataGrid
                autoHeight
                rows={rows.filter((row) => {
                  if (search === '') {
                    return row;
                  } else {
                    return (
                      row.serialNumber.includes(search) ||
                      row.description.toLowerCase().includes(search)
                    );
                  }
                })}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10]}
                components={{
                  Toolbar: GridToolbar,
                }}
                onSelectionModelChange={(ids) => {
                  setSelectedRowId(ids[0]);
                }}
                isRowSelectable={(params) => !params.row.productionLineId}
              />
            ) : (
              <Card
                variant="outlined"
                sx={{
                  textAlign: 'center',
                }}
              >
                <CardContent>
                  <Typography>{`No Machine Found`}</Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        </Container>
      </Box>
    </>
  );
};

MachineManagement.getLayout = (page) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default MachineManagement;
