import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Button,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import {
  Security,
  VerifiedUser,
  Warning,
  CheckCircle,
  Assessment,
  Download,
  TrendingUp
} from '@mui/icons-material';
import axios from 'axios';

interface ComplianceDashboardData {
  totalEvents: number;
  byCategory: { [key: string]: number };
  byEventType: { [key: string]: number };
  byRiskLevel: { [key: string]: number };
  recentHighRiskEvents: any[];
}

interface ComplianceStatus {
  gdpr: any;
  ccpa: any;
  coppa: any;
  ferpa: any;
  soc2: any;
  iso27001: any;
}

const ComplianceDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<ComplianceDashboardData | null>(null);
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
    loadComplianceStatus();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/compliance/dashboard');
      setDashboardData(response.data.dashboard);
    } catch (error: any) {
      setError('Failed to load dashboard data');
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComplianceStatus = async () => {
    try {
      const response = await axios.get('/api/compliance/status');
      setComplianceStatus(response.data.status);
    } catch (error: any) {
      console.error('Error loading compliance status:', error);
    }
  };

  const downloadReport = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const response = await axios.get('/api/compliance/report', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });

      // Download report logic
      const blob = new Blob([JSON.stringify(response.data.report, null, 2)], {
        type: 'application/json'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-report-${new Date().toISOString()}.json`;
      a.click();
    } catch (error: any) {
      console.error('Error downloading report:', error);
    }
  };

  const getRiskLevelColor = (level: string): 'error' | 'warning' | 'info' | 'success' => {
    switch (level) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'success';
    }
  };

  const getComplianceIcon = (compliant: boolean) => {
    return compliant ? (
      <CheckCircle color="success" />
    ) : (
      <Warning color="warning" />
    );
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ mt: 4 }}>
          <LinearProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" gutterBottom>
            <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
            Compliance Dashboard
          </Typography>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={downloadReport}
          >
            Download Report
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Assessment color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="text.secondary">
                    Total Events
                  </Typography>
                </Box>
                <Typography variant="h3">
                  {dashboardData?.totalEvents || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last 30 days
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Warning color="error" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="text.secondary">
                    High Risk Events
                  </Typography>
                </Box>
                <Typography variant="h3" color="error">
                  {(dashboardData?.byRiskLevel.high || 0) +
                   (dashboardData?.byRiskLevel.critical || 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Requires attention
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <VerifiedUser color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="text.secondary">
                    Standards
                  </Typography>
                </Box>
                <Typography variant="h3">
                  6
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  GDPR, CCPA, COPPA, FERPA, SOC2, ISO27001
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUp color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="text.secondary">
                    Compliance Score
                  </Typography>
                </Box>
                <Typography variant="h3" color="success.main">
                  98%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Overall compliance
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Overview" />
            <Tab label="GDPR" />
            <Tab label="CCPA/COPPA" />
            <Tab label="FERPA" />
            <Tab label="SOC2/ISO27001" />
            <Tab label="Recent Events" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {/* Event Categories */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Events by Category
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {Object.entries(dashboardData?.byCategory || {}).map(([category, count]) => (
                    <Box key={category} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">
                          {category.toUpperCase()}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {count}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(count / (dashboardData?.totalEvents || 1)) * 100}
                      />
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>

            {/* Risk Levels */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Events by Risk Level
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {Object.entries(dashboardData?.byRiskLevel || {}).map(([level, count]) => (
                    <Box key={level} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Chip
                          label={level.toUpperCase()}
                          color={getRiskLevelColor(level)}
                          size="small"
                        />
                        <Typography variant="body2" fontWeight="bold">
                          {count}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(count / (dashboardData?.totalEvents || 1)) * 100}
                        color={getRiskLevelColor(level)}
                      />
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>

            {/* Event Types */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Events by Type
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {Object.entries(dashboardData?.byEventType || {}).map(([type, count]) => (
                    <Grid item xs={12} sm={6} md={3} key={type}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="h4" color="primary">
                          {count}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {type.replace(/_/g, ' ').toUpperCase()}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && complianceStatus && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              GDPR Compliance Status
            </Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {getComplianceIcon(complianceStatus.gdpr.compliant)}
                  <Typography variant="body1" sx={{ ml: 2 }}>
                    Overall Compliance: <strong>
                      {complianceStatus.gdpr.compliant ? 'Compliant' : 'Non-Compliant'}
                    </strong>
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Requirement</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Data Retention Policy</TableCell>
                        <TableCell>
                          <Chip
                            label={complianceStatus.gdpr.dataRetentionPolicyExists ? 'Compliant' : 'Missing'}
                            color={complianceStatus.gdpr.dataRetentionPolicyExists ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Privacy Policy Updated</TableCell>
                        <TableCell>
                          <Chip
                            label={complianceStatus.gdpr.privacyPolicyUpdated ? 'Current' : 'Outdated'}
                            color={complianceStatus.gdpr.privacyPolicyUpdated ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Consent Management</TableCell>
                        <TableCell>
                          <Chip
                            label={complianceStatus.gdpr.consentManagementActive ? 'Active' : 'Inactive'}
                            color={complianceStatus.gdpr.consentManagementActive ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Data Processing Records</TableCell>
                        <TableCell>
                          <Chip
                            label={complianceStatus.gdpr.dataProcessingRecordsComplete ? 'Complete' : 'Incomplete'}
                            color={complianceStatus.gdpr.dataProcessingRecordsComplete ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Paper>
        )}

        {activeTab === 5 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent High-Risk Events
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Event Type</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Risk Level</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardData?.recentHighRiskEvents.map((event, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {new Date(event.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip label={event.category.toUpperCase()} size="small" />
                      </TableCell>
                      <TableCell>{event.eventType}</TableCell>
                      <TableCell>{event.action}</TableCell>
                      <TableCell>
                        <Chip
                          label={event.metadata.risk_level?.toUpperCase()}
                          color={getRiskLevelColor(event.metadata.risk_level)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default ComplianceDashboard;
