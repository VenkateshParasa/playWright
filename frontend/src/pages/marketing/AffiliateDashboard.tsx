import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  LinearProgress,
  Tab,
  Tabs,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Link as LinkIcon,
  People as PeopleIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;
  return <div hidden={value !== index}>{value === index && <Box sx={{ p: 3 }}>{children}</Box>}</div>;
}

export const AffiliateDashboard: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [affiliateData, setAffiliateData] = useState({
    affiliateCode: 'AFF12345',
    affiliateUrl: 'https://platform.com/ref/AFF12345',
    status: 'active',
    totalClicks: 1250,
    totalConversions: 85,
    conversionRate: 6.8,
    totalRevenue: 12750,
    totalCommissionEarned: 2550,
    pendingCommission: 850,
    totalCommissionPaid: 1700,
  });

  const [showCreateLinkDialog, setShowCreateLinkDialog] = useState(false);
  const [newLinkData, setNewLinkData] = useState({ name: '', url: '' });

  const [links, setLinks] = useState([
    {
      id: '1',
      name: 'Main Landing Page',
      trackingCode: 'AFF12345-001',
      clicks: 450,
      conversions: 30,
      revenue: 4500,
    },
    {
      id: '2',
      name: 'Playwright Course',
      trackingCode: 'AFF12345-002',
      clicks: 380,
      conversions: 25,
      revenue: 3750,
    },
  ]);

  const [commissions, setCommissions] = useState([
    {
      id: '1',
      date: '2024-02-15',
      orderId: 'ORD-001',
      amount: 150,
      commissionAmount: 30,
      status: 'paid',
    },
    {
      id: '2',
      date: '2024-02-14',
      orderId: 'ORD-002',
      amount: 200,
      commissionAmount: 40,
      status: 'approved',
    },
    {
      id: '3',
      date: '2024-02-13',
      orderId: 'ORD-003',
      amount: 175,
      commissionAmount: 35,
      status: 'pending',
    },
  ]);

  const performanceData = [
    { month: 'Jan', clicks: 300, conversions: 20, revenue: 3000 },
    { month: 'Feb', clicks: 450, conversions: 30, revenue: 4500 },
    { month: 'Mar', clicks: 520, conversions: 35, revenue: 5250 },
    { month: 'Apr', clicks: 480, conversions: 32, revenue: 4800 },
  ];

  const trafficSourceData = [
    { name: 'Social Media', value: 35 },
    { name: 'Blog Posts', value: 30 },
    { name: 'Email', value: 20 },
    { name: 'Direct', value: 15 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    // Show success message
  };

  const handleCreateLink = async () => {
    // TODO: Create link via API
    console.log('Creating link:', newLinkData);
    setShowCreateLinkDialog(false);
    setNewLinkData({ name: '', url: '' });
  };

  const handleRequestPayout = () => {
    // TODO: Request payout
    console.log('Requesting payout');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'info';
      case 'paid':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Affiliate Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label={`Status: ${affiliateData.status}`}
            color="success"
            size="small"
          />
          <Typography variant="body2" color="textSecondary">
            Affiliate Code: {affiliateData.affiliateCode}
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Clicks
                  </Typography>
                  <Typography variant="h4">{affiliateData.totalClicks}</Typography>
                  <Typography variant="body2" color="success.main">
                    +125 this month
                  </Typography>
                </Box>
                <LinkIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Conversions
                  </Typography>
                  <Typography variant="h4">{affiliateData.totalConversions}</Typography>
                  <Typography variant="body2" color="success.main">
                    {affiliateData.conversionRate}% rate
                  </Typography>
                </Box>
                <TrendingUpIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Pending Commission
                  </Typography>
                  <Typography variant="h4">${affiliateData.pendingCommission}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    ${affiliateData.totalCommissionPaid} paid
                  </Typography>
                </Box>
                <MoneyIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4">${affiliateData.totalRevenue}</Typography>
                  <Typography variant="body2" color="success.main">
                    +18% from last month
                  </Typography>
                </Box>
                <MoneyIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Affiliate Link Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Your Affiliate Link
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              fullWidth
              value={affiliateData.affiliateUrl}
              InputProps={{ readOnly: true }}
            />
            <Tooltip title="Copy Link">
              <IconButton onClick={() => handleCopyLink(affiliateData.affiliateUrl)}>
                <CopyIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share">
              <IconButton>
                <ShareIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setShowCreateLinkDialog(true)}
            >
              Create Custom Link
            </Button>
            <Button variant="outlined" sx={{ ml: 1 }}>
              Download Marketing Materials
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)}>
          <Tab label="Performance" />
          <Tab label="Links" />
          <Tab label="Commissions" />
          <Tab label="Payouts" />
        </Tabs>
      </Box>

      {/* Performance Tab */}
      <TabPanel value={currentTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Trends
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="clicks" stroke="#8884d8" />
                    <Line type="monotone" dataKey="conversions" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Traffic Sources
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={trafficSourceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.name}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {trafficSourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Revenue by Month
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Links Tab */}
      <TabPanel value={currentTab} index={1}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Link Name</TableCell>
                <TableCell>Tracking Code</TableCell>
                <TableCell align="right">Clicks</TableCell>
                <TableCell align="right">Conversions</TableCell>
                <TableCell align="right">Revenue</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>{link.name}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {link.trackingCode}
                      <Tooltip title="Copy Link">
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleCopyLink(`${affiliateData.affiliateUrl}?ref=${link.trackingCode}`)
                          }
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell align="right">{link.clicks}</TableCell>
                  <TableCell align="right">{link.conversions}</TableCell>
                  <TableCell align="right">${link.revenue}</TableCell>
                  <TableCell align="right">
                    <Button size="small">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Commissions Tab */}
      <TabPanel value={currentTab} index={2}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Order ID</TableCell>
                <TableCell align="right">Order Amount</TableCell>
                <TableCell align="right">Commission</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {commissions.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell>{new Date(commission.date).toLocaleDateString()}</TableCell>
                  <TableCell>{commission.orderId}</TableCell>
                  <TableCell align="right">${commission.amount}</TableCell>
                  <TableCell align="right">${commission.commissionAmount}</TableCell>
                  <TableCell>
                    <Chip
                      label={commission.status}
                      size="small"
                      color={getStatusColor(commission.status) as any}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Payouts Tab */}
      <TabPanel value={currentTab} index={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6">Pending Balance</Typography>
                <Typography variant="h3" color="primary">
                  ${affiliateData.pendingCommission}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Minimum payout: $50
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="large"
                onClick={handleRequestPayout}
                disabled={affiliateData.pendingCommission < 50}
              >
                Request Payout
              </Button>
            </Box>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Payouts are processed on the 1st and 15th of each month. Payment method: PayPal
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Create Link Dialog */}
      <Dialog
        open={showCreateLinkDialog}
        onClose={() => setShowCreateLinkDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Custom Affiliate Link</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Link Name"
            value={newLinkData.name}
            onChange={(e) => setNewLinkData({ ...newLinkData, name: e.target.value })}
            margin="normal"
            helperText="Give this link a descriptive name for tracking"
          />
          <TextField
            fullWidth
            label="Target URL"
            value={newLinkData.url}
            onChange={(e) => setNewLinkData({ ...newLinkData, url: e.target.value })}
            margin="normal"
            helperText="The page you want to link to"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateLinkDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateLink}>
            Create Link
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AffiliateDashboard;
