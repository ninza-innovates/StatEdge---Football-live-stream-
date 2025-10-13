import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PricingModal = ({ open, onOpenChange }: PricingModalProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const STRIPE_PRICE_IDS = {
    weekly: 'price_1S5umL93V4MxVtg8ofpuszEl',
    monthly: 'price_1S5umg93V4MxVtg8OZ7fGzOi'
  };

  const handleSubscribe = async (planType: 'weekly' | 'monthly') => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    setLoading(planType);

    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: {
          priceId: STRIPE_PRICE_IDS[planType],
          successUrl: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: window.location.href
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Subscription failed",
        description: "Unable to start checkout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      name: "Weekly Pass",
      price: "$4.99",
      period: "/ 7 days",
      description: "Perfect for weekends or a quick trial.",
      features: [
        "Unlimited match insights",
        "AI Quick Summaries & Deep Dives",
        "Betting Angles for every game"
      ],
      buttonText: "Subscribe Weekly",
      popular: false,
      planType: 'weekly' as const
    },
    {
      name: "Monthly Plan",
      price: "$14.99",
      period: "/ month",
      description: "Best value. Save 50% vs weekly.",
      features: [
        "Everything in Weekly",
        "Cancel anytime",
        "Priority AI updates"
      ],
      buttonText: "Subscribe Monthly",
      popular: true,
      planType: 'monthly' as const
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl md:text-3xl font-bold text-center mb-2">
            Unlock Match Insights
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Subscribe to access AI-powered match analysis and predictions
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative border-2 ${
                plan.popular 
                  ? 'border-primary bg-card shadow-lg' 
                  : 'border-border bg-card'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 right-6">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    Best Value
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-bold text-foreground mb-2">
                  {plan.name}
                </CardTitle>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-base text-muted-foreground ml-2">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full" 
                  variant={plan.popular ? "hero" : "outline"}
                  size="lg"
                  onClick={() => handleSubscribe(plan.planType)}
                  disabled={loading === plan.planType}
                >
                  {loading === plan.planType ? "Loading..." : plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-muted-foreground">
            Billed via Stripe. Cancel anytime in one click. 18+
          </p>
          <p className="text-sm text-muted-foreground">
            Informational only. Gamble responsibly.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PricingModal;
