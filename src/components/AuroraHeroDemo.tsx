"use client";

import React from "react";
import { motion } from "motion/react";
import { AuroraHero } from "@/components/ui/hero-2"; // Adjust the import path as needed

export default function AuroraHeroDemo() {
  return (
    <AuroraHero>
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-center text-4xl font-bold tracking-tight text-transparent md:text-6xl"
      >
        Experience the Aurora
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.5,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="mx-auto mt-4 max-w-lg text-center text-base text-muted-foreground"
      >
        A stunning, animated background that brings your hero sections to
        life, adapting beautifully to both light and dark themes.
      </motion.p>
    </AuroraHero>
  );
}
