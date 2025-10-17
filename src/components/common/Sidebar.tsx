"use client";

import { useState } from "react";
import { Button } from "../ui/button";

export default function Sidebar() {
  const tools = ["Tool 1", "Tool 2", "Tool 3"];
  const [selectedTool, setSelectedTool] = useState<string>("Tool 1");
  const onSelectTool = (tool: string) => {
    setSelectedTool(tool);
  };

  return (
    <aside className="w-48 bg-white shadow-md flex flex-col h-screen">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-2">Tools</h2>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="space-y-1 p-4 pt-0">
          {tools.map((tool) => (
            <Button
              key={tool}
              variant={selectedTool === tool ? "default" : "ghost"}
              className="w-full justify-start text-sm py-1 px-2 h-auto"
              onClick={() => onSelectTool(tool)}
            >
              {tool}
            </Button>
          ))}
        </div>
      </div>
    </aside>
  );
}
