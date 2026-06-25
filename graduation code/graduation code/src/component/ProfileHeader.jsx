import { Card, Avatar, Chip } from "@heroui/react";
import { MapPin, Star, Mail } from "lucide-react";

export default function ProfileHeader() {
  return (
    <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-none border-none shadow-lg">
      <div className="p-8 flex flex-col md:flex-row gap-6 items-center">
        <Avatar 
          src="https://i.pravatar.cc/150?u=a042581f4e29026704d" 
          className="w-28 h-28 border-4 border-white/20" 
        />
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <div>
              <h2 className="text-3xl font-bold">Dr. Sarah Mitchell</h2>
              <p className="text-blue-100 text-lg">Mathematics Teacher</p>
            </div>
            <Chip className="bg-white/20 text-white border-none">98% Match Score</Chip>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-6 text-sm">
            <span className="flex items-center gap-2"><MapPin size={16}/> Cambridge, MA</span>
            <span className="flex items-center gap-2"><Star size={16} className="text-yellow-300"/> 4.9 Rating</span>
            <span className="flex items-center gap-2"><Mail size={16}/> sarah.mitchell@email.com</span>
          </div>
        </div>
      </div>
    </Card>
  );
}