import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AddRoadIcon from '@mui/icons-material/AddRoad';
import ArchiveIcon from '@mui/icons-material/Archive';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import EggIcon from '@mui/icons-material/Egg';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import InsightsIcon from '@mui/icons-material/Insights';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import RawOnIcon from '@mui/icons-material/RawOn';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ReplyAllIcon from '@mui/icons-material/ReplyAll';
import RequestPageIcon from '@mui/icons-material/RequestPage';
import RuleIcon from '@mui/icons-material/Rule';
import TaskIcon from '@mui/icons-material/Task';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import MoneyIcon from '@mui/icons-material/Money';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Collapse,
  Divider,
  Drawer,
  Link,
  useMediaQuery,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { User as UserIcon } from '../icons/user';
import { Logo } from './logo';
import { OrganisationPlanBox } from './organisation-plan-box';

const standalone = [
  {
    href: '/',
    icon: <DashboardIcon fontSize="small" />,
    title: 'Dashboard',
    access: ['admin', 'manager', 'factoryworker', 'superadmin'],
  },
  {
    href: '/workermanagement',
    icon: <UserIcon fontSize="small" />,
    title: 'Worker Management',
    access: ['admin', 'superadmin'],
  },
  {
    href: '/businessrelations',
    icon: <CorporateFareIcon fontSize="small" />,
    title: 'Business Relations',
    subsystemName: '',
    access: ['admin', 'manager', 'superadmin'],
  },
];

const items = [
  {
    subsystem: 'Finance',
    basepath: 'finance',
    access: ['manager', 'admin', 'superadmin'],
    icon: (
      <AccountBalanceIcon
        sx={{ marginTop: 0.2, color: '#9CA3AF' }}
        fontSize="small"
      />
    ),
    open: 'openFinance',
    handleClick: 'handleFinanceClick',
    modules: [
      {
        href: '/finance/revenue-cost',
        icon: <MoneyIcon fontSize="small" />,
        title: 'Revenue & Cost',
        access: ['manager', 'admin', 'superadmin'],
      },
      {
        href: '/finance/profit-insight',
        icon: <InsightsIcon fontSize="small" />,
        title: 'Profit Insight',
        access: ['manager', 'admin', 'superadmin'],
      },
      {
        href: '/finance/b2b-invoice',
        icon: <ReceiptIcon fontSize="small" />,
        title: 'B2B Invoice',
        access: ['manager', 'admin', 'superadmin'],
      },
      {
        href: '/finance/maxximize-payments',
        icon: <CardMembershipIcon fontSize="small" />,
        title: 'Maxximize Payments',
        access: ['manager', 'admin', 'superadmin'],
      },
    ],
  },
  {
    subsystem: 'Quality Assurance',
    basepath: 'quality-assurance',
    access: ['manager', 'factoryworker', 'superadmin'],
    icon: (
      <FactCheckIcon
        sx={{ marginTop: 0.2, color: '#9CA3AF' }}
        fontSize="small"
      />
    ),
    open: 'openQualityAssurance',
    handleClick: 'handleQualityAssuranceClick',
    modules: [
      {
        href: '/quality-assurance/rules',
        icon: <RuleIcon fontSize="small" />,
        title: 'Rules',
        access: ['manager', 'factoryworker', 'superadmin'],
      },
      {
        href: '/quality-assurance/checklists',
        icon: <AssignmentTurnedInIcon fontSize="small" />,
        title: 'Checklist',
        access: ['manager', 'factoryworker', 'superadmin'],
      },
      {
        href: '/quality-assurance/tracking',
        icon: <AccountTreeIcon fontSize="small" />,
        title: 'Tracking',
        access: ['manager', 'factoryworker', 'superadmin'],
        pro: true,
      },
    ],
  },
  {
    subsystem: 'Inventory',
    basepath: 'inventory',
    access: ['manager', 'factoryworker', 'superadmin'],
    icon: (
      <Inventory2Icon
        sx={{ marginTop: 0.2, color: '#9CA3AF' }}
        fontSize="small"
      />
    ),
    open: 'openInventory',
    handleClick: 'handleInventoryClick',
    modules: [
      {
        href: '/inventory/warehouse',
        icon: <WarehouseIcon fontSize="small" />,
        title: 'Warehouse',
        access: ['superadmin', 'manager', 'factoryworker'],
      },
      {
        href: '/inventory/masterlist',
        icon: <FormatListNumberedIcon fontSize="small" />,
        title: 'Masterlist',
        access: ['superadmin', 'manager', 'factoryworker'],
        pro: true,
      },
    ],
  },
  {
    subsystem: 'Product',
    basepath: 'products',
    access: ['manager', 'superadmin'],
    icon: (
      <EggIcon sx={{ marginTop: 0.2, color: '#9CA3AF' }} fontSize="small" />
    ),
    open: 'openProduct',
    handleClick: 'handleProductClick',
    modules: [
      {
        href: '/products/raw-materials',
        icon: <RawOnIcon fontSize="small" />,
        title: 'Raw Materials',
        access: ['manager', 'superadmin'],
      },
      {
        href: '/products/final-goods',
        icon: <DoneAllIcon fontSize="small" />,
        title: 'Final Goods',
        access: ['manager', 'superadmin'],
      },
    ],
  },
  {
    subsystem: 'Procurement',
    basepath: 'procurement',
    access: ['manager', 'factoryworker', 'superadmin'],
    icon: (
      <ArchiveIcon sx={{ marginTop: 0.2, color: '#9CA3AF' }} fontSize="small" />
    ),
    open: 'openProcurement',
    handleClick: 'handleProcurementClick',
    modules: [
      {
        href: '/procurement/forecast',
        icon: <QueryStatsIcon fontSize="small" />,
        title: 'Demand Forecast',
        access: ['manager', 'superadmin'],
        pro: true,
      },
      {
        href: '/procurement/purchase-requisition',
        icon: <RequestPageIcon fontSize="small" />,
        title: 'Purchase Requisition',
        access: ['manager', 'factoryworker', 'superadmin'],
      },
      {
        href: '/procurement/sales-inquiry',
        icon: <LiveHelpIcon fontSize="small" />,
        title: 'Sales Inquiry',
        access: ['manager', 'factoryworker', 'superadmin'],
      },
      {
        href: '/procurement/quotation',
        icon: <FormatQuoteIcon fontSize="small" />,
        title: 'Quotation',
        access: ['manager', 'factoryworker', 'superadmin'],
      },
      {
        href: '/procurement/purchase-order',
        icon: <ListAltIcon fontSize="small" />,
        title: 'Purchase Order',
        access: ['manager', 'factoryworker', 'superadmin'],
      },
      {
        href: '/procurement/goods-receipt',
        icon: <ReceiptIcon fontSize="small" />,
        title: 'Goods Receipt',
        access: ['manager', 'factoryworker', 'superadmin'],
      },
    ],
  },
  {
    subsystem: 'Production',
    basepath: 'production',
    access: ['manager', 'factoryworker', 'superadmin'],
    icon: (
      <CalendarMonthIcon
        sx={{ marginTop: 0.2, color: '#9CA3AF' }}
        fontSize="small"
      />
    ),
    open: 'openProduction',
    handleClick: 'handleProductionClick',
    modules: [
      {
        href: '/production/bill-of-material',
        icon: <FormatListBulletedIcon fontSize="small" />,
        title: 'Bill Of Material',
        access: ['manager', 'superadmin'],
      },
      {
        href: '/production/machine',
        icon: <PrecisionManufacturingIcon fontSize="small" />,
        title: 'Machine Management',
        access: ['manager', 'factoryworker', 'superadmin'],
      },
      {
        href: '/production/production-line',
        icon: <AddRoadIcon fontSize="small" />,
        title: 'Production Line',
        access: ['manager', 'factoryworker', 'superadmin'],
      },
      {
        href: '/production/delivery-fleet-management',
        icon: <LocalShippingIcon fontSize="small" />,
        title: 'Delivery Fleet',
        access: ['manager', 'factoryworker', 'superadmin'],
      },
      {
        href: '/production/production-request',
        icon: <FindInPageIcon fontSize="small" />,
        title: 'Production Request',
        access: ['manager', 'factoryworker', 'superadmin'],
      },
      {
        href: '/production/production-order',
        icon: <TaskIcon fontSize="small" />,
        title: 'Production Order',
        access: ['manager', 'factoryworker', 'superadmin'],
      },
    ],
  },
  {
    subsystem: 'Sales & Distribution',
    basepath: 'fulfilment',
    access: ['manager', 'factoryworker', 'superadmin'],
    icon: (
      <EventAvailableIcon
        sx={{ marginTop: 0.2, color: '#9CA3AF' }}
        fontSize="small"
      />
    ),
    open: 'openFulfilment',
    handleClick: 'handleFulfilmentClick',
    modules: [
      {
        href: '/fulfilment/bulk-discount',
        icon: <LocalOfferIcon fontSize="small" />,
        title: 'Bulk Discount',
        access: ['manager', 'admin', 'superadmin'],
      },
      {
        href: '/fulfilment/received-sales-inquiry',
        icon: <ReplyAllIcon fontSize="small" />,
        title: 'Received Sales Inquiry',
        access: ['manager', 'factoryworker', 'superadmin'],
      },
      {
        href: '/fulfilment/sent-quotation',
        icon: <MarkEmailReadIcon fontSize="small" />,
        title: 'Sent Quotation',
        access: ['manager', 'factoryworker', 'superadmin'],
      },
      {
        href: '/fulfilment/received-purchase-order',
        icon: <DocumentScannerIcon fontSize="small" />,
        title: 'Received Purchase Order',
        access: ['manager', 'factoryworker', 'superadmin'],
      },
      {
        href: '/fulfilment/delivery-request',
        icon: <LocalShippingIcon fontSize="small" />,
        title: 'Delivery Request',
        access: ['manager', 'factoryworker', 'superadmin'],
      },
    ],
  },
];

export const DashboardSidebar = (props) => {
  const { user, ...rest } = props;
  const [active, setActive] = useState(false);
  useEffect(() => {
    setActive(user.organisation?.membership?.status === 'active');
  }, [user]);

  const { pathname } = useLocation();
  const basepath = pathname.slice(1, pathname.lastIndexOf('/'));

  const { open, onClose } = props;
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'), {
    defaultMatches: true,
    noSsr: false,
  });

  //Handle quality assurance nested menu
  const [openQualityAssurance, setOpenQualityAssurance] = useState(true);

  const handleQualityAssuranceClick = () => {
    setOpenQualityAssurance(!openQualityAssurance);
  };

  //Handle inventory nested menu
  const [openInventory, setOpenInventory] = useState(true);

  const handleInventoryClick = () => {
    setOpenInventory(!openInventory);
  };

  //Handle product nested menu
  const [openProduct, setOpenProduct] = useState(true);

  const handleProductClick = () => {
    setOpenProduct(!openProduct);
  };

  //Handle procurement nested menu
  const [openProcurement, setOpenProcurement] = useState(true);

  const handleProcurementClick = () => {
    setOpenProcurement(!openProcurement);
  };

  //Handle production nested menu
  const [openProduction, setOpenProduction] = useState(true);

  const handleProductionClick = () => {
    setOpenProduction(!openProduction);
  };

  //Handle fulfilment nested menu
  const [openFulfilment, setOpenFulfilment] = useState(true);

  const handleFulfilmentClick = () => {
    setOpenFulfilment(!openFulfilment);
  };

  // handle finance nested menu
  const [openFinance, setOpenFinance] = useState(true);

  const handleFinanceClick = () => {
    setOpenFinance(!openFinance);
  };

  const standaloneModules = standalone
    .filter((module) => module.access.includes(user.role))
    .map((module, index) => {
      return (
        <Link
          component={RouterLink}
          to={module.href}
          key={index}
          color="secondary"
          underline="none"
          sx={{ mr: 3, ml: -1.4 }}
        >
          <Button
            startIcon={module.icon}
            disableRipple
            sx={{
              backgroundColor:
                module.href === pathname && 'rgba(255,255,255, 0.08)',
              borderRadius: 1,
              color:
                module.href === pathname ? 'secondary.main' : 'neutral.300',
              fontWeight: module.href === pathname && 'fontWeightBold',
              justifyContent: 'flex-start',
              px: 3,
              textAlign: 'left',
              textTransform: 'none',
              width: '100%',
              '& .MuiButton-startIcon': {
                color:
                  module.href === pathname ? 'secondary.main' : 'neutral.400',
              },
              '&:hover': {
                backgroundColor: 'rgba(255,255,255, 0.08)',
              },
            }}
          >
            <Box sx={{ flexGrow: 1 }}>{module.title}</Box>
          </Button>
        </Link>
      );
    });

  const nestedModules = items
    .filter((subsystem) => subsystem.access.includes(user.role))
    .map((item, index) => {
      return (
        <Box key={index} sx={{ mr: 1 }}>
          <Accordion
            defaultExpanded={basepath === item.basepath}
            disableGutters
            sx={{
              backgroundColor: 'rgba(17,24,39)',
              color: 'neutral.300',
              fontWeight: 'fontWeightBold',
              justifyContent: 'flex-start',
              width: '100%',
              '&:hover': {
                backgroundColor: 'rgba(17,24,39)',
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: 'rgba(17,24,39)',
                color: 'neutral.300',
                fontWeight: 'fontWeightBold',
                fontSize: '14px',
                justifyContent: 'flex-start',
                width: '100%',
                '&:hover': {
                  backgroundColor: 'rgba(17,24,39)',
                },
              }}
            >
              <Box display="flex" ml={-1}>
                {item.icon}
                <Box ml={1}>{item.subsystem}</Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                backgroundColor: 'rgba(17,24,39)',
                color: 'neutral.300',
                fontWeight: 'fontWeightBold',
                justifyContent: 'flex-start',
                width: '100%',
                '&:hover': {
                  backgroundColor: 'rgba(17,24,39)',
                },
                pl: 0,
              }}
            >
              {item.modules
                .filter((module) => module.access.includes(user.role))
                .filter((module) =>
                  module.pro
                    ? module.pro && user.organisation.membership?.plan === 'pro'
                    : true
                )
                .map((module, index) => (
                  <Collapse
                    key={index}
                    in={eval(item.open)}
                    timeout="auto"
                    unmountOnExit
                  >
                    <Link
                      component={RouterLink}
                      to={module.href}
                      key={index}
                      color="secondary"
                      underline="none"
                    >
                      <Button
                        startIcon={module.icon}
                        disableRipple
                        sx={{
                          backgroundColor:
                            module.href === pathname &&
                            'rgba(255,255,255, 0.08)',
                          borderRadius: 1,
                          color:
                            module.href === pathname
                              ? 'secondary.main'
                              : 'neutral.300',
                          fontWeight:
                            module.href === pathname && 'fontWeightBold',
                          justifyContent: 'flex-start',
                          px: 3,
                          my: 0.5,
                          textAlign: 'left',
                          textTransform: 'none',
                          width: '100%',
                          '& .MuiButton-startIcon': {
                            color:
                              module.href === pathname
                                ? 'secondary.main'
                                : 'neutral.400',
                          },
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255, 0.08)',
                          },
                        }}
                      >
                        <Box sx={{ flexGrow: 1 }}>{module.title}</Box>
                      </Button>
                    </Link>
                  </Collapse>
                ))}
            </AccordionDetails>
          </Accordion>
        </Box>
      );
    });

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div>
        <Box
          sx={{
            p: 3,
            display: 'flex',
            justifyContent: 'start',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Link to="/">
            <Logo
              sx={{
                height: 42,
                width: 42,
              }}
            />
          </Link>
          Welcome {user.firstName}! [{user.role}]
        </Box>
        <Box sx={{ px: 2 }}>
          <OrganisationPlanBox user={user} />
        </Box>
      </div>
      <Divider
        sx={{
          borderColor: '#2D3748',
          my: 3,
        }}
      />
      <Box
        sx={{
          pl: 2,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
        }}
      >
        {active && (
          <>
            {standaloneModules}
            {nestedModules}
          </>
        )}
      </Box>
    </Box>
  );

  if (lgUp) {
    return (
      <Drawer
        anchor="left"
        open
        PaperProps={{
          sx: {
            backgroundColor: 'neutral.900',
            color: '#FFFFFF',
            width: 280,
          },
        }}
        variant="permanent"
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor="left"
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          backgroundColor: 'neutral.900',
          color: '#FFFFFF',
        },
      }}
      sx={{ zIndex: (theme) => theme.zIndex.appBar + 100 }}
      variant="temporary"
    >
      {content}
    </Drawer>
  );
};

DashboardSidebar.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
