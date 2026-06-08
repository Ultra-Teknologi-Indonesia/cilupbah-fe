"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

export default function TestGlassPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-[80vh] w-full overflow-hidden rounded-3xl p-6 md:p-12">
      {/* Dynamic Animated Gradient Background */}
      <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl bg-black/5 dark:bg-white/5">
        <motion.div
          animate={{
            x: mousePos.x / 20 - 50,
            y: mousePos.y / 20 - 50,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          className="absolute -top-[20%] -left-[10%] h-[60%] w-[60%] rounded-full bg-blue-400/40 mix-blend-multiply blur-3xl filter dark:bg-blue-600/30 dark:mix-blend-screen"
        />
        <motion.div
          animate={{
            x: mousePos.x / 15 + 20,
            y: mousePos.y / 15 + 20,
          }}
          transition={{ type: "spring", stiffness: 40, damping: 15 }}
          className="absolute top-[10%] right-[5%] h-[50%] w-[50%] rounded-full bg-purple-400/40 mix-blend-multiply blur-3xl filter dark:bg-purple-600/30 dark:mix-blend-screen"
        />
        <motion.div
          animate={{
            x: -(mousePos.x / 25) + 30,
            y: -(mousePos.y / 25) + 30,
          }}
          transition={{ type: "spring", stiffness: 30, damping: 25 }}
          className="absolute bottom-[0%] left-[20%] h-[70%] w-[70%] rounded-full bg-pink-400/40 mix-blend-multiply blur-3xl filter dark:bg-pink-600/30 dark:mix-blend-screen"
        />
      </div>

      {/* Glass Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-8">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground/90">
            Liquid Glass Experiment
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Pindahkan kursor Anda untuk melihat bagaimana warna gradasi di belakang merespon dan membaur dengan efek kaca.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
          {/* Card 1 */}
          <Card className="border-white/30 dark:border-white/10 shadow-xl bg-card">
            <CardHeader>
              <CardTitle>Autentikasi</CardTitle>
              <CardDescription>Coba efek blur pada input dan form.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="nama@email.com" className="bg-background/40 backdrop-blur-md border-white/20" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" className="bg-background/40 backdrop-blur-md border-white/20" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Sign In</Button>
            </CardFooter>
          </Card>

          {/* Card 2 */}
          <Card className="border-white/30 dark:border-white/10 shadow-xl bg-card">
            <CardHeader>
              <CardTitle>Notion Style</CardTitle>
              <CardDescription>Estetika yang bersih dan kontras tinggi.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">
                Notice how the text remains incredibly readable even with the vibrant animated blobs floating behind the glass. 
                The border creates a subtle rim-light effect reminiscent of Apple's visionOS and macOS Sonoma.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" className="bg-transparent border-white/20 backdrop-blur-md">Cancel</Button>
              <Button>Deploy</Button>
            </CardFooter>
          </Card>

          {/* Card 3 */}
          <Card className="border-white/30 dark:border-white/10 shadow-xl bg-card md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle>Interaksi</CardTitle>
              <CardDescription>Coba arahkan kursor ke tombol.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex flex-col">
              <Button variant="secondary" className="justify-start bg-secondary/50 backdrop-blur-md border border-white/10">
                Secondary Glass Button
              </Button>
              <Button variant="ghost" className="justify-start hover:bg-white/10">
                Ghost Button (Notion style)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
