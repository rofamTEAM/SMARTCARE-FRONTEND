import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Upload, User } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileEditProps {
  open: boolean;
  onClose: () => void;
  session: any;
}

export function ProfileEdit({ open, onClose, session }: ProfileEditProps) {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setLoading(true);
    try {
      // Simulate upload (replace with actual upload logic)
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Profile picture uploaded successfully!');
      onClose();
    } catch (error: any) {
      toast.error('Failed to upload profile picture');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="size-5" />
            Profile Picture
          </DialogTitle>
          <DialogDescription>
            Upload a new profile picture
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current/Preview Image */}
          <div className="flex justify-center">
            <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <User className="size-16 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="profilePicture">Choose Profile Picture</Label>
            <div className="flex items-center gap-2">
              <input
                id="profilePicture"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('profilePicture')?.click()}
                className="flex-1"
              >
                <Upload className="size-4 mr-2" />
                {selectedFile ? selectedFile.name : 'Select Image'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Max file size: 5MB. Supported formats: JPG, PNG, GIF</p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={loading || !selectedFile}>
              {loading ? 'Uploading...' : 'Upload Picture'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

