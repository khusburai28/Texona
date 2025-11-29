import { Banner } from "./banner";
import { QuickActions } from "./quick-actions";
import { FeatureCards } from "./feature-cards";
import { ProjectsSection } from "./projects-section";
import { TemplatesSection } from "./templates-section";

export default function Home() {
  return (
    <div className="flex flex-col space-y-8 max-w-screen-xl mx-auto pb-10">
      <Banner />
      <QuickActions />
      <TemplatesSection />
      <FeatureCards />
      <ProjectsSection />
    </div>
  );
}

