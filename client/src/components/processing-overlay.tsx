import { motion } from "framer-motion";
import { Loader2, Brain, Cpu } from "lucide-react";

export function ProcessingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-6 rounded-md bg-primary/5 border border-primary/20 p-4"
      data-testid="overlay-processing"
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-6 h-6 text-primary" />
          </motion.div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">AI Analysis in Progress</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your P&L statement is being processed by our AI engine. This may take a moment.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-muted-foreground">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Brain className="w-5 h-5" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          >
            <Cpu className="w-5 h-5" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
