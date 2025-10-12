import { Helmet } from "react-helmet";
import { HelpCircle, Mail, FileQuestion, MessageCircle, BookOpen } from "lucide-react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function Support() {
  const faqs = [
    {
      question: "How do AI insights work?",
      answer: "Our AI analyzes team statistics, recent form, head-to-head records, and tactical patterns to provide data-driven match predictions and insights."
    },
    {
      question: "What leagues are covered?",
      answer: "We currently cover Premier League, Bundesliga, La Liga, Serie A, Ligue 1, Eredivisie, Primeira Liga, Championship, Champions League, Europa League, and MLS."
    },
    {
      question: "How often is data updated?",
      answer: "Match data, fixtures, and league tables are updated in real-time. AI insights are generated before each match and updated as new information becomes available."
    },
    {
      question: "What subscription plans are available?",
      answer: "We offer Free, Weekly, and Monthly plans with varying levels of AI insight access. Premium plans include unlimited insights and advanced analytics."
    },
  ];

  return (
    <>
      <Helmet>
        <title>Support | StatEdge</title>
      </Helmet>

      <SidebarProvider defaultOpen>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
        
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-lg px-4 md:px-6">
            <SidebarTrigger />
          </header>

          <main className="flex-1 p-4 md:p-6 space-y-6">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Support</h1>
            </div>

            {/* Quick Help Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="glass-card hover-lift cursor-pointer">
                <CardHeader>
                  <BookOpen className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Documentation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Learn how to use StatEdge.ai features
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card hover-lift cursor-pointer">
                <CardHeader>
                  <MessageCircle className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Live Chat</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Chat with our support team
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card hover-lift cursor-pointer">
                <CardHeader>
                  <Mail className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Email Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Get help via email within 24h
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* FAQ Section */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileQuestion className="h-5 w-5" />
                  Frequently Asked Questions
                </CardTitle>
                <CardDescription>Quick answers to common questions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="space-y-2">
                      <h3 className="font-semibold">{faq.question}</h3>
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
                <CardDescription>
                  Can't find what you're looking for? Send us a message
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="your@email.com" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="How can we help?" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <textarea
                      id="message"
                      className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Describe your issue or question..."
                    />
                  </div>

                  <Button type="submit" variant="hero" className="w-full md:w-auto">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="glass-card bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-center md:text-left">
                    <p className="font-semibold mb-1">Need immediate assistance?</p>
                    <p className="text-sm text-muted-foreground">
                      Email us at support@statedge.ai
                    </p>
                  </div>
                  <Button variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
    </>
  );
}
