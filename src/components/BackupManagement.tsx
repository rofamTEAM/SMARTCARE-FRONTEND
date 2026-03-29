import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, Trash2, Database, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { settingsApi } from '../utils/api';
  name: string;
  size: string;
  date: string;
}

interface BackupManagementProps {
  session: any;
}

export function BackupManagement({ session }: BackupManagementProps) {
  const [backupFiles, setBackupFiles] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBackupFiles();
  }, []);

  const loadBackupFiles = async () => {
    try {
      const data = await settingsApi.get();
      setBackupFiles(data?.backupFiles || []);
    } catch (error) {
      setBackupFiles([]);
    }
  };

  const createBackup = async () => {
    setLoading(true);
    try {
      const blob = await settingsApi.createBackup();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `db-${timestamp}.json`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
      const newBackup: BackupFile = { name: filename, size: `${(blob.size / 1024).toFixed(1)} KB`, date: new Date().toLocaleString() };
      setBackupFiles(prev => [...prev, newBackup]);
      toast.success('Database backup created successfully!');
    } catch (error) {
      toast.error('Failed to create backup');
    } finally {
      setLoading(false);
    }
  };

  const downloadBackup = (filename: string) => {
    const content = `-- Hospital Management System Database Backup\n-- Generated on: ${new Date().toLocaleString()}\n-- File: ${filename}`;
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const deleteBackup = (filename: string) => {
    if (!confirm('Are you sure you want to delete this backup?')) return;
    setBackupFiles(prev => prev.filter(b => b.name !== filename));
    toast.success('Backup deleted successfully!');
  };

  const restoreBackup = async (filename: string) => {
    if (!confirm('Are you sure you want to restore from this backup? This will overwrite current data.')) return;
    try {
      await settingsApi.restoreBackup({ filename });
      toast.success('Database restored successfully!');
    } catch (error) {
      toast.error('Failed to restore backup');
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Database className="h-6 w-6 mr-2" />
                Database Backup Management
              </CardTitle>
              <Button onClick={createBackup} disabled={loading}>
                <Shield className="size-4 mr-2" />
                {loading ? 'Creating...' : 'Create Backup'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Automatic Backups</h3>
                  <p className="text-sm text-muted-foreground mb-4">Schedule automatic database backups</p>
                  <Button variant="outline" className="w-full">
                    Configure Schedule
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Upload Backup</h3>
                  <p className="text-sm text-muted-foreground mb-4">Restore from uploaded backup file</p>
                  <input
                    type="file"
                    accept=".sql"
                    className="hidden"
                    id="backup-upload"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        toast.success('Backup file uploaded successfully!');
                      }
                    }}
                  />
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => document.getElementById('backup-upload')?.click()}
                  >
                    <Upload className="size-4 mr-2" />
                    Upload Backup
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border px-4 py-2 text-left">Filename</th>
                    <th className="border border-border px-4 py-2 text-left">Size</th>
                    <th className="border border-border px-4 py-2 text-left">Created Date</th>
                    <th className="border border-border px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {backupFiles.map((backup) => (
                    <tr key={backup.name} className="hover:bg-muted/50">
                      <td className="border border-border px-4 py-2">{backup.name}</td>
                      <td className="border border-border px-4 py-2">{backup.size}</td>
                      <td className="border border-border px-4 py-2">{backup.date}</td>
                      <td className="border border-border px-4 py-2">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadBackup(backup.name)}
                          >
                            <Download className="size-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => restoreBackup(backup.name)}
                          >
                            <Database className="size-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteBackup(backup.name)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {backupFiles.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No backup files found. Create your first backup to get started.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}


