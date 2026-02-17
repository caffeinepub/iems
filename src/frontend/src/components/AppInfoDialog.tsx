import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Info, Copy, Check, Download, Smartphone, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { usePwaInstallPrompt } from '../hooks/usePwaInstallPrompt';

export default function AppInfoDialog() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { canInstall, isInstalled, promptInstall } = usePwaInstallPrompt();
  
  const appUrl = window.location.origin;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) {
      toast.success('App installed successfully!');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Info className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            App Information
          </DialogTitle>
          <DialogDescription>
            Share this app or install it on your device
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* App URL Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">App URL</label>
            <div className="flex gap-2">
              <Input
                value={appUrl}
                readOnly
                className="flex-1 font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyUrl}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Share this link with others to give them access to IEMS
            </p>
          </div>

          {/* Install Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              <h3 className="font-semibold">Install IEMS</h3>
            </div>

            <Alert>
              <AlertDescription>
                <strong>Note:</strong> IEMS is a web application. There is no Android APK or iOS app store download. 
                You can install it directly from your browser for an app-like experience.
              </AlertDescription>
            </Alert>

            {isInstalled && (
              <Alert className="border-green-600 bg-green-50 dark:bg-green-950">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  IEMS is already installed on this device!
                </AlertDescription>
              </Alert>
            )}

            {canInstall && !isInstalled && (
              <Button onClick={handleInstall} className="w-full" size="lg">
                <Download className="mr-2 h-4 w-4" />
                Install IEMS Now
              </Button>
            )}

            {!canInstall && !isInstalled && (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="manual-install">
                  <AccordionTrigger>Manual Installation Instructions</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Android (Chrome)</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                        <li>Tap the menu icon (three dots) in the top right</li>
                        <li>Select "Add to Home screen" or "Install app"</li>
                        <li>Confirm by tapping "Add" or "Install"</li>
                      </ol>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">iOS (Safari)</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                        <li>Tap the Share button (square with arrow)</li>
                        <li>Scroll down and tap "Add to Home Screen"</li>
                        <li>Tap "Add" in the top right corner</li>
                      </ol>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Desktop (Chrome/Edge)</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                        <li>Click the install icon in the address bar</li>
                        <li>Or go to menu → "Install IEMS"</li>
                        <li>Click "Install" in the popup</li>
                      </ol>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </div>

          {/* App Features */}
          <div className="space-y-2 pt-4 border-t">
            <h4 className="font-medium text-sm">Benefits of Installing</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>✓ Quick access from your home screen</li>
              <li>✓ Full-screen app experience</li>
              <li>✓ Offline fallback when connection is lost</li>
              <li>✓ Faster loading with cached resources</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
