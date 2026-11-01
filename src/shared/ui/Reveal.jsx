import { motion, useReducedMotion } from 'framer-motion';

export const Reveal = ({ children, className, delay = 0 }) => {
  const reduced = useReducedMotion();
  return <motion.div className={className}
    initial={reduced ? false : { opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.08 }}
    transition={{ duration: reduced ? 0 : 0.42, delay: reduced ? 0 : delay, ease: [0.16, 1, 0.3, 1] }}>
    {children}
  </motion.div>;
};
