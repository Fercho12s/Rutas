import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  Bus,
  Clock,
  MapPin,
  Shield,
  Users,
  ArrowRight,
  Search,
  CheckCircle,
  Phone,
  Mail,
  Truck,
} from "lucide-react";
import { Link } from "wouter";

const contactSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const features = [
  {
    icon: Shield,
    title: "Seguridad Garantizada",
    description: "Vehículos monitoreados 24/7 con los más altos estándares de seguridad.",
  },
  {
    icon: Clock,
    title: "Puntualidad",
    description: "Cumplimos con los horarios establecidos para tu tranquilidad.",
  },
  {
    icon: Users,
    title: "Conductores Profesionales",
    description: "Personal capacitado y certificado para tu comodidad.",
  },
  {
    icon: Truck,
    title: "Flota Moderna",
    description: "Vehículos de última generación con todas las comodidades.",
  },
];

const steps = [
  { number: 1, title: "Busca tu Ruta", description: "Encuentra la ruta que mejor se adapte a tus necesidades" },
  { number: 2, title: "Selecciona Horario", description: "Elige el horario más conveniente para ti" },
  { number: 3, title: "Reserva tu Lugar", description: "Asegura tu asiento de manera rápida y sencilla" },
  { number: 4, title: "Viaja Seguro", description: "Disfruta de un viaje cómodo y seguro" },
];

const stats = [
  { value: "500+", label: "Rutas Activas" },
  { value: "50K+", label: "Pasajeros Mensuales" },
  { value: "100+", label: "Unidades en Flota" },
  { value: "99%", label: "Satisfacción" },
];

export default function Landing() {
  const [searchOrigin, setSearchOrigin] = useState("");
  const [searchDestination, setSearchDestination] = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const onSubmitContact = async (data: ContactFormData) => {
    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        setContactSubmitted(true);
        form.reset();
      }
    } catch (error) {
      console.error("Error sending contact:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="relative flex min-h-[600px] items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background" data-testid="section-hero">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M54.627%200l.83.828-1.415%201.415L51.8%200h2.827zM5.373%200l-.83.828L5.96%202.243%208.2%200H5.374zM48.97%200l3.657%203.657-1.414%201.414L46.143%200h2.828zM11.03%200L7.372%203.657%208.787%205.07%2013.857%200H11.03zm32.284%200L49.8%206.485%2048.384%207.9l-7.9-7.9h2.83zM16.686%200L10.2%206.485%2011.616%207.9l7.9-7.9h-2.83zM22.343%200L13.857%208.485%2015.272%209.9l9.9-9.9h-2.83zM32%200l-3.486%203.485-1.414%201.415L32%200z%22%20fill%3D%22%23000%22%20fill-opacity%3D%22.03%22%20fill-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] opacity-50" />

          <div className="container relative z-10 mx-auto px-4 py-20 text-center md:px-6">
            <div className="mx-auto max-w-3xl space-y-6">
              <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl" data-testid="text-hero-title">
                Tu Viaje Comienza con{" "}
                <span className="text-primary">Rutas Seguras</span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl" data-testid="text-hero-subtitle">
                Conectamos destinos con la mayor seguridad y confianza. 
                Descubre nuestras rutas y viaja con tranquilidad.
              </p>

              <Card className="mx-auto mt-8 max-w-2xl border-none shadow-lg" data-testid="card-search">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 md:flex-row">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Origen"
                        value={searchOrigin}
                        onChange={(e) => setSearchOrigin(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-origin"
                      />
                    </div>
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Destino"
                        value={searchDestination}
                        onChange={(e) => setSearchDestination(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-destination"
                      />
                    </div>
                    <Button className="gap-2" data-testid="button-search-routes">
                      <Search className="h-4 w-4" />
                      Buscar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <Link href="/register">
                  <Button size="lg" className="gap-2" data-testid="button-cta-register">
                    Comenzar Ahora
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#nosotros">
                  <Button variant="outline" size="lg" data-testid="button-cta-learn">
                    Conocer Más
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-card py-16 md:py-24" id="rutas" data-testid="section-features">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="font-heading text-3xl font-bold md:text-4xl" data-testid="text-features-title">
                ¿Por qué Elegirnos?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Ofrecemos el mejor servicio de transporte con los más altos estándares de calidad
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <Card key={index} className="text-center" data-testid={`card-feature-${index}`}>
                  <CardContent className="pt-6">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                      <feature.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="mb-2 font-heading text-lg font-semibold">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24" data-testid="section-how-it-works">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="font-heading text-3xl font-bold md:text-4xl">
                ¿Cómo Funciona?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                En solo 4 pasos puedes reservar tu viaje
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => (
                <div key={index} className="relative text-center" data-testid={`step-${index}`}>
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    {step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="absolute left-1/2 top-6 hidden h-0.5 w-full -translate-y-1/2 bg-border lg:block" />
                  )}
                  <h3 className="mb-2 font-heading text-lg font-semibold">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-primary py-16 md:py-24" id="nosotros" data-testid="section-stats">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center" data-testid={`stat-${index}`}>
                  <div className="font-heading text-4xl font-bold text-primary-foreground md:text-5xl">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-primary-foreground/80">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24" id="contacto" data-testid="section-contact">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <h2 className="font-heading text-3xl font-bold md:text-4xl">
                  Contáctanos
                </h2>
                <p className="mt-4 text-muted-foreground">
                  ¿Tienes preguntas? Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo antes posible.
                </p>

                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Teléfono</p>
                      <p className="font-medium">+1 234 567 890</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">info@rutasseguras.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Dirección</p>
                      <p className="font-medium">Av. Principal 123, Ciudad</p>
                    </div>
                  </div>
                </div>
              </div>

              <Card data-testid="card-contact-form">
                <CardHeader>
                  <CardTitle>Envíanos un Mensaje</CardTitle>
                </CardHeader>
                <CardContent>
                  {contactSubmitted ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <CheckCircle className="mb-4 h-12 w-12 text-green-500" />
                      <h3 className="font-heading text-lg font-semibold">
                        ¡Mensaje Enviado!
                      </h3>
                      <p className="mt-2 text-muted-foreground">
                        Gracias por contactarnos. Te responderemos pronto.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setContactSubmitted(false)}
                      >
                        Enviar otro mensaje
                      </Button>
                    </div>
                  ) : (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmitContact)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre</FormLabel>
                              <FormControl>
                                <Input placeholder="Tu nombre" {...field} data-testid="input-contact-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="tu@email.com" {...field} data-testid="input-contact-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Teléfono (opcional)</FormLabel>
                              <FormControl>
                                <Input placeholder="+1 234 567 890" {...field} data-testid="input-contact-phone" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mensaje</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Escribe tu mensaje aquí..."
                                  className="min-h-[100px]"
                                  {...field}
                                  data-testid="textarea-contact-message"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full" data-testid="button-contact-submit">
                          Enviar Mensaje
                        </Button>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-card py-16 md:py-24" data-testid="section-cta">
          <div className="container mx-auto px-4 text-center md:px-6">
            <div className="mx-auto max-w-3xl">
              <h2 className="font-heading text-3xl font-bold md:text-4xl">
                ¿Listo para Viajar?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Únete a miles de pasajeros que confían en nosotros. 
                Regístrate hoy y descubre la mejor manera de viajar.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="gap-2" data-testid="button-cta-final-register">
                    Registrarse Gratis
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" data-testid="button-cta-final-login">
                    Ya tengo cuenta
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
