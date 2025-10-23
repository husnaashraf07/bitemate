import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, RefreshCw, Droplets, Dumbbell, Brain, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface HealthTip {
  category: string;
  icon: React.ReactNode;
  tips: string[];
}

const HealthTips = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [healthTips, setHealthTips] = useState<HealthTip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHealthTips = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-health-tips');
      
      if (error) throw error;

      const iconMap: { [key: string]: React.ReactNode } = {
        "Water Intake": <Droplets className="h-6 w-6 text-blue-500" />,
        "Exercise": <Dumbbell className="h-6 w-6 text-orange-500" />,
        "Mindful Eating": <Brain className="h-6 w-6 text-purple-500" />,
      };

      const tipsWithIcons = data.tips.map((tip: any) => ({
        ...tip,
        icon: iconMap[tip.category] || <Brain className="h-6 w-6 text-primary" />
      }));

      setHealthTips(tipsWithIcons);
    } catch (error) {
      console.error('Error fetching health tips:', error);
      toast({
        title: "Error",
        description: "Failed to load health tips. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealthTips();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchHealthTips();
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
          <Button 
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Tips
          </Button>
        </div>

        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold mb-3">
            Daily Health Tips
          </h1>
          <p className="text-xl text-muted-foreground">
            Simple habits for a healthier lifestyle
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {healthTips.map((tipCategory, index) => (
              <Card 
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  {tipCategory.icon}
                  <h3 className="text-2xl font-semibold">{tipCategory.category}</h3>
                </div>
                <ul className="space-y-3">
                  {tipCategory.tips.map((tip, tipIndex) => (
                    <li 
                      key={tipIndex}
                      className="flex items-start gap-3 text-muted-foreground"
                    >
                      <span className="text-primary font-bold mt-1">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-12 p-8 bg-gradient-to-r from-primary/10 to-primary-glow/10 rounded-lg text-center animate-scale-in">
          <h3 className="text-2xl font-bold mb-3">Remember</h3>
          <p className="text-lg text-muted-foreground">
            Small consistent changes lead to big results. You've got this! 💪
          </p>
        </div>
      </div>
    </div>
  );
};

export default HealthTips;
