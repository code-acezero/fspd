import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      <AnimatePresence mode="sync">
        {toasts.map(function ({ id, title, description, action, variant, ...props }) {
          const isDestructive = variant === "destructive";
          const Icon = isDestructive ? AlertCircle : CheckCircle;

          return (
            <Toast
              key={id}
              {...props}
              variant={variant}
              className="group border-none shadow-2xl backdrop-blur-xl bg-foreground/90 dark:bg-card/95 rounded-full overflow-hidden p-0 min-h-0 max-w-[320px] mx-auto data-[state=open]:animate-none data-[state=closed]:animate-none"
              style={{ pointerEvents: "auto" }}
            >
              <motion.div
                initial={{ opacity: 0, y: -40, scale: 0.6 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="flex items-center gap-2.5 px-4 py-2.5"
              >
                <Icon className={`w-4 h-4 shrink-0 ${isDestructive ? "text-destructive" : "text-primary"}`} style={{ color: isDestructive ? undefined : "hsl(142, 71%, 45%)" }} />
                <div className="flex flex-col min-w-0">
                  {title && <ToastTitle className="text-xs font-semibold text-background dark:text-foreground font-bengali leading-tight truncate">{title}</ToastTitle>}
                  {description && <ToastDescription className="text-[10px] text-background/70 dark:text-muted-foreground font-bengali leading-tight truncate">{description}</ToastDescription>}
                </div>
                {action}
                <ToastClose className="rounded-full w-5 h-5 flex items-center justify-center hover:bg-background/20 transition-colors shrink-0 opacity-60 hover:opacity-100 ml-auto [&>svg]:w-3 [&>svg]:h-3 text-background dark:text-foreground" />
              </motion.div>
            </Toast>
          );
        })}
      </AnimatePresence>
      <ToastViewport className="fixed top-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 w-auto max-w-[calc(100vw-2rem)] z-[100] p-0" />
    </ToastProvider>
  );
}
