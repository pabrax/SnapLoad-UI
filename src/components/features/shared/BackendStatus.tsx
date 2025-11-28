import { Badge } from "@/src/components/ui/badge"
import type { BackendStatus } from "@/src/types/api"

interface BackendStatusProps {
  status: BackendStatus
}

export function BackendStatusBadge({ status }: BackendStatusProps) {
  return (
    <div className="flex justify-center">
      <Badge 
        variant={status === "connected" ? "default" : "destructive"}
        className="text-xs"
      >
        {status === "connected" ? "🟢 Conectado" : 
         status === "disconnected" ? "🔴 Backend desconectado" : 
         "🟡 Verificando..."}
      </Badge>
    </div>
  )
}
