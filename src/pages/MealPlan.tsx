import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Coffee, Sun, Apple, Moon, RefreshCw, Home } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Meal {
  name: string;
  ingredients: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

interface MealPlanData {
  breakfast: Meal;
  lunch: Meal;
  snacks: Meal;
  dinner: Meal;
  totalNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

const MealPlan = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [mealPlan, setMealPlan] = useState<MealPlanData>(location.state?.mealPlan);
  const userName = location.state?.userName;

  if (!mealPlan || !userName) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">No Meal Plan Found</h2>
          <p className="text-muted-foreground mb-6">Please fill out the form first</p>
          <Button onClick={() => navigate('/diet-form')}>Go to Form</Button>
        </Card>
      </div>
    );
  }

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-meal-plan', {
        body: location.state
      });

      if (error) throw error;

      setMealPlan(data.mealPlan);
      toast({
        title: "Success!",
        description: "Generated a new meal plan for you",
      });
    } catch (error) {
      console.error('Error regenerating meal plan:', error);
      toast({
        title: "Error",
        description: "Failed to generate new plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const mealSections = [
    { icon: Coffee, title: "Breakfast", data: mealPlan.breakfast, color: "text-orange-500" },
    { icon: Sun, title: "Lunch", data: mealPlan.lunch, color: "text-yellow-500" },
    { icon: Apple, title: "Snacks", data: mealPlan.snacks, color: "text-green-500" },
    { icon: Moon, title: "Dinner", data: mealPlan.dinner, color: "text-blue-500" },
  ];

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
            onClick={handleRegenerate}
            disabled={isRegenerating}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            Regenerate Plan
          </Button>
        </div>

        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold mb-3">
            Your Personalized Meal Plan
          </h1>
          <p className="text-xl text-muted-foreground">
            Hello {userName}! Here's your daily nutrition guide
          </p>
          <p className="text-primary font-semibold mt-2">
            Eat well, live better! 🌱
          </p>
        </div>

        {/* Daily Nutrition Summary */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-primary/5 to-primary-glow/5 animate-scale-in">
          <h3 className="text-xl font-semibold mb-4 text-center">Daily Nutrition Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{mealPlan.totalNutrition.calories}</p>
              <p className="text-sm text-muted-foreground">Calories</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{mealPlan.totalNutrition.protein}g</p>
              <p className="text-sm text-muted-foreground">Protein</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{mealPlan.totalNutrition.carbs}g</p>
              <p className="text-sm text-muted-foreground">Carbs</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{mealPlan.totalNutrition.fats}g</p>
              <p className="text-sm text-muted-foreground">Fats</p>
            </div>
          </div>
        </Card>

        {/* Meal Sections */}
        <div className="space-y-6">
          {mealSections.map((section, index) => (
            <Card 
              key={section.title} 
              className="p-6 hover:shadow-lg transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <section.icon className={`h-6 w-6 ${section.color}`} />
                <h3 className="text-2xl font-semibold">{section.title}</h3>
              </div>
              
              <h4 className="text-lg font-medium mb-3">{section.data.name}</h4>
              
              <div className="mb-4">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Ingredients:</p>
                <ul className="list-disc list-inside space-y-1">
                  {section.data.ingredients.map((ingredient, i) => (
                    <li key={i} className="text-muted-foreground">{ingredient}</li>
                  ))}
                </ul>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-primary">{section.data.nutrition.calories}</p>
                  <p className="text-xs text-muted-foreground">cal</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-primary">{section.data.nutrition.protein}g</p>
                  <p className="text-xs text-muted-foreground">protein</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-primary">{section.data.nutrition.carbs}g</p>
                  <p className="text-xs text-muted-foreground">carbs</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-primary">{section.data.nutrition.fats}g</p>
                  <p className="text-xs text-muted-foreground">fats</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button 
            size="lg"
            onClick={() => navigate('/health-tips')}
            className="bg-gradient-to-r from-secondary to-secondary/80 hover:opacity-90"
          >
            View Health Tips
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MealPlan;
