import React, { useState, useRef } from "react";
import { X, Move, Layers, Filter } from "lucide-react";

export default function DraggablePopupManager() {
  // Array stack to manage infinitely nested popups dynamically
  const [popups, setPopups] = useState([]);

  // Open a new popup layer stacked slightly offset from the last one
  const openNewPopup = (title, type) => {
    const id = Date.now();
    const offset = popups.length * 25; // Cascading layout offset

    const newPopup = {
      id,
      title: `${title} (Layer ${popups.length + 1})`,
      type,
      x: 100 + offset,
      y: 120 + offset,
    };
    setPopups([...popups, newPopup]);
  };

  const closePopup = (id) => {
    setPopups(popups.filter((p) => p.id !== id));
  };

  // Drag Event Handlers
  const handleMouseDown = (e, id) => {
    const popupIndex = popups.findIndex((p) => p.id === id);
    if (popupIndex === -1) return;

    const popup = popups[popupIndex];
    const startX = e.clientX - popup.x;
    const startY = e.clientY - popup.y;

    // Bring clicked window to the front of the stacking order
    const updatedPopups = [...popups];
    const [clickedPopup] = updatedPopups.splice(popupIndex, 1);
    updatedPopups.push(clickedPopup);
    setPopups(updatedPopups);

    const handleMouseMove = (moveEvent) => {
      setPopups((prevPopups) =>
        prevPopups.map((p) =>
          p.id === id
            ? {
                ...p,
                x: moveEvent.clientX - startX,
                y: moveEvent.clientY - startY,
              }
            : p,
        ),
      );
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="relative w-full h-[600px] bg-slate-100/60 rounded border border-dashed border-slate-300 p-4 overflow-hidden select-none">
      {/* Root Context Trigger Area */}
      <div className="bg-white p-3 rounded border border-slate-200 shadow-sm max-w-sm space-y-2">
        <span className="text-[10px] font-bold text-slate-400  tracking-wider block">
          Workspace Controller
        </span>
        <h4 className="font-bold text-slate-800 text-xs">
          Configuration Environment
        </h4>
        <p className="text-slate-500 text-[11px]">
          Click below to simulate opening nested lookup parameters.
        </p>

        <button
          onClick={() => openNewPopup("Property Selection master", "property")}
          className="w-full h-8 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded flex items-center justify-center gap-1.5 transition text-xs shadow-sm"
        >
          <Filter size={12} /> Open Primary Selector Panel
        </button>
      </div>

      {/* Render Stacked Windows */}
      {popups.map((popup) => (
        <div
          key={popup.id}
          style={{
            top: `${popup.y}px`,
            left: `${popup.x}px`,
            position: "absolute",
          }}
          className="w-64 bg-white border border-slate-200 rounded shadow-xl overflow-hidden flex flex-col z-50 transition-shadow focus-within:shadow-2xl"
        >
          {/* Draggable Title Header Bar */}
          <div
            onMouseDown={(e) => handleMouseDown(e, popup.id)}
            className="bg-slate-800 text-slate-200 px-2 py-1.5 flex items-center justify-between cursor-move select-none border-b border-slate-900"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Move size={11} className="text-slate-400 shrink-0" />
              <span className="font-bold tracking-tight truncate text-[11px]">
                {popup.title}
              </span>
            </div>
            <button
              onClick={() => closePopup(popup.id)}
              className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded p-0.5 transition-colors"
            >
              <X size={12} />
            </button>
          </div>

          {/* Dynamic Popup Action Workspace */}
          <div className="p-3 space-y-2 bg-slate-50/50">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400  tracking-wider">
                Quick Filter Search
              </label>
              <input
                type="text"
                placeholder={`Search sub-records...`}
                className="w-full h-7 border border-slate-200 rounded px-2 text-xs outline-none bg-white focus:border-indigo-500"
              />
            </div>

            <div className="p-1.5 bg-white border border-slate-200 rounded text-[11px] font-mono text-slate-500 space-y-1">
              <div>Type: {popup.type.toUpperCase()}</div>
              <div>ID: {popup.id.toString().slice(-6)}</div>
            </div>

            {/* Inner Nested Trigger Node */}
            <button
              onClick={() => openNewPopup("Dependent Sub-Node", "nested-leaf")}
              className="w-full h-7 border border-dashed border-indigo-200 hover:border-indigo-400 text-indigo-600 bg-indigo-50/30 hover:bg-indigo-50 text-[11px] font-semibold rounded flex items-center justify-center gap-1 transition"
            >
              <Layers size={11} /> Nest Next Sub-Selector
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
