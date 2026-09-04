"use client";

import Link from "next/link";
import { Headphones, Mail, Phone, Clock, ArrowLeft, HelpCircle, Send, ChevronDown, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { id } from "zod/v4/locales";
import { submitSupportTicketAction } from "./actions";


// Sıkça Sorulan Sorular Verisi
const faqItems = [
  {
    id: "faq-1",
    question: "Why was my order cancelled by the seller?",
    answer:
      "Orders may be cancelled due to unexpected stock deficits, supplier delays, or payment verification issues. If your order was cancelled by the admin, a full refund is automatically initiated to your original payment method.",
  },
  {
    id: "faq-2",
    question: "How long does a refund take?",
    answer:
      "Refunds are processed immediately on our end via Stripe. It typically takes 3 to 7 business days to reflect on your bank statement depending on your financial institution.",
  },
  {
    id: "faq-3",
    question: "Can I change my shipping address after placing an order?",
    answer:
      "If your order status is still 'Order Received' (PENDING), please submit a support ticket below with your Order ID and new address as soon as possible before it gets shipped.",
  },
  {
    id: "faq-4",
    question: "How can I track my shipped package?",
    answer:
      "Once your order status turns to 'Shipped', you will see the shipping date update on your 'My Orders' page. You can contact support anytime for courier tracking details.",
  },
  {
    id: "faq-5",
    question: "Why is my account suspended and how can I reactivate it?",
    answer:
     "Accounts may be temporarily suspended due to security checks, unusual activity, or policy violations. While suspended, you cannot place new orders, but you can still access your account and view past orders. To appeal or reactivate your account, please submit a support ticket below with 'Account Suspension Appeal' as the subject.",
  },
];


export default function SupportPage() {
  // Açık olan Soru ID'sini tutan state (Dropdown Mantığı)
  const [openFaq, setOpenFaq] = useState<string | null>("faq-1");

  // Form State'leri
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const toggleFaq = (id: string) => {
    setOpenFaq((prev) => (prev === id ? null : id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await submitSupportTicketAction({ orderId, subject, message });

    setLoading(false);
    if (res.success) {
      setSubmitted(true);
      setOrderId("");
      setSubject("");
      setMessage("");
    }
  };

  return (
    <main className="container max-w-3xl mx-auto space-y-6 px-4 py-6 sm:px-6 sm:py-10 pb-12 md:pb-96 lg:pb-12">
      {/* Üst Geri Dönüş ve Başlık Alanı */}
      <div className="space-y-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
          <Link href="/">
            <ArrowLeft className="mr-2 size-4" />
            Back to Home
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-16 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Headphones className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Customer Support</h1>
            <p className="text-xs text-muted-foreground">
              We're here to help you with your orders, refunds, and inquiries.
            </p>
          </div>
        </div>
      </div>


      {/* İletişim Kartları */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <Mail className="size-5 text-primary mb-1" />
            <CardTitle className="text-base">Email Us</CardTitle>
            <CardDescription className="text-xs">
              Response within 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm font-medium ">
            support@nxtstore.com
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <Phone className="size-5 text-primary mb-1" />
            <CardTitle className="text-base">Call Support</CardTitle>
            <CardDescription className="text-xs">
              Toll-free customer care
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm font-medium">
            +90 (850) 123-4567
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <Clock className="size-5 text-primary mb-1" />
            <CardTitle className="text-base">Working Hours</CardTitle>
            <CardDescription className="text-xs">
              Monday – Friday
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm font-medium">
            09:00 AM – 06:00 PM
          </CardContent>
        </Card>
      </div>

      {/* Sıkça Sorulan Sorular (FAQ) */}
      <div className="grid gap-8 md:grid-cols-2 items-start">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqItems.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <Card
                  key={faq.id}
                  className="border-border/60 overflow-hidden transition-all duration-200"
                >
                  <Button
                    asChild
                    variant="ghost"
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full h-auto min-h-[56px] p-4 text-left flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors rounded-none font-normal whitespace-normal"
                  >
                    <button type="button">
                      <span className="text-sm font-medium text-foreground leading-snug flex-1">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`size-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-primary" : ""
                        }`}
                      />
                    </button>
                  </Button>

                  {isOpen && (
                    <CardContent className="px-4 pb-4 pt-0 text-xs text-muted-foreground leading-relaxed animate-in fade-in-50 duration-200">
                      <div className="border-t border-border/40 pt-3">{faq.answer}</div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Destek Mesaj Formu */}
        <Card className="border-border/80 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Send Us a Message</CardTitle>
            <CardDescription className="text-xs">
              Fill out the form below and our support team will get back to you shortly.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {submitted ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center space-y-3 py-8">
                <div className="mx-auto size-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-emerald-900 dark:text-emerald-200 text-sm">
                    Ticket Submitted!
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    We have received your message. Our team will contact you via email soon.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSubmitted(false)}
                  className="text-xs mt-2"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 ">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Order ID (Optional)
                  </label>
                  <Input
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. cs_test_..."
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Subject</label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Cancelled order inquiry / Refund help"
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Message</label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Please describe your issue in detail..."
                    required
                    className="min-h-[100px] text-xs resize-none"
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full size-sm text-xs mt-2">
                  {loading ? (
                    <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <Send className="size-3.5 mr-1.5" />
                  )}
                  {loading ? "Sending Ticket..." : "Submit Ticket"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}