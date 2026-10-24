"use client"

import { AlertCircle, Github, ExternalLink, X } from "lucide-react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog"
import { Button } from "@/src/components/ui/button"

interface BackendDisconnectedDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BackendDisconnectedDialog({ open, onOpenChange }: BackendDisconnectedDialogProps) {
  const handleGoToRepo = () => {
    window.open("https://github.com/pabrax/SnapLoad", "_blank", "noopener,noreferrer")
  }

  const handleLocalSetup = () => {
    window.open("https://github.com/pabrax/SnapLoad#-instalación-rápida-recomendada", "_blank", "noopener,noreferrer")
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md bg-card border-surface-border">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          <span className="sr-only">Cerrar</span>
        </button>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-tomato/15">
              <AlertCircle aria-hidden="true" className="w-6 h-6 text-tomato" />
            </div>
            <AlertDialogTitle className="font-display text-xl text-foreground">
              Servidor Desconectado
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="text-muted-foreground space-y-3 pt-2">
              <p>
                El servidor backend de SnapLoad no está en ejecución o no es accesible. La aplicación requiere el backend para funcionar.
              </p>
              <div className="bg-plum-raised p-3 rounded-lg border border-surface-border">
                <p className="text-sm font-medium text-foreground mb-2"><span aria-hidden="true">💡 </span>¿Quieres probarlo localmente?</p>
                <p className="text-sm text-muted-foreground">
                  Puedes ejecutar tu propia instancia de SnapLoad en tu máquina. ¡Es gratis, open-source y fácil de configurar!
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleGoToRepo}
            className="w-full sm:w-auto border-surface-border hover:bg-plum-raised text-foreground"
          >
            <Github className="w-4 h-4 mr-2" />
            Ver Repositorio
          </Button>
          <Button
            onClick={handleLocalSetup}
            className="w-full sm:w-auto pop-shadow-sm font-bold"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Guía de Instalación
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
