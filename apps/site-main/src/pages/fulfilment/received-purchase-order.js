import { Box, Card, Container, IconButton } from '@mui/material';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import SendIcon from '@mui/icons-material/Send';
import { NotificationAlert } from '../../components/notification-alert';
import DayJS from 'dayjs';
import { ReceivedPurchaseOrderConfirmDialog } from '../../components/fulfilment/received-purchase-orders/received-po-confirm-dialog';
import { ReceivedPurchaseOrderToolbar } from '../../components/fulfilment/received-purchase-orders/received-po-toolbar';
import MoreVert from '@mui/icons-material/MoreVert';
import { ReceivedPurchaseOrderMenu } from '../../components/fulfilment/received-purchase-orders/received-po-menu';
import { ReceivedPurchaseOrderViewDialog } from '../../components/fulfilment/received-purchase-orders/received-po-view-dialog';

const ReceivedPurchaseOrder = () => {
  //TODO remove
  const [receivedPurchaseOrder, setReceivedPurchaseOrder] = useState([
    {
      id: 1,
      dateReceived: '05/10/2022 03:00PM',
      inquirer: 'Testing Manufacturer',
      totalPrice: '$1500',
      status: 'Awaiting Response',
    },
    {
      id: 2,
      dateReceived: '06/10/2022 11:27AM',
      inquirer: 'Testing Manufacturer 2',
      totalPrice: '$10000',
      status: 'Awaiting Response',
    },
  ]);
  const [selectedRow, setSelectedRow] = useState();
  const [selectedRows, setSelectedRows] = useState([]);
  const [disabled, setDisabled] = useState();

  const user = JSON.parse(localStorage.getItem('user'));
  const organisationId = user.organisation.id;

  //Load in list of sales inquiries, initial
  useEffect(() => {
    retrieveAllReceivedPurchaseOrder();
  }, []);

  //Keep track of selectedRows for deletion
  useEffect(() => {
    setDisabled(selectedRows.length === 0);
  }, [selectedRows]);

  //Retrieve all incoming sales inquiries
  const retrieveAllReceivedPurchaseOrder = async () => {
    const response = await fetch(
      `http://localhost:3000/api/sales-inquiry/all/${organisationId}`
    );
    let result = [];
    if (response.status == 200 || response.status == 201) {
      result = await response.json();
    }
    setReceivedPurchaseOrder(result);
  };

  //Search Function
  const [search, setSearch] = useState('');

  const handleSearch = (event) => {
    setSearch(event.target.value.toLowerCase().trim());
  };

  //Menu Button
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menuButton = (params) => {
    return (
      <IconButton
        // disabled={params.row.bins?.length == 0}
        onClick={(event) => {
          setSelectedRow(params.row);
          handleMenuClick(event);
        }}
      >
        <MoreVert />
      </IconButton>
    );
  };

  //Alert Notification
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

  // Dialog helpers
  const [purchaseOrderDialogOpen, setPurchaseOrderDialogOpen] = useState(false);

  const handleClickView = () => {
    setPurchaseOrderDialogOpen(true);
  };

  const handleClickClose = () => {
    setPurchaseOrderDialogOpen(false);
  };

  //Delete Confirm dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const handleConfirmDialogOpen = () => {
    setConfirmDialogOpen(true);
  };
  const handleConfirmDialogClose = () => {
    setConfirmDialogOpen(false);
  };

  //Handle Delete
  //Rejecting a sales inquiry
  //Also alerts user of ourcome
  const handleDelete = async (selectedIds) => {
    const requestOptions = {
      method: 'DELETE',
    };

    // selectedIds.forEach((currentId) => {
    //   fetch(`http://localhost:3000/api/warehouses/${currentId}`, requestOptions)
    //     .then(() => {
    //       handleAlertOpen(`Successfully deleted warehouse(s)`, 'success');
    //     })
    //     .catch((error) => {
    //       handleAlertOpen(`Failed to delete warehouse(s):${error}`, 'error');
    //     });
    // });

    // setWarehouses(
    //   warehouses.filter((warehouse) => !selectedIds.includes(warehouse.id))
    // );
  };

  //Columns for datagrid, column headers & specs
  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
      flex: 1,
    },
    {
      field: 'created',
      headerName: 'Date Received',
      width: 70,
      flex: 3,
      valueFormatter: (params) =>
        DayJS(params?.value).format('DD MMM YYYY hh:mm a'),
    },
    {
      field: 'inquirer',
      headerName: 'Inquirer',
      width: 200,
      flex: 4,
      //TODO
      valueGetter: (params) => {
        return params.row ? params.row.currentOrganisation?.name : '';
      },
    },
    {
      field: 'totalPrice',
      headerName: 'Total Price',
      width: 200,
      flex: 2,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      flex: 2,
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 150,
      flex: 1,
      renderCell: menuButton,
    },
  ];

  //Row for datagrid, set the list returned from API
  const rows = receivedPurchaseOrder;

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>{`Received Purchase Order | ${user?.organisation?.name}`}</title>
        </Helmet>
      </HelmetProvider>
      <NotificationAlert
        open={alertOpen}
        severity={alertSeverity}
        text={alertText}
        handleClose={handleAlertClose}
      />
      <ReceivedPurchaseOrderConfirmDialog
        open={confirmDialogOpen}
        handleClose={handleConfirmDialogClose}
        dialogTitle={`Reject Purchase Order(s)`}
        dialogContent={`Confirm rejection of sales inquiry(s)?`}
        dialogAction={() => {
          handleDelete(selectedRows);
        }}
      />
      <ReceivedPurchaseOrderViewDialog
        open={purchaseOrderDialogOpen}
        handleClose={handleClickClose}
        purchaseOrder={selectedRow}
        handleAlertOpen={handleAlertOpen}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 4,
          pb: 4,
        }}
      >
        <Container maxWidth={false}>
          <ReceivedPurchaseOrderToolbar
            disabled={disabled}
            numPurchaseOrder={selectedRows.length}
            handleConfirmDialogOpen={handleConfirmDialogOpen}
            handleSearch={handleSearch}
          />
          <ReceivedPurchaseOrderMenu
            anchorEl={anchorEl}
            menuOpen={menuOpen}
            handleMenuClose={handleMenuClose}
            handleClickView={handleClickView}
          />
          <Box sx={{ mt: 3 }}>
            <Card>
              <Box sx={{ minWidth: 1050 }}>
                <DataGrid
                  autoHeight
                  rows={rows.filter((row) => {
                    if (search === '') {
                      return row;
                    } else {
                      return (
                        row.id.toString().includes(search) ||
                        row.inquirer.toLowerCase().includes(search)
                      );
                    }
                  })}
                  columns={columns}
                  pageSize={10}
                  rowsPerPageOptions={[10]}
                  allowSorting={true}
                  components={{
                    Toolbar: GridToolbar,
                  }}
                  disableSelectionOnClick
                  checkboxSelection
                  onSelectionModelChange={(ids) => {
                    setSelectedRows(ids);
                  }}
                />
              </Box>
            </Card>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default ReceivedPurchaseOrder;