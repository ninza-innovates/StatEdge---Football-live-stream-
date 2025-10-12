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
      // First test the API connection
      console.log('Testing API connection...');
      const testResponse = await fetch(
        'https://fsoczxlarrlecnbwghdz.supabase.co/functions/v1/test-api-connection',
        { method: 'POST' }
      );
      
      const testData = await testResponse.json();
      console.log('API test result:', testData);
      
      if (!testData.success) {
        toast({
          title: "API Connection Failed",
          description: `Status ${testData.status}: Check your RAPIDAPI_KEY in Supabase secrets`,
          variant: "destructive",
        });
        return;
      }
      
      // If test passes, run the sync
      const response = await fetch(
        'https://fsoczxlarrlecnbwghdz.supabase.co/functions/v1/sync-football-data',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Sync failed');
      }

      const data = await response.json();
      
      toast({
        title: "Sync Successful!",
        description: `Synced ${data.synced?.fixtures || 0} fixtures, ${data.synced?.standings || 0} standings, ${data.synced?.topScorers || 0} scorers`,
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
