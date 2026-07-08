import { motion } from "framer-motion";
import CountUp from "react-countup";
import { LIVE_STATS } from "./data";

export default function LiveStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {LIVE_STATS.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.06, duration: 0.35 }}
          className="rounded-2xl border border-border/60 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-sm p-4 text-center"
        >
          <p className="text-2xl md:text-3xl font-display font-bold text-primary tabular-nums">
            <CountUp end={stat.value} duration={2.2} decimals={stat.decimals || 0} separator="," enableScrollSpy scrollSpyOnce />
            {stat.suffix}
          </p>
          <p className="text-xs text-muted-foreground font-medium mt-1 leading-snug">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
