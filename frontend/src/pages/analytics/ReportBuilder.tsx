import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Play, Save, Share2, Download, Copy, Trash2 } from 'lucide-react';

interface Report {
  id: string;
  name: string;
  description: string;
  category: string;
  dataSource: string;
  visualization: any;
  lastGenerated?: Date;
}

export default function ReportBuilder() {
  const [reports, setReports] = useState<Report[]>([]);
  const [templates, setTemplates] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [isBuilding, setIsBuilding] = useState(false);

  const [reportConfig, setReportConfig] = useState({
    name: '',
    description: '',
    category: 'user',
    dataSource: 'users',
    dateRange: { type: 'relative', relativeDays: 30 },
    filters: [],
    metrics: [],
    dimensions: [],
    visualization: { type: 'bar', config: {} },
  });

  useEffect(() => {
    fetchReports();
    fetchTemplates();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports');
      const data = await response.json();
      setReports(data.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/reports/templates');
      const data = await response.json();
      setTemplates(data.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const executeReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/execute`);
      const data = await response.json();
      setReportData(data.data);
    } catch (error) {
      console.error('Error executing report:', error);
    }
  };

  const saveReport = async () => {
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportConfig),
      });
      const data = await response.json();
      setReports([...reports, data.data]);
      alert('Report saved successfully!');
    } catch (error) {
      console.error('Error saving report:', error);
    }
  };

  const exportReport = async (format: string) => {
    if (!selectedReport) return;
    try {
      const response = await fetch(
        `/api/reports/${selectedReport.id}/export?format=${format}`
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${selectedReport.id}.${format}`;
      a.click();
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const cloneReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `Copy of ${selectedReport?.name}` }),
      });
      const data = await response.json();
      setReports([...reports, data.data]);
    } catch (error) {
      console.error('Error cloning report:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Custom Report Builder</h1>
          <p className="text-gray-500 mt-1">Create and manage custom analytics reports</p>
        </div>
        <Button onClick={() => setIsBuilding(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Report
        </Button>
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">My Reports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="builder">Report Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                    </div>
                    <Badge>{report.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Data Source:</span>
                      <span className="font-medium">{report.dataSource}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Chart Type:</span>
                      <span className="font-medium">{report.visualization.type}</span>
                    </div>
                    {report.lastGenerated && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Last Run:</span>
                        <span className="font-medium">
                          {new Date(report.lastGenerated).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedReport(report);
                        executeReport(report.id);
                      }}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Run
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => cloneReport(report.id)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Clone
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportReport('csv')}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    onClick={() => cloneReport(template.id)}
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="builder" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Build Custom Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Report Name</label>
                    <Input
                      placeholder="My Custom Report"
                      value={reportConfig.name}
                      onChange={(e) =>
                        setReportConfig({ ...reportConfig, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select
                      value={reportConfig.category}
                      onValueChange={(value) =>
                        setReportConfig({ ...reportConfig, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="content">Content</SelectItem>
                        <SelectItem value="engagement">Engagement</SelectItem>
                        <SelectItem value="progress">Progress</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    placeholder="Report description..."
                    value={reportConfig.description}
                    onChange={(e) =>
                      setReportConfig({ ...reportConfig, description: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Data Source */}
              <div className="space-y-4">
                <h3 className="font-semibold">Data Source</h3>
                <Select
                  value={reportConfig.dataSource}
                  onValueChange={(value) =>
                    setReportConfig({ ...reportConfig, dataSource: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="users">Users</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                    <SelectItem value="flashcards">Flashcards</SelectItem>
                    <SelectItem value="combined">Combined</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Visualization */}
              <div className="space-y-4">
                <h3 className="font-semibold">Visualization</h3>
                <Select
                  value={reportConfig.visualization.type}
                  onValueChange={(value) =>
                    setReportConfig({
                      ...reportConfig,
                      visualization: { ...reportConfig.visualization, type: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                    <SelectItem value="table">Table</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button onClick={saveReport} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Report
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    /* Preview logic */
                  }}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Results Modal */}
      {reportData && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Report Results</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => exportReport('csv')}>
                  Export CSV
                </Button>
                <Button size="sm" variant="outline" onClick={() => exportReport('excel')}>
                  Export Excel
                </Button>
                <Button size="sm" variant="outline" onClick={() => exportReport('pdf')}>
                  Export PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {reportData.data.length > 0 &&
                      Object.keys(reportData.data[0]).map((key) => (
                        <th key={key} className="text-left p-2">
                          {key}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.data.slice(0, 50).map((row: any, index: number) => (
                    <tr key={index} className="border-b">
                      {Object.values(row).map((value: any, i: number) => (
                        <td key={i} className="p-2">
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Showing {Math.min(50, reportData.data.length)} of {reportData.metadata.rowCount}{' '}
              rows
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
