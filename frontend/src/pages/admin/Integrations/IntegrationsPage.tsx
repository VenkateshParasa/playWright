import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Sync as SyncIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Cable as CableIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface Integration {
  id: string;
  name: string;
  enabled: boolean;
  configured: boolean;
  type: string;
  description?: string;
  icon?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`integration-tabpanel-${index}`}
      aria-labelledby={`integration-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const IntegrationsPage: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [configDialog, setConfigDialog] = useState<{
    open: boolean;
    integration?: Integration;
  }>({ open: false });
  const [testingConnection, setTestingConnection] = useState(false);
  const [syncingData, setSyncingData] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/integrations');
      setIntegrations(response.data.data);
    } catch (error) {
      showAlert('error', 'Failed to fetch integrations');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleIntegration = async (
    integrationId: string,
    enabled: boolean
  ) => {
    try {
      await axios.post(`/api/integrations/${integrationId}/toggle`, { enabled });
      setIntegrations(prev =>
        prev.map(int =>
          int.id === integrationId ? { ...int, enabled } : int
        )
      );
      showAlert('success', `Integration ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      showAlert('error', 'Failed to toggle integration');
    }
  };

  const handleConfigureIntegration = (integration: Integration) => {
    setConfigDialog({ open: true, integration });
  };

  const handleCloseConfigDialog = () => {
    setConfigDialog({ open: false });
  };

  const handleSaveConfiguration = async (settings: any) => {
    if (!configDialog.integration) return;

    try {
      await axios.post(
        `/api/integrations/${configDialog.integration.id}/configure`,
        settings
      );
      showAlert('success', 'Integration configured successfully');
      handleCloseConfigDialog();
      fetchIntegrations();
    } catch (error) {
      showAlert('error', 'Failed to configure integration');
    }
  };

  const handleTestConnection = async (integrationId: string, settings: any) => {
    try {
      setTestingConnection(true);
      const response = await axios.post(
        `/api/integrations/${integrationId}/test`,
        settings
      );

      if (response.data.success) {
        showAlert('success', 'Connection test successful');
      } else {
        showAlert('error', response.data.message || 'Connection test failed');
      }
    } catch (error) {
      showAlert('error', 'Connection test failed');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSyncData = async (integrationId: string) => {
    try {
      setSyncingData(integrationId);
      const response = await axios.post(`/api/integrations/${integrationId}/sync`, {
        action: 'sync_users',
      });
      showAlert('success', `Sync job queued: ${response.data.data.jobId}`);
    } catch (error) {
      showAlert('error', 'Failed to trigger sync');
    } finally {
      setSyncingData(null);
    }
  };

  const showAlert = (type: 'success' | 'error' | 'info', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const filterIntegrationsByType = (type: string) => {
    return integrations.filter(int => int.type === type);
  };

  const getIntegrationIcon = (integration: Integration) => {
    switch (integration.type) {
      case 'crm':
        return '💼';
      case 'hr':
        return '👥';
      case 'productivity':
        return '📊';
      case 'payment':
        return '💳';
      default:
        return '🔗';
    }
  };

  const renderIntegrationCard = (integration: Integration) => (
    <Grid item xs={12} sm={6} md={4} key={integration.id}>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" component="div">
              <span style={{ marginRight: '8px' }}>
                {getIntegrationIcon(integration)}
              </span>
              {integration.name}
            </Typography>
            <Chip
              label={integration.configured ? 'Configured' : 'Not Configured'}
              color={integration.configured ? 'success' : 'default'}
              size="small"
            />
          </Box>

          <Typography variant="body2" color="text.secondary" mb={2}>
            {integration.description || `Integrate with ${integration.name}`}
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={integration.enabled}
                onChange={(e) =>
                  handleToggleIntegration(integration.id, e.target.checked)
                }
                disabled={!integration.configured}
              />
            }
            label={integration.enabled ? 'Enabled' : 'Disabled'}
          />
        </CardContent>

        <CardActions>
          <Button
            size="small"
            startIcon={<SettingsIcon />}
            onClick={() => handleConfigureIntegration(integration)}
          >
            Configure
          </Button>

          {integration.configured && (
            <Button
              size="small"
              startIcon={
                syncingData === integration.id ? (
                  <CircularProgress size={16} />
                ) : (
                  <SyncIcon />
                )
              }
              onClick={() => handleSyncData(integration.id)}
              disabled={!integration.enabled || syncingData === integration.id}
            >
              Sync
            </Button>
          )}
        </CardActions>
      </Card>
    </Grid>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box py={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Enterprise Integrations
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph>
          Connect your learning platform with enterprise systems for seamless data flow
        </Typography>

        {alert && (
          <Alert
            severity={alert.type}
            onClose={() => setAlert(null)}
            sx={{ mb: 3 }}
          >
            {alert.message}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={selectedTab} onChange={(e, val) => setSelectedTab(val)}>
            <Tab label="All Integrations" />
            <Tab label="CRM Systems" />
            <Tab label="HR/LMS" />
            <Tab label="Productivity" />
            <Tab label="Payments" />
          </Tabs>
        </Box>

        <TabPanel value={selectedTab} index={0}>
          <Grid container spacing={3}>
            {integrations.map(renderIntegrationCard)}
          </Grid>
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          <Grid container spacing={3}>
            {filterIntegrationsByType('crm').map(renderIntegrationCard)}
          </Grid>
        </TabPanel>

        <TabPanel value={selectedTab} index={2}>
          <Grid container spacing={3}>
            {filterIntegrationsByType('hr').map(renderIntegrationCard)}
          </Grid>
        </TabPanel>

        <TabPanel value={selectedTab} index={3}>
          <Grid container spacing={3}>
            {filterIntegrationsByType('productivity').map(renderIntegrationCard)}
          </Grid>
        </TabPanel>

        <TabPanel value={selectedTab} index={4}>
          <Grid container spacing={3}>
            {filterIntegrationsByType('payment').map(renderIntegrationCard)}
          </Grid>
        </TabPanel>

        {/* Configuration Dialog */}
        <ConfigurationDialog
          open={configDialog.open}
          integration={configDialog.integration}
          onClose={handleCloseConfigDialog}
          onSave={handleSaveConfiguration}
          onTest={handleTestConnection}
          testing={testingConnection}
        />
      </Box>
    </Container>
  );
};

interface ConfigurationDialogProps {
  open: boolean;
  integration?: Integration;
  onClose: () => void;
  onSave: (settings: any) => void;
  onTest: (integrationId: string, settings: any) => void;
  testing: boolean;
}

const ConfigurationDialog: React.FC<ConfigurationDialogProps> = ({
  open,
  integration,
  onClose,
  onSave,
  onTest,
  testing,
}) => {
  const [settings, setSettings] = useState<any>({});

  const handleChange = (field: string, value: string) => {
    setSettings((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(settings);
  };

  const handleTest = () => {
    if (integration) {
      onTest(integration.id, settings);
    }
  };

  const renderConfigFields = () => {
    if (!integration) return null;

    // Different fields based on integration type
    const fields: Record<string, Array<{ label: string; field: string; type?: string }>> = {
      salesforce: [
        { label: 'Client ID', field: 'clientId' },
        { label: 'Client Secret', field: 'clientSecret', type: 'password' },
        { label: 'Username', field: 'username' },
        { label: 'Password', field: 'password', type: 'password' },
        { label: 'Security Token', field: 'securityToken', type: 'password' },
      ],
      hubspot: [
        { label: 'API Key', field: 'apiKey', type: 'password' },
      ],
      stripe: [
        { label: 'API Key', field: 'apiKey', type: 'password' },
        { label: 'Webhook Secret', field: 'webhookSecret', type: 'password' },
      ],
    };

    const integrationFields = fields[integration.id] || [
      { label: 'API Key', field: 'apiKey', type: 'password' },
    ];

    return integrationFields.map(({ label, field, type }) => (
      <TextField
        key={field}
        fullWidth
        label={label}
        type={type || 'text'}
        value={settings[field] || ''}
        onChange={(e) => handleChange(field, e.target.value)}
        margin="normal"
      />
    ));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Configure {integration?.name}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {renderConfigFields()}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleTest}
          startIcon={testing ? <CircularProgress size={16} /> : <CableIcon />}
          disabled={testing}
        >
          Test Connection
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IntegrationsPage;
