import { Button } from "@heroui/react";
import { Heart, MessageSquare, Calendar } from "lucide-react";

export default function ActionButtons() {
  return (
    <div className="flex justify-end gap-3 p-4 bg-white border-b">
      <Button variant="outline" startContent={<Heart size={18}/>}>Shortlist</Button>
      <Button variant="outline" startContent={<MessageSquare size={18}/>}>Message</Button>
      <Button color="primary" startContent={<Calendar size={18}/>}>Schedule Interview</Button>
    </div>
  );
}