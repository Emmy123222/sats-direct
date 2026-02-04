import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WaitlistService, WaitlistEntry } from "@/utils/waitlistService";
import { Users, Download, Calendar, TrendingUp, Mail } from "lucide-react";
import EmailConfig from "./EmailConfig";

const WaitlistAdmin = () => {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [stats, setStats] = useState({ total: 0, today: 0, thisWeek: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const waitlistEntries = WaitlistService.exportWaitlist();
    const waitlistStats = WaitlistService.getWaitlistStats();
    
    setEntries(waitlistEntries);
    setStats(waitlistStats);
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Email', 'Date', 'Source', 'Referrer'].join(','),
      ...entries.map(entry => [
        entry.email,
        new Date(entry.timestamp).toLocaleDateString(),
        entry.source,
        entry.referrer || 'direct'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `satsgate-waitlist-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'landing_page': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'newsletter_signup': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'unknown': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display">Waitlist Admin</h1>
          <p className="text-muted-foreground">Manage waitlist signups and email configuration</p>
        </div>
        <Button onClick={exportToCSV} disabled={entries.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="email">Email Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Total Signups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.today}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.thisWeek}</div>
              </CardContent>
            </Card>
          </div>

          {/* Entries List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Signups</CardTitle>
              <CardDescription>
                Latest waitlist entries with source tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              {entries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No waitlist entries yet
                </div>
              ) : (
                <div className="space-y-4">
                  {entries
                    .filter(entry => entry && entry.email) // Filter out invalid entries
                    .sort((a, b) => {
                      const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                      const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                      return dateB - dateA;
                    })
                    .slice(0, 50) // Show latest 50
                    .map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{entry.email || 'Unknown email'}</div>
                          <div className="text-sm text-muted-foreground">
                            {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'Unknown date'}
                          </div>
                          {entry.referrer && entry.referrer !== 'direct' && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Referred from: {entry.referrer}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getSourceColor(entry.source || 'unknown')}>
                            {(entry.source || 'unknown').replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <EmailConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WaitlistAdmin;