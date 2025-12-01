"use client"

import { AlertCircle, Github, ExternalLink } from "lucide-react"
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
    window.open("https://github.com/pabrax/SnapLoad/tree/main/snapLoad-API#-quick-start", "_blank")
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md bg-slate-900 border-slate-700">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-red-500/10">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <AlertDialogTitle className="text-xl text-slate-100">
              Servidor Desconectado
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-slate-300 space-y-3 pt-2">
            <p>
              El servidor backend de SnapLoad no está en ejecución o no es accesible. La aplicación requiere el backend para funcionar.
            </p>
            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
              <p className="text-sm font-medium text-slate-200 mb-2">💡 ¿Quieres probarlo localmente?</p>
              <p className="text-sm text-slate-400">
                Puedes ejecutar tu propia instancia de SnapLoad en tu máquina. ¡Es gratis, open-source y fácil de configurar!
              </p>
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
