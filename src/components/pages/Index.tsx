import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { WallpaperGallery } from "@/components/WallpaperGallery";
// Forma uchun kerakli UI komponentlarini import qilamiz
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const Index = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      // Telegram bot token from environment variables
      const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
      const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;
      
      if (!botToken || !chatId) {
        throw new Error("Telegram bot token or chat ID is not configured");
      }

      // Prepare the message content
      const telegramMessage = `
New contact form submission:
Name: ${name}
Phone: ${phone}
Message: ${message}
      `.trim();

      // Send to Telegram bot
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: telegramMessage,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.status}`);
      }

      // If successful, show success message
      setSubmitSuccess(true);
      // Reset form
      setName("");
      setPhone("");
      setMessage("");
    } catch (error) {
      console.error("Error sending to Telegram:", error);
      setSubmitError("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <WallpaperGallery />

      {/* --- Aloqa (Contact) Bo'limi Boshlanishi --- */}
      <section id="contact" className="py-20 bg-secondary">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Biz Bilan Bog'laning
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Savolingiz bormi yoki maxsus loyiha haqida gaplashmoqchimisiz? Sizdan xabar kutamiz.
            </p>
          </div>
          
          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
              Xabar muvaffaqiyatli yuborildi! Tez orada siz bilan bog'lanamiz.
            </div>
          )}

          {submitError && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
              {submitError}
            </div>
          )}
          
          {/* Bu oddiy HTML forma. 
            Ma'lumotlarni qabul qilish uchun siz server (backend) 
            yoki Formspree, Getform kabi xizmatlardan foydalanishingiz kerak bo'ladi.
            Hozircha `onSubmit` sahifani yangilamasligi uchun qo'shildi.
          */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">To'liq Ismingiz</Label>
                <Input 
                  id="name" 
                  placeholder="Abdulla Avloniy" 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon Raqamingiz</Label>
                <Input 
                  id="phone" 
                  placeholder="901234567" 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  pattern="+998\\d{9}"
                  maxLength={13}
                  title="Telefon raqam +998 va 9 xonali son ko'rinishida bo'lishi kerak, masalan: +998901234567"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Xabar</Label>
              <Textarea 
                id="message" 
                placeholder="Sizning xabaringiz..." 
                rows={5} 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>
            <div className="text-center">
              <Button 
                type="submit" 
                size="lg" 
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Yuborilmoqda..." : "Xabarni Yuborish"}
              </Button>
            </div>
          </form>
        </div>
      </section>
      {/* --- Aloqa (Contact) Bo'limi Tugashi --- */}
      
      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">IdealHome</h3>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-6">
            Transforming spaces with premium wallpaper designs. Every wall tells a story.
          </p>
          <p className="text-sm text-primary-foreground/60">
            © 2024 IdealHome. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
