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
    window.open("https://github.com/pabrax/SnapLoad", "_blank")
  }

  const handleLocalSetup = () => {
    window.open("https://github.com/pabrax/SnapLoad#-instalación-rápida-recomendada", "_blank")
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md bg-slate-900 border-slate-700">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4 text-slate-400 hover:text-slate-100" />
          <span className="sr-only">Cerrar</span>
        </button>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-red-500/10">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <AlertDialogTitle className="text-xl text-slate-100">
              Servidor Desconectado
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="text-slate-300 space-y-3 pt-2">
              <p>
                El servidor backend de SnapLoad no está en ejecución o no es accesible. La aplicación requiere el backend para funcionar.
              </p>
              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                <p className="text-sm font-medium text-slate-200 mb-2">💡 ¿Quieres probarlo localmente?</p>
                <p className="text-sm text-slate-400">
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
            className="w-full sm:w-auto border-slate-600 hover:bg-slate-800 text-slate-200"
          >
            <Github className="w-4 h-4 mr-2" />
            Ver Repositorio
          </Button>
          <Button
            onClick={handleLocalSetup}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Guía de Instalación
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
