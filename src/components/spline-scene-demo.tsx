'use client'

import { SplineScene } from "@/components/ui/spline-scene";
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, GraduationCap, Brain } from "lucide-react"
import { Link } from "react-router-dom"

export function SplineHero() {
  return (
    <Card className="w-full h-[600px] bg-black/[0.96] relative overflow-hidden border-edu-purple/20">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="#9b87f5"
      />
      
      <div className="flex h-full flex-col md:flex-row">
        {/* Left content */}
        <div className="flex-1 p-8 relative z-10 flex flex-col justify-center">
          <div className="flex items-center mb-4">
            <Sparkles className="h-5 w-5 text-edu-purple mr-2" />
            <span className="text-neutral-300 font-medium">AI-Powered Learning</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400">
            Learn Anything with EduVortex
          </h1>
          
          <p className="mt-4 text-neutral-300 max-w-lg">
            Transform your learning journey with personalized AI-generated roadmaps, 
            interactive content, and adaptive assessments tailored to your needs.
          </p>
          
          <div className="flex gap-3 mt-8">
            <Button 
              asChild
              className="bg-edu-purple hover:bg-edu-deepPurple text-white"
              size="lg"
            >
              <Link to="/auth">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              asChild
            >
              <Link to="/app/learn">
                <Brain className="mr-2 h-4 w-4" />
                Explore Pathways
              </Link>
            </Button>
          </div>
          
          <div className="mt-8 flex items-center text-sm text-neutral-400">
            <GraduationCap className="h-4 w-4 mr-2 text-edu-purple" />
            <span>Join thousands of learners mastering new skills every day</span>
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1 relative">
          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </Card>
  )
}
