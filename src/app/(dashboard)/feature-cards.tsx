"use client";

import {
  ImageIcon,
  Wand2,
  Layout,
  Type,
  Palette,
  Layers
} from "lucide-react";

const features = [
  {
    icon: Wand2,
    title: "AI Image Generation",
    description: "Create stunning images from text prompts using advanced AI",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: ImageIcon,
    title: "Background Removal",
    description: "Remove backgrounds instantly with one click",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Layout,
    title: "Smart Templates",
    description: "Start with professionally designed templates",
    color: "from-orange-500 to-yellow-500",
  },
  {
    icon: Type,
    title: "Rich Text Editor",
    description: "Add and customize text with multiple fonts and styles",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Palette,
    title: "Color Tools",
    description: "Pick perfect colors with advanced color picker",
    color: "from-red-500 to-rose-500",
  },
  {
    icon: Layers,
    title: "Layer Management",
    description: "Organize your designs with powerful layer controls",
    color: "from-indigo-500 to-violet-500",
  },
];

export const FeatureCards = () => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">What you can do</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group relative overflow-hidden rounded-xl border bg-card p-6 hover:border-primary/50 transition-all duration-300"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
            <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.color} mb-4`}>
              <feature.icon className="size-5 text-white" />
            </div>
            <h4 className="font-semibold mb-2">{feature.title}</h4>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
