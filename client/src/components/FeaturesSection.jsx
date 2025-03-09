import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bug, MessageCircle, ClipboardList } from "lucide-react";

const features = [
  { 
    icon: <MessageCircle size={64} />, 
    title: "Collect Feedback", 
    desc: "Gather valuable user feedback to improve services and enhance customer experience." 
  },
  { 
    icon: <Bug size={64} />, 
    title: "Bug Tracking", 
    desc: "Identify, track, and resolve bugs efficiently to maintain smooth operations." 
  },
  { 
    icon: <ClipboardList size={64} />, 
    title: "Issue Management", 
    desc: "Organize and prioritize issues for seamless workflow execution." 
  }
];

const FeaturesSection = () => {
  return (
    <div className="max-w-7xl mx-auto text-center py-16 px-6 -mt-20">
      <h2 className="text-6xl font-bold text-green-700 mb-16">What Service Flow Does</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
        {features.map((feature, index) => (
          <Card key={index} className="p-12 w-full shadow-lg hover:shadow-2xl transition-all">
            <CardHeader className="flex flex-col items-center">
              <div className="text-green-600">{feature.icon}</div>
              <CardTitle className="mt-6 text-3xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl text-gray-700">{feature.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeaturesSection;
