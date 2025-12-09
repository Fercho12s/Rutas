import { Bus, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-card" data-testid="footer">
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Bus className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-heading text-xl font-semibold">
                Rutas Seguras
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Tu solución integral para gestión de transporte. Conectamos destinos de manera segura y eficiente.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wide">
              Enlaces Rápidos
            </h4>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground" data-testid="link-footer-home">
                Inicio
              </Link>
              <a href="/#rutas" className="text-sm text-muted-foreground transition-colors hover:text-foreground" data-testid="link-footer-routes">
                Rutas
              </a>
              <a href="/#nosotros" className="text-sm text-muted-foreground transition-colors hover:text-foreground" data-testid="link-footer-about">
                Nosotros
              </a>
              <a href="/#contacto" className="text-sm text-muted-foreground transition-colors hover:text-foreground" data-testid="link-footer-contact">
                Contacto
              </a>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wide">
              Servicios
            </h4>
            <nav className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">
                Transporte de Pasajeros
              </span>
              <span className="text-sm text-muted-foreground">
                Rutas Interurbanas
              </span>
              <span className="text-sm text-muted-foreground">
                Servicios Corporativos
              </span>
              <span className="text-sm text-muted-foreground">
                Flota Moderna
              </span>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wide">
              Contacto
            </h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>Av. Principal 123, Ciudad</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+1 234 567 890</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>info@rutasseguras.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              {currentYear} Rutas Seguras. Todos los derechos reservados.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Términos de Servicio
              </a>
              <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Política de Privacidad
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
