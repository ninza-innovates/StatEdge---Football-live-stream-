import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AdminSyncButton() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSync = async () => {
    setLoading(true);
    try {
      // Use the simpler initial-data-sync function
      console.log('Starting initial data sync...');
      const response = await fetch(
        'https://fsoczxlarrlecnbwghdz.supabase.co/functions/v1/initial-data-sync',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      const data = await response.json();
      console.log('Sync response:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Sync failed');
      }
      
      toast({
        title: "Data Synced Successfully!",
        description: `Loaded ${data.data?.standings || 0} teams, ${data.data?.scorers || 0} scorers, ${data.data?.fixtures || 0} fixtures`,
      });

      // Reload the page to show new data
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={loading}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Syncing...' : 'Sync Data Now'}
    </Button>
  );
}
