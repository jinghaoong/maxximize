import GroupsIcon from '@mui/icons-material/Groups';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import MoneyIcon from '@mui/icons-material/Money';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DayJS from 'dayjs';
import { useEffect, useState } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Blur } from '../components/blur';
import { DoughnutChart } from '../components/charts/doughnut-chart';
import { HorizontalChart } from '../components/charts/horizontal-chart';
import { VerticalChart } from '../components/charts/vertical-chart';
import { Budget } from '../components/dashboard/budget';
import { LatestOrders } from '../components/dashboard/latest-orders';
import { LatestProducts } from '../components/dashboard/latest-products';
import { Sales } from '../components/dashboard/sales';
import { TasksProgress } from '../components/dashboard/tasks-progress';
import { TotalCustomers } from '../components/dashboard/total-customers';
import { TotalProfit } from '../components/dashboard/total-profit';
import { TrafficByDevice } from '../components/dashboard/traffic-by-device';
import { Deliveries } from '../components/dashboards/deliveries';
import { GenericBigCard } from '../components/dashboards/generic-big-card';
import { GenericCard } from '../components/dashboards/generic-card';
import { InventoryCard } from '../components/dashboards/inventory-card';
import { TrackDelivery } from '../components/dashboards/track-delivery';
import { NotificationAlert } from '../components/notification-alert';
import { SeverityPill } from '../components/severity-pill';
import { apiHost, requestOptionsHelper } from '../helpers/constants';
import { getSessionUrl } from '../helpers/stripe';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const organisationId = user.organisation?.id;
  const role = user.role;

  const [active, setActive] = useState(true);
  const [sessionUrl, setSessionUrl] = useState();
  useEffect(() => {
    getSessionUrl(user, setSessionUrl);
    setActive(user.organisation?.membership?.status === 'active');
  }, []);

  // Alert Helpers
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState('error'); // success || error
  const [alertText, setAlertText] = useState('');
  const handleAlertOpen = (text, severity) => {
    setAlertSeverity(severity);
    setAlertText(text);
    setAlertOpen(true);
  };
  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  // Generic Card Helpers
  const getTrend = (change) => {
    if (change === 0) {
      return 'same';
    }
    if (change > 0) {
      return 'up';
    }
    if (change < 0) {
      return 'down';
    }
    return null;
  };

  // Profits Card Helpers
  const [profits, setProfits] = useState([]);
  const [profitChange, setProfitChange] = useState();

  const getProfits = async () => {
    const today = new Date();
    const url = `${apiHost}/profit`;
    const body = JSON.stringify({
      inDate: null,
      start: DayJS(today).subtract(1, 'month'),
      end: today,
      range: true,
      type: 'month',
      organisationId: organisationId,
    });

    const requestOptions = requestOptionsHelper('POST', body);

    await fetch(url, requestOptions)
      .then((res) => res.json())
      .then((result) => {
        setProfits(result);
        setProfitChange(result[1].profit - result[0].profit);
      });
  };
  // ------------------------------------------------------------------------------------

  // New Customers Card Helpers
  const [newCustomers, setNewCustomers] = useState();
  const getNewCustomers = async () => {
    const url = `${apiHost}/shell-organisations/newCustomers/${organisationId}`;
    await fetch(url)
      .then((res) => res.json())
      .then((result) => setNewCustomers(result));
  };
  // ------------------------------------------------------------------------------------

  // Production Throughput and Yield Card Helpers
  const [production, setProduction] = useState(); // [yield, throughput]
  const getProduction = async () => {
    const baseUrl = `${apiHost}/schedules`;
    const yieldUrl = `${baseUrl}/yield/${organisationId}`;
    const throughputUrl = `${baseUrl}/throughput/${organisationId}`;

    const getYield = fetch(yieldUrl).then((res) => res.json());
    const getThroughput = fetch(throughputUrl).then((res) => res.json());

    await Promise.all([getYield, getThroughput]).then((values) =>
      setProduction(values)
    );
  };
  // ------------------------------------------------------------------------------------

  // Inventory Card Helpers
  // Slider Helpers
  const [defaultLevel, setDefaultLevel] = useState(20);
  const [warningLevel, setWarningLevel] = useState(defaultLevel);

  const handleDrag = (event, value) => {
    setWarningLevel(value);
  };

  const [inventory, setInventory] = useState([]);

  const getInventory = async () => {
    const url = `${apiHost}/batch-line-items/inventoryLevel/${organisationId}/${warningLevel}`;
    await fetch(url)
      .then((res) => res.json())
      .then((result) => {
        const mapped = result.map((item, index) => {
          return { id: index, ...item };
        });
        setInventory(mapped);
      });
  };

  const handleRefresh = async () => {
    getInventory().then(() => {
      setDefaultLevel(warningLevel);
      handleAlertOpen(
        'Successfully updated Inventory Warning Level!',
        'success'
      );
    });
  };

  // Send Bulk Production Requests
  const sendProdRequests = async () => {
    const url = `${apiHost}/production-requests/bulk`;
    const productionRequestDtos = inventory.map((item) => {
      const dto = {
        quantity: item.totalQuantity - item.remainingQuantity,
        finalGoodId: item.finalGood.id,
        organisationId: organisationId,
      };
      return dto;
    });
    const requestOptions = requestOptionsHelper(
      'POST',
      JSON.stringify(productionRequestDtos)
    );

    await fetch(url, requestOptions)
      .then((res) => res.json())
      .then((result) => {
        getInventory();
        handleAlertOpen(
          'Successfully created Production Requests for Final Goods!',
          'success'
        );
      });
  };
  // ------------------------------------------------------------------------------------

  // Monthly Cost Breakdown Card + Doughnut
  const [costBreakdown, setCostBreakdown] = useState();
  const [costData, setCostData] = useState();
  const [costLabels, setCostLabels] = useState();

  const getCostBreakdown = async () => {
    const url = `${apiHost}/cost/breakdown`;
    const body = JSON.stringify({
      inDate: new Date(),
      start: null,
      end: null,
      range: false,
      type: 'month',
      organisationId: organisationId,
    });
    const requestOptions = requestOptionsHelper('POST', body);
    await fetch(url, requestOptions)
      .then((res) => res.json())
      .then((result) => {
        setCostBreakdown(result);

        const data = [];
        const labels = [];

        if (result) {
          result.forEach((item, index) => {
            data.push(item.costAmount);
            labels.push(item.name);
          });
        }
        setCostData(data);
        setCostLabels(labels);
      });
  };

  const costBreakdownHeaderProps = {
    title: 'Monthly Cost Breakdown',
  };

  const CostBreakdownCardContent = (props) => (
    <Box
      sx={{
        height: 400,
        position: 'relative',
      }}
    >
      <DoughnutChart data={costData} labels={costLabels} />
    </Box>
  );
  // ------------------------------------------------------------------------------------

  // Deliveries Helpers
  const [assigned, setAssigned] = useState();
  const [deliveries, setDeliveries] = useState([]);
  const getDeliveries = async () => {
    const url = `${apiHost}/delivery-requests/findAllByWorkerId/${user.id}`;
    await fetch(url)
      .then((res) => res.json())
      .then((result) => {
        const deliveries = [];
        let assigned = null;
        result.forEach((item, index) => {
          if (item.status === 'completed') {
            deliveries.push(item);
          } else {
            // assigned to Driver
            assigned = item;
          }
        });
        setAssigned(assigned);
        setDeliveries(deliveries);
      });
  };

  // ------------------------------------------------------------------------------------

  // Picking List Helpers
  const [pickingList, setPickingList] = useState([]);

  const getPickingList = async () => {
    const url = `${apiHost}/production-orders/retrieveBatchLineItemsForProduction/${organisationId}`;
    await fetch(url)
      .then((res) => res.json())
      .then((result) =>
        setPickingList(
          result.map((item, index) => {
            return { id: index, ...item };
          })
        )
      );
  };

  const pickingListColumns = [
    {
      field: 'code',
      headerName: 'Batch Line Item Code',
      flex: 2,
      valueGetter: (params) =>
        params.row ? params.row.batchLineItem.code : '',
    },
    {
      field: 'batchNumber',
      headerName: 'Batch Number',
      flex: 2,
      valueGetter: (params) =>
        params.row ? params.row.batchLineItem.batch.batchNumber : '',
    },
    {
      field: 'quantityToTake',
      headerName: 'Retrieve Quantity',
      flex: 1,
    },
  ];

  const pickingListHeaderProps = {
    title: `Batch Line Items to retrieve today, ${DayJS().format(
      'ddd DD MMM YYYY'
    )}`,
    action: <SeverityPill color="primary">Raw Materials</SeverityPill>,
  };

  const pickingListContent = (
    <DataGrid
      autoHeight
      rows={pickingList}
      columns={pickingListColumns}
      pageSize={10}
      rowsPerPageOptions={[10]}
      disableSelectionOnClick
    />
  );

  // ------------------------------------------------------------------------------------

  // Chart Helpers
  const today = new Date();

  // Date Helpers
  // 7, 14, 21
  const [selectedDays, setSelectedDays] = useState(7);

  useEffect(() => {
    if (selectedDays) {
      getGraphData();
    }
  }, [selectedDays]);

  const onChange = (event) => {
    console.log(event.target);
    setSelectedDays(event.target.value);
  };

  // Top X Customers contributing to Revenue Helpers
  const [selectedCount, setSelectedCount] = useState(5);

  useEffect(() => {
    if (selectedCount) {
      getHorizontalGraphData1();
    }
  }, [selectedCount]);

  const handleChange = (event) => {
    console.log(event.target);
    setSelectedCount(event.target.value);
  };

  const DropDown = () => {
    return (
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Date Range</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={selectedDays}
          label="time range"
          onChange={onChange}
        >
          <MenuItem value={7}>Last 7 days</MenuItem>
          <MenuItem value={14}>Last 14 days</MenuItem>
          <MenuItem value={21}>Last 21 days</MenuItem>
        </Select>
      </FormControl>
    );
  };

  const Counter = () => {
    return (
      <TextField
        fullWidth
        type="number"
        inputProps={{ max: 20, min: 1 }}
        sx={{ width: 100 }}
        label="Counter"
        margin="normal"
        name="Counter"
        onChange={handleChange}
        value={selectedCount}
      />
    );
  };

  // Total Sales amount chart data
  // This year vs Last year
  const [graphDataThisYear, setGraphDataThisYear] = useState([]);
  const [graphDataLastYear, setGraphDataLastYear] = useState([]);
  const [dateLabels, setDateLabels] = useState([]);

  const getGraphData = async () => {
    const apiUrl = `${apiHost}/revenue/salesAmount`;
    const body = JSON.stringify({
      days: selectedDays,
      currentDate: today,
      organisationId: organisationId,
    });
    const requestOptions = requestOptionsHelper('POST', body);

    await fetch(apiUrl, requestOptions)
      .then((res) => res.json())
      .then((result) => {
        const arrSalesAmountThisYear = [];
        const arrSalesAmountLastYear = [];
        const arrDateLabels = [];

        result.forEach((item) => {
          arrSalesAmountThisYear.push(item.salesAmountThisYear);
          arrSalesAmountLastYear.push(item.salesAmountLastYear);
          arrDateLabels.push(item.dateKey);
        });

        const reversedSalesThisYear = arrSalesAmountThisYear.reverse();
        const reversedSalesLastYear = arrSalesAmountLastYear.reverse();
        const reversedDays = arrDateLabels.reverse();

        setGraphDataThisYear(reversedSalesThisYear);
        setGraphDataLastYear(reversedSalesLastYear);
        setDateLabels(reversedDays);
      });
  };

  // horizontal graph data 1
  // Top X revenue contributors
  const [graphData1, setGraphData1] = useState([]);
  const [graphLabels1, setGraphLabels1] = useState([]);

  const getHorizontalGraphData1 = async () => {
    const apiUrl = `${apiHost}/revenue/contributors`;
    const body = JSON.stringify({
      inDate: today,
      start: null,
      end: null,
      range: false,
      type: 'month',
      organisationId: organisationId,
      count: selectedCount,
    });
    const requestOptions = requestOptionsHelper('POST', body);

    await fetch(apiUrl, requestOptions)
      .then((res) => res.json())
      .then((result) => {
        const nameLabels = [];
        const contributionLabels = [];

        result.forEach((item) => {
          nameLabels.push(item.name);
          contributionLabels.push(item.contribution);
        });

        setGraphData1(contributionLabels);
        setGraphLabels1(nameLabels);
      });
  };

  // horizontal graph data 2
  // Top X best selling goods
  const [graphData2, setGraphData2] = useState([]);
  const [graphLabels2, setGraphLabels2] = useState([]);

  const [selectedCount2, setSelectedCount2] = useState(5);

  const getHorizontalGraphData2 = async () => {
    const apiUrl = `${apiHost}/final-goods/topSales/${organisationId}/${selectedCount2}`;

    await fetch(apiUrl)
      .then((res) => res.json())
      .then((result) => {
        const nameLabels = [];
        const quantityLabels = [];

        result.forEach((item) => {
          nameLabels.push(item.name);
          quantityLabels.push(item.quantity);
        });

        setGraphData2(quantityLabels);
        setGraphLabels2(nameLabels);
      });
  };

  useEffect(() => {
    if (selectedCount2) {
      getHorizontalGraphData2();
    }
  }, [selectedCount2]);

  const handleChange2 = (event) => {
    console.log(event.target);
    setSelectedCount2(event.target.value);
  };

  const Counter2 = () => {
    return (
      <TextField
        fullWidth
        type="number"
        inputProps={{ max: 20, min: 1 }}
        sx={{ width: 100 }}
        label="Counter"
        margin="normal"
        name="Counter"
        onChange={handleChange2}
        value={selectedCount2}
      />
    );
  };
  // ------------------------------------------------------------------------------------

  // INIT
  useEffect(() => {
    // Set 1
    // Admin and Manager
    if (['admin', 'manager', 'superadmin'].includes(role)) {
      Promise.all([
        getProfits(),
        getNewCustomers(),
        getProduction(),
        getCostBreakdown(),
        getHorizontalGraphData2(),
      ])
        .then((values) => {
          // console.log(values);
        })
        .catch((err) => {
          console.log(err);
          // handleAlertOpen('Failed to fetch data', 'error')
        });
    }

    // Set 2
    // Factory Worker
    if (['factoryworker', 'superadmin'].includes(role)) {
      Promise.all([getInventory(), getPickingList()])
        .then((values) => {
          // console.log(values);
        })
        .catch((err) => {
          console.log(err);
          // handleAlertOpen('Failed to fetch data', 'error')
        });
    }

    // Set 3
    // Driver
    if (['driver', 'superadmin'].includes(role)) {
      Promise.all([getDeliveries()])
        .then((values) => {
          // console.log(values);
        })
        .catch((err) => {
          console.log(err);
          // handleAlertOpen('Failed to fetch data', 'error')
        });
    }
  }, []);

  // Dashboard Grid Items
  // For Manager + Admin
  const DashboardItems1 = (props) => (
    <>
      <Grid item lg={3} sm={6} xl={3} xs={12}>
        <GenericCard
          key="new-customers"
          sx={{ height: '100% ' }}
          title={'New Customers'}
          icon={<GroupsIcon />}
          value={newCustomers ? `${newCustomers.count}` : null}
          change={
            newCustomers ? `${newCustomers.pct_change.toFixed(2)}%` : null
          }
          trend={getTrend(newCustomers?.pct_change)}
          sinceLast={'month'}
          avatarColor={'primary.main'}
        />
      </Grid>
      <Grid item lg={3} sm={6} xl={3} xs={12}>
        <GenericCard
          key="profit"
          sx={{ height: '100% ' }}
          title={'Profit'}
          icon={<MoneyIcon />}
          value={profits.length > 1 ? `$${profits[1].profit}` : null}
          change={
            profits.length > 1 ? `${(profitChange / 100).toFixed(2)}%` : null
          }
          trend={getTrend(profitChange)}
          sinceLast={'month'}
          avatarColor={'secondary.main'}
        />
      </Grid>
      <Grid item lg={3} sm={6} xl={3} xs={12}>
        <GenericCard
          key="production-throughput"
          sx={{ height: '100% ' }}
          title={'Production Throughput'}
          icon={<PrecisionManufacturingIcon />}
          value={production ? `${production[1].toFixed(2)}` : null}
          change={production ? 'Amount of Final Goods / hr' : null}
          avatarColor={'warning.main'}
        />
      </Grid>
      <Grid item lg={3} sm={6} xl={3} xs={12}>
        <GenericCard
          key="production-yield"
          sx={{ height: '100% ' }}
          title={'Production Yield'}
          icon={<PrecisionManufacturingIcon />}
          value={production ? `${(production[0] * 100).toFixed(1)}%` : null}
          avatarColor={'warning.main'}
        />
      </Grid>
      <Grid item lg={8} md={8} xl={9} xs={12}>
        <InventoryCard
          sx={{ height: '100%' }}
          defaultLevel={defaultLevel}
          warningLevel={warningLevel}
          handleDrag={handleDrag}
          inventory={inventory}
          handleRefresh={handleRefresh}
          sendProdRequests={sendProdRequests}
          handleAlertOpen={handleAlertOpen}
        />
      </Grid>
      <Grid item lg={4} md={4} xl={3} xs={12}>
        <GenericBigCard
          headerProps={costBreakdownHeaderProps}
          content={<CostBreakdownCardContent />}
        />
      </Grid>

      {/* CHARTS */}
      <Grid item lg={12} md={12} xl={12} xs={12}>
        <VerticalChart
          dropDown={<DropDown />}
          dateLabels={dateLabels}
          graphDataThisYear={graphDataThisYear}
          graphDataLastYear={graphDataLastYear}
          graphTitle="Total Sales Amount"
        />
      </Grid>

      <Grid item lg={6} md={12} xl={6} xs={12}>
        <HorizontalChart
          counter={<Counter2 />}
          graphLabels={graphLabels2}
          graphData={graphData2}
          graphTitle={`Top ${selectedCount2} best selling goods this month`}
          sx={{ height: '100%' }}
        />
      </Grid>

      <Grid item lg={6} md={12} xl={6} xs={12}>
        <HorizontalChart
          counter={<Counter />}
          graphLabels={graphLabels1}
          graphData={graphData1}
          graphTitle={`Top ${selectedCount} customers contributing to revenue`}
          sx={{ height: '100%' }}
        />
      </Grid>
    </>
  );

  // Worker Dashboard Items
  const DashboardItems2 = (props) => (
    <>
      <Grid item lg={6} md={12} xl={6} xs={12}>
        <GenericBigCard
          headerProps={pickingListHeaderProps}
          content={pickingListContent}
        />
      </Grid>
      <Grid item lg={6} md={12} xl={6} xs={12}>
        <InventoryCard
          sx={{ height: '100%' }}
          defaultLevel={defaultLevel}
          warningLevel={warningLevel}
          handleDrag={handleDrag}
          inventory={inventory}
          handleRefresh={handleRefresh}
          sendProdRequests={sendProdRequests}
          handleAlertOpen={handleAlertOpen}
        />
      </Grid>
    </>
  );

  // Driver Dashboard Items
  const DashboardItems3 = (props) => (
    <>
      <Grid item lg={8} md={12} xl={9} xs={12}>
        <Deliveries
          sx={{ height: '100%' }}
          assigned={assigned}
          deliveries={deliveries}
          handleRefresh={handleRefresh}
          handleAlertOpen={handleAlertOpen}
          getDeliveries={getDeliveries}
        />
      </Grid>
      <Grid item lg={4} md={6} xl={3} xs={12}>
        <TrackDelivery sx={{ height: '100%' }} assigned={assigned} />
      </Grid>
    </>
  );

  // For reference
  const DefaultDashboardItems = () => (
    <>
      <Grid item lg={3} sm={6} xl={3} xs={12}>
        <Budget />
      </Grid>
      <Grid item xl={3} lg={3} sm={6} xs={12}>
        <TotalCustomers />
      </Grid>
      <Grid item xl={3} lg={3} sm={6} xs={12}>
        <TasksProgress />
      </Grid>
      <Grid item xl={3} lg={3} sm={6} xs={12}>
        <TotalProfit sx={{ height: '100%' }} />
      </Grid>
      <Grid item lg={8} md={12} xl={9} xs={12}>
        <Sales />
      </Grid>
      <Grid item lg={4} md={6} xl={3} xs={12}>
        <TrafficByDevice sx={{ height: '100%' }} />
      </Grid>
      <Grid item lg={4} md={6} xl={3} xs={12}>
        <LatestProducts sx={{ height: '100%' }} />
      </Grid>
      <Grid item lg={8} md={12} xl={9} xs={12}>
        <LatestOrders />
      </Grid>
    </>
  );
  // ------------------------------------------------------------------------------------

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>{`Homepage | ${user?.organisation?.name}`}</title>
        </Helmet>
      </HelmetProvider>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 4,
        }}
      >
        <Blur open={!active}>
          <Box
            sx={{
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" pb={2}>
              Visit the Customer Portal to Resume or Start your Subscription
            </Typography>
            {sessionUrl ? (
              <Button
                LinkComponent={Link}
                variant="contained"
                endIcon={<ManageAccountsIcon />}
                href={sessionUrl}
              >
                Customer Portal
              </Button>
            ) : (
              <Skeleton
                sx={{ bgcolor: 'grey.700' }}
                variant="rectangular"
                width={500}
                height={50}
              />
            )}
          </Box>
        </Blur>
        <NotificationAlert
          open={alertOpen}
          severity={alertSeverity}
          text={alertText}
          handleClose={handleAlertClose}
        />
        <Container maxWidth={false}>
          <Grid container spacing={3} width="100%">
            {/* <DefaultDashboardItems /> */}
            {['manager', 'admin', 'superadmin'].includes(role) && (
              <DashboardItems1 />
            )}
            {['factoryworker', 'superadmin'].includes(role) && (
              <DashboardItems2 />
            )}
            {['driver', 'superadmin'].includes(role) && <DashboardItems3 />}
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default Dashboard;
