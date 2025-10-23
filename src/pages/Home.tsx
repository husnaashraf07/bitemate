import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Utensils, Target, Sparkles } from "lucide-react";
import heroFood from "@/assets/hero-food.jpg";

const Home = () => {
  const navigate = useNavigate();

  const steps = [
    {
      icon: <Utensils className="w-8 h-8" />,
      title: "Input Your Details",
      description: "Share your measurements, goals, and preferences"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "AI Creates Your Plan",
      description: "Get a personalized meal plan tailored just for you"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Live Healthy",
      description: "Follow your plan and achieve your fitness goals"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${heroFood})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Plan Your Perfect Diet with AI
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Personalized meal plans designed for your body, goals, and lifestyle
            </p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => navigate('/diet-form')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            How It Works
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Three simple steps to transform your diet and reach your health goals
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <Card 
                key={index}
                className="p-8 text-center hover:shadow-lg transition-all duration-300 animate-slide-up border-2 hover:border-primary"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-glow">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands who've transformed their health with personalized nutrition
          </p>
          <Button 
            size="lg"
            variant="secondary"
            className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            onClick={() => navigate('/diet-form')}
          >
            Create My Meal Plan
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
