import MoreVert from '@mui/icons-material/MoreVert';
import {
  Box,
  Card,
  CardContent,
  Container,
  IconButton,
  Typography,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { DashboardLayout } from '../../components/dashboard-layout';
import { NotificationAlert } from '../../components/notification-alert';
import { QuotationDialog } from '../../components/procurement-ordering/quotation-dialog';
import { Toolbar } from '../../components/toolbar';
import { ConfirmDialog } from '../../components/product/confirm-dialog';
import { ProductMenu } from '../../components/product/product-menu';
import {
  deleteQuotations,
  fetchQuotations,
} from '../../helpers/procurement-ordering';
import format from 'date-fns/format';
import dayjs from 'dayjs';

const Quotation = (props) => {
  const user = JSON.parse(localStorage.getItem('user'));

  // NotificationAlert helpers
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

  // Search Helpers
  const [search, setSearch] = useState('');
  const handleSearch = (event) => {
    setSearch(event.target.value.toLowerCase().trim());
  };

  // DataGrid Row and Toolbar helpers
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [deleteDisabled, setDeleteDisabled] = useState();

  useEffect(() => {
    setDeleteDisabled(selectedRows.length === 0);
  }, [selectedRows]);

  // Confirm Dialog Helpers
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const handleConfirmDialogOpen = () => {
    setConfirmDialogOpen(true);
  };
  const handleConfirmDialogClose = () => {
    setConfirmDialogOpen(false);
  };

  // Form Dialog Helpers
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

  // Menu Helpers
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAction('PATCH');
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleEdit = () => {
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

  // CRUD helpers
  const addQuotation = (quotation) => {
    const updatedProducts = [...rows, quotation];
    setRows(updatedProducts);
    handleAlertOpen(`Added Quotation ${quotation.id} successfully!`, 'success');
  };

  // const handleRowUpdate = (newRow) => {
  //   const updatedRow = {...newRow};
  //   getQuotations();
  //   handleAlertOpen(`Updated Quotation ${newRow.id} successfully!`, 'success');
  //   return updatedRow;
  // }

  const handleDelete = (ids) => {
    // delete rows
    deleteQuotations(ids)
      .then(() => {
        handleAlertOpen(`Successfully deleted Quotation(s)`, 'success');
      })
      .then(() => getQuotations());
  };

  // DataGrid Rows & Columns
  const [rows, setRows] = useState([]);

  const getQuotations = async () => {
    fetchQuotations(user.organisation.id)
      .then((result) => {
        setRows(result);
      })
      .then(() => setSelectedRows([]))
      .catch((err) => handleAlertOpen(`Failed to fetch Quotations`, 'error'));
  };

  useEffect(() => {
    if (!formDialogOpen) {
      getQuotations();
    }
  }, [formDialogOpen]);

  const columns = [
    {
      field: 'id',
      headerName: 'Quotation ID',
      flex: 1,
    },
    {
      field: 'created',
      headerName: 'Date Created',
      flex: 2,
      valueGetter: (params) => {
        return dayjs(params.row.created).format('DD MMM YYYY hh:mm a');
      },
    },
    {
      field: 'supplierId',
      headerName: 'Supplier ID',
      flex: 1,
      valueGetter: (params) => {
        return params.row.shellOrganisation
          ? params.row.shellOrganisation.id
          : params.row.currentOrganisationId;
      },
    },
    {
      field: 'supplierName',
      headerName: 'Supplier Name',
      flex: 3,
      valueGetter: (params) => {
        return params.row.shellOrganisation
          ? params.row.shellOrganisation.name
          : params.row.currentOrganisation.name;
      },
    },
    {
      field: 'totalPrice',
      headerName: 'Quotation Total Price',
      flex: 2,
      valueFormatter: (params) => params.value ? `$ ${params.value}` : ''
    },
    {
      field: 'Actions',
      flex: 1,
      renderCell: menuButton,
    },
  ];

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>
            Quotation
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
          <ProductMenu
            anchorEl={anchorEl}
            menuOpen={menuOpen}
            handleClickOpen={handleFormDialogOpen}
            handleMenuClose={handleMenuClose}
            handleClickViewEdit={handleEdit}
          />
          <ConfirmDialog
            open={confirmDialogOpen}
            handleClose={handleConfirmDialogClose}
            dialogTitle={`Delete Quotation(s)`}
            dialogContent={`Confirm deletion of Quotation(s)?`}
            dialogAction={() => {
              handleDelete(selectedRows);
            }}
          />
          <QuotationDialog
            action={action}
            open={formDialogOpen}
            handleClose={handleFormDialogClose}
            string={'Quotation'}
            quotation={selectedRow}
            addQuotation={addQuotation}
            // update
            handleAlertOpen={handleAlertOpen}
          />
          <Toolbar
            name="Quotation"
            numRows={selectedRows.length}
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
                      row.id.toString().includes(search) ||
                      row.shellOrganisation.name.toLowerCase().includes(search)
                    );
                  }
                })}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10]}
                checkboxSelection
                disableSelectionOnClick
                components={{
                  Toolbar: GridToolbar,
                }}
                onSelectionModelChange={(ids) => {
                  setSelectedRows(ids);
                }}
                isRowSelectable={(params) => {
                  return (
                    !params.row.purchaseOrder && params.row.shellOrganisation
                  );
                }}
                // experimentalFeatures={{ newEditingApi: true }}
                // processRowUpdate={handleRowUpdate}
              />
            ) : (
              <Card
                variant="outlined"
                sx={{
                  textAlign: 'center',
                }}
              >
                <CardContent>
                  <Typography>{`No Quotations Found`}</Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        </Container>
      </Box>
    </>
  );
};

Quotation.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Quotation;
