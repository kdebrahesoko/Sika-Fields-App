import { motion } from "framer-motion";
import { MRV_TIMELINE } from "./data";

export default function MrvTimeline() {
  return (
    <div className="relative">
      <div className="hidden lg:block absolute top-7 left-[6%] right-[6%] h-0.5 bg-border" aria-hidden="true" />
      <ol className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6 lg:gap-2">
        {MRV_TIMELINE.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              className="relative flex flex-col items-center text-center gap-2.5"
            >
              <motion.div
                whileInView={{ scale: [0.7, 1.1, 1] }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ delay: idx * 0.08 + 0.15, duration: 0.4 }}
                className="relative z-10 w-14 h-14 rounded-2xl bg-background border-2 border-primary/30 shadow-md flex items-center justify-center"
              >
                <Icon className="w-6 h-6 text-primary" />
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
              </motion.div>
              <p className="text-xs font-semibold text-foreground leading-tight max-w-[7.5rem]">{step.title}</p>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
