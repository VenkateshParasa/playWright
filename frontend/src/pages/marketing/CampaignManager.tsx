import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tab,
  Tabs,
  LinearProgress,
  IconButton,
  Menu,
} from '@mui/material';
import {
  Add as AddIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Email as EmailIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  type: string;
  status: string;
  sent: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
  createdAt: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;
  return <div hidden={value !== index}>{value === index && <Box sx={{ p: 3 }}>{children}</Box>}</div>;
}

export const CampaignManager: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditorDialog, setShowEditorDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const [campaignData, setCampaignData] = useState({
    name: '',
    subject: '',
    type: 'regular',
    fromName: '',
    fromEmail: '',
    preheader: '',
  });

  const [emailContent, setEmailContent] = useState('');
  const [segmentType, setSegmentType] = useState('all');

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    // TODO: Fetch from API
    setCampaigns([
      {
        id: '1',
        name: 'Welcome Series',
        subject: 'Welcome to Our Platform!',
        type: 'drip',
        status: 'sent',
        sent: 1500,
        opened: 900,
        clicked: 450,
        openRate: 60,
        clickRate: 30,
        createdAt: '2024-01-15',
      },
      {
        id: '2',
        name: 'New Course Launch',
        subject: 'New Playwright Course Available',
        type: 'regular',
        status: 'scheduled',
        sent: 0,
        opened: 0,
        clicked: 0,
        openRate: 0,
        clickRate: 0,
        createdAt: '2024-02-01',
      },
    ]);
  };

  const handleCreateCampaign = () => {
    setShowCreateDialog(true);
  };

  const handleSaveCampaign = async () => {
    // TODO: Save to API
    console.log('Saving campaign:', { campaignData, emailContent });
    setShowCreateDialog(false);
    setShowEditorDialog(false);
  };

  const handleSendTest = async () => {
    // TODO: Send test email
    console.log('Sending test email');
  };

  const handleScheduleCampaign = async () => {
    // TODO: Schedule campaign
    console.log('Scheduling campaign');
  };

  const handleSendNow = async () => {
    // TODO: Send campaign now
    console.log('Sending campaign now');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'scheduled':
        return 'info';
      case 'sending':
        return 'warning';
      case 'sent':
        return 'success';
      case 'paused':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ color: [] }, { background: [] }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Email Campaigns</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateCampaign}
        >
          Create Campaign
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Sent
              </Typography>
              <Typography variant="h4">25,430</Typography>
              <Typography variant="body2" color="success.main">
                +12% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Open Rate
              </Typography>
              <Typography variant="h4">42.5%</Typography>
              <Typography variant="body2" color="success.main">
                +5% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Click Rate
              </Typography>
              <Typography variant="h4">18.3%</Typography>
              <Typography variant="body2" color="success.main">
                +3% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Campaigns
              </Typography>
              <Typography variant="h4">8</Typography>
              <Typography variant="body2" color="textSecondary">
                3 scheduled
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)}>
          <Tab label="All Campaigns" />
          <Tab label="Drafts" />
          <Tab label="Scheduled" />
          <Tab label="Sent" />
        </Tabs>
      </Box>

      {/* Campaign List */}
      <TabPanel value={currentTab} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Campaign Name</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Sent</TableCell>
                <TableCell align="right">Open Rate</TableCell>
                <TableCell align="right">Click Rate</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon color="primary" />
                      {campaign.name}
                    </Box>
                  </TableCell>
                  <TableCell>{campaign.subject}</TableCell>
                  <TableCell>
                    <Chip label={campaign.type} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={campaign.status}
                      size="small"
                      color={getStatusColor(campaign.status) as any}
                    />
                  </TableCell>
                  <TableCell align="right">{campaign.sent}</TableCell>
                  <TableCell align="right">
                    {campaign.openRate > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <LinearProgress
                          variant="determinate"
                          value={campaign.openRate}
                          sx={{ width: 50, mr: 1 }}
                        />
                        {campaign.openRate}%
                      </Box>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {campaign.clickRate > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <LinearProgress
                          variant="determinate"
                          value={campaign.clickRate}
                          sx={{ width: 50, mr: 1 }}
                        />
                        {campaign.clickRate}%
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>{new Date(campaign.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={(e) => {
                        setAnchorEl(e.currentTarget);
                        setSelectedCampaign(campaign);
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Create Campaign Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Campaign</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Campaign Name"
            value={campaignData.name}
            onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Campaign Type</InputLabel>
            <Select
              value={campaignData.type}
              onChange={(e) => setCampaignData({ ...campaignData, type: e.target.value })}
            >
              <MenuItem value="regular">Regular Campaign</MenuItem>
              <MenuItem value="drip">Drip Campaign</MenuItem>
              <MenuItem value="triggered">Triggered Email</MenuItem>
              <MenuItem value="automated">Automated</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Subject Line"
            value={campaignData.subject}
            onChange={(e) => setCampaignData({ ...campaignData, subject: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Preheader Text"
            value={campaignData.preheader}
            onChange={(e) => setCampaignData({ ...campaignData, preheader: e.target.value })}
            margin="normal"
            helperText="Optional preview text that appears after the subject line"
          />
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="From Name"
                value={campaignData.fromName}
                onChange={(e) => setCampaignData({ ...campaignData, fromName: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="From Email"
                type="email"
                value={campaignData.fromEmail}
                onChange={(e) => setCampaignData({ ...campaignData, fromEmail: e.target.value })}
              />
            </Grid>
          </Grid>
          <FormControl fullWidth margin="normal">
            <InputLabel>Audience Segment</InputLabel>
            <Select value={segmentType} onChange={(e) => setSegmentType(e.target.value)}>
              <MenuItem value="all">All Subscribers</MenuItem>
              <MenuItem value="segment">Custom Segment</MenuItem>
              <MenuItem value="list">Email List</MenuItem>
              <MenuItem value="individual">Individual Users</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              setShowCreateDialog(false);
              setShowEditorDialog(true);
            }}
          >
            Next: Edit Content
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email Editor Dialog */}
      <Dialog
        open={showEditorDialog}
        onClose={() => setShowEditorDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Edit Email Content</DialogTitle>
        <DialogContent>
          <Box sx={{ height: 400, mt: 2 }}>
            <ReactQuill
              theme="snow"
              value={emailContent}
              onChange={setEmailContent}
              modules={modules}
              style={{ height: '350px' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSendTest}>Send Test</Button>
          <Button onClick={() => setShowEditorDialog(false)}>Save Draft</Button>
          <Button variant="outlined" startIcon={<ScheduleIcon />} onClick={handleScheduleCampaign}>
            Schedule
          </Button>
          <Button variant="contained" startIcon={<SendIcon />} onClick={handleSendNow}>
            Send Now
          </Button>
        </DialogActions>
      </Dialog>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <TrendingUpIcon sx={{ mr: 1 }} /> View Analytics
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <SendIcon sx={{ mr: 1 }} /> Duplicate
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CampaignManager;
