import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Pricing = () => {
  const handleSubscribe = (planType: 'weekly' | 'monthly') => {
    // Placeholder for subscription functionality
    console.log(`Subscribe to ${planType} plan`);
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
    <section id="pricing" className="py-20 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-muted-foreground">
            Simple, flexible pricing. Cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
                <CardTitle className="text-2xl font-bold text-foreground mb-2">
                  {plan.name}
                </CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-lg text-muted-foreground ml-2">{plan.period}</span>
                </div>
                <p className="text-muted-foreground">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Subscribe Button */}
                <Button 
                  className="w-full" 
                  variant={plan.popular ? "hero" : "outline"}
                  size="lg"
                  onClick={() => handleSubscribe(plan.planType)}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Text */}
        <div className="text-center mt-12 space-y-2">
          <p className="text-muted-foreground">
            Billed via Stripe. Cancel anytime in one click. 18+
          </p>
          <p className="text-muted-foreground">
            Informational only. Gamble responsibly.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;