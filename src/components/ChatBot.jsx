// // import React, { useState, useRef, useEffect } from "react";
// // import axios from "axios";
// // import ReactMarkdown from "react-markdown";
// // import remarkGfm from "remark-gfm";
// // import remarkMath from "remark-math";
// // import rehypeKatex from "rehype-katex";
// // import { backendUrl } from "./config";
// // import "katex/dist/katex.min.css";

// // const ChatBot = () => {
// //   const [messages, setMessages] = useState([]);
// //   const [input, setInput] = useState("");
// //   const [loading, setLoading] = useState(false);

// //   const messagesEndRef = useRef(null);

// //   useEffect(() => {
// //     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
// //   }, [messages]);

// //   const sendMessage = async () => {
// //     const messageText = input.trim();
// //     if (!messageText) return;

// //     setMessages((prev) => [...prev, { sender: "user", text: messageText }]);
// //     setInput("");
// //     setLoading(true);

// //     try {
// //       const response = await axios.post(
// //         `${backendUrl}/api/Chat`,
// //         JSON.stringify(messageText),
// //         {
// //           headers: {
// //             "Content-Type": "application/json",
// //             Accept: "text/html, text/plain",
// //           },
// //           responseType: "text",
// //         },
// //       );

// //       let botResponse =
// //         response.data.answer ||
// //         response.data.response ||
// //         response.data.message ||
// //         (typeof response.data === "string" ? response.data : "");

// //       if (typeof botResponse === "string") {
// //         if (botResponse.includes("```html")) {
// //           const parts = botResponse.split("```html");
// //           const introText = parts[0];
// //           const htmlContent = parts[1].split("```")[0];
// //           botResponse = { text: introText, html: htmlContent };
// //         } else if (
// //           botResponse.trim().startsWith("<!DOCTYPE") ||
// //           botResponse.trim().startsWith("<html")
// //         ) {
// //           botResponse = { text: "", html: botResponse };
// //         }
// //       }

// //       setMessages((prev) => [...prev, { sender: "bot", text: botResponse }]);
// //     } catch (err) {
// //       if (err.response && err.response.status === 503) {
// //         window.location.href = "/service-unavailable";
// //         return;
// //       }

// //       setMessages((prev) => [
// //         ...prev,
// //         { sender: "bot", text: "Error! Please try again." },
// //       ]);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleKeyDown = (e) => {
// //     if (e.key === "Enter" && !e.shiftKey) {
// //       e.preventDefault();
// //       if (!loading) sendMessage();
// //     }
// //   };

// //   const hasStartedChat = messages.length > 0;

// //   return (
// //     /* FIXED: Restrained to structural screen height boundaries (h-screen) with edge-to-edge width layout options */
// //     <div className="w-full h-screen flex flex-col bg-white overflow-hidden font-sans">
// //       {/* Top Professional Header */}
// //       {hasStartedChat && (
// //         <div className="w-full bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center select-none shrink-0 z-10">
// //           <div className="flex items-center gap-3">
// //             <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0F3A46] to-[#1d5869] flex items-center justify-center shadow-sm">
// //               <svg
// //                 className="w-4 h-4 text-white"
// //                 fill="none"
// //                 stroke="currentColor"
// //                 strokeWidth={2.5}
// //                 viewBox="0 0 24 24"
// //               >
// //                 <path d="M9.813 15.904L9 21L14.907 15.904L21 18L18 3L3 12L9.813 15.904Z" />
// //               </svg>
// //             </div>
// //             <div>
// //               <h2 className="font-semibold text-gray-800 text-base leading-none">
// //                 R-AI
// //               </h2>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* Main Container Area */}
// //       <div className="flex-1 flex flex-col bg-[#F9FBFC] relative overflow-hidden">
// //         {hasStartedChat ? (
// //           <>
// //             {/* FIXED: Allowed independent scroll targeting only on message feeds while handling iframe responsiveness safely */}
// //             <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
// //               {messages.map((msg, i) => (
// //                 <div
// //                   key={i}
// //                   className={`flex gap-3 w-full max-w-7xl mx-auto ${
// //                     msg.sender === "bot" ? "justify-start" : "justify-end"
// //                   }`}
// //                 >
// //                   {/* Agent Profile Avatar */}
// //                   {msg.sender === "bot" && (
// //                     <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-xs text-[#0F3A46] font-bold shrink-0 shadow-sm mt-1">
// //                       AI
// //                     </div>
// //                   )}

// //                   <div
// //                     className={`p-5 rounded-2xl break-words transition-all duration-200 ${
// //                       msg.sender === "bot"
// //                         ? "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm w-full md:max-w-[85%]"
// //                         : "bg-gradient-to-br from-[#0F3A46] to-[#154b5a] text-white shadow-md rounded-tr-sm max-w-[75%] shrink-0 ml-auto"
// //                     }`}
// //                   >
// //                     {typeof msg.text === "string" && (
// //                       <div className="whitespace-pre-wrap text-sm leading-relaxed tracking-normal font-normal">
// //                         <ReactMarkdown
// //                           remarkPlugins={[remarkGfm, remarkMath]}
// //                           rehypePlugins={[rehypeKatex]}
// //                         >
// //                           {msg.text}
// //                         </ReactMarkdown>
// //                       </div>
// //                     )}

// //                     {typeof msg.text === "object" && (
// //                       <div className="flex flex-col gap-3 w-full">
// //                         {msg.text.text && (
// //                           <div className="whitespace-pre-wrap text-sm leading-relaxed">
// //                             {msg.text.text}
// //                           </div>
// //                         )}
// //                         <div className="w-full bg-white rounded-xl border border-gray-100 overflow-hidden shadow-inner">
// //                           <iframe
// //                             srcDoc={msg.text.html}
// //                             title="Embedded Report"
// //                             sandbox="allow-scripts"
// //                             className="w-full border-0"
// //                             style={{ height: "520px" }}
// //                           />
// //                         </div>
// //                       </div>
// //                     )}
// //                   </div>
// //                 </div>
// //               ))}

// //               {loading && (
// //                 <div className="flex gap-3 items-center self-start w-full max-w-7xl mx-auto">
// //                   <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs animate-spin text-[#0F3A46] font-bold shrink-0">
// //                     ✦
// //                   </div>
// //                   <div className="px-4 py-3 rounded-2xl bg-white border border-gray-100 text-gray-400 italic text-sm animate-pulse shadow-sm rounded-tl-sm">
// //                     Analyzing data workspace...
// //                   </div>
// //                 </div>
// //               )}
// //               <div ref={messagesEndRef} />
// //             </div>

// //             {/* FIXED: Formatted input footer stays attached to base inside view limits */}
// //             <div className="border-t border-gray-100 p-4 bg-white shrink-0">
// //               <div className="max-w-5xl mx-auto flex gap-2.5 items-center bg-gray-50 border border-gray-200 rounded-xl p-2 focus-within:border-[#0F3A46] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0F3A46]/5 transition-all">
// //                 <textarea
// //                   value={input}
// //                   onChange={(e) => setInput(e.target.value)}
// //                   onKeyDown={handleKeyDown}
// //                   placeholder="Send a follow-up message..."
// //                   disabled={loading}
// //                   rows={1}
// //                   className="flex-1 bg-transparent border-none outline-none resize-none overflow-y-auto max-h-32 text-sm text-gray-800 placeholder-gray-400 py-1.5 px-2"
// //                 />
// //                 <button
// //                   onClick={sendMessage}
// //                   disabled={loading || !input.trim()}
// //                   className="bg-[#0F3A46] text-white px-4 py-2 rounded-lg hover:bg-[#0C2A35] transition font-medium text-xs shadow-sm disabled:opacity-30 shrink-0 h-9"
// //                 >
// //                   {loading ? "..." : "Send"}
// //                 </button>
// //               </div>
// //             </div>
// //           </>
// //         ) : (
// //           /* PREMIUM DOCK CENTERING SYSTEM (ZERO CONTENT STATE) */
// //           <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-b from-white to-[#F9FBFC]">
// //             <div className="w-full max-w-4xl flex flex-col items-center gap-10 text-center px-4">
// //               <div className="flex flex-col items-center gap-3">
// //                 <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0F3A46] to-[#154b5a] flex items-center justify-center text-white shadow-xl mb-2">
// //                   <svg
// //                     className="w-8 h-8"
// //                     fill="none"
// //                     stroke="currentColor"
// //                     strokeWidth={2}
// //                     viewBox="0 0 24 24"
// //                   >
// //                     <path
// //                       strokeLinecap="round"
// //                       strokeLinejoin="round"
// //                       d="M9.813 15.904L9 21L14.907 15.904L21 18L18 3L3 12L9.813 15.904Z"
// //                     />
// //                   </svg>
// //                 </div>
// //                 <h1 className="text-3xl font-bold tracking-tight text-gray-900">
// //                   How can{" "}
// //                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F3A46] to-blue-600">
// //                     R-AI
// //                   </span>{" "}
// //                   assist you today?
// //                 </h1>
// //                 <p className="text-gray-500 text-sm max-w-md">
// //                   Query project operational statuses, structural reports, or
// //                   financial variants instantly.
// //                 </p>
// //               </div>

// //               <div className="w-full max-w-2xl bg-white rounded-2xl border border-gray-200 p-3.5 flex items-center gap-3 shadow-md focus-within:border-[#0F3A46] focus-within:ring-2 focus-within:ring-[#0F3A46]/10 transition-all duration-300">
// //                 <textarea
// //                   value={input}
// //                   onChange={(e) => setInput(e.target.value)}
// //                   onKeyDown={handleKeyDown}
// //                   placeholder="Ask any financial balance or analytics metric..."
// //                   disabled={loading}
// //                   rows={1}
// //                   className="flex-1 bg-transparent border-none outline-none resize-none overflow-y-auto max-h-24 text-sm text-gray-800 placeholder-gray-400 self-center py-2 pl-2"
// //                 />
// //                 <button
// //                   onClick={sendMessage}
// //                   disabled={loading || !input.trim()}
// //                   className="p-2.5 rounded-xl text-white bg-[#0F3A46] hover:bg-[#0C2A35] shadow-sm transition-all duration-200 disabled:opacity-20 shrink-0"
// //                 >
// //                   <svg
// //                     className="w-4 h-4 transform rotate-90"
// //                     fill="currentColor"
// //                     viewBox="0 0 20 20"
// //                   >
// //                     <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
// //                   </svg>
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default ChatBot;

// import React, { useState, useRef, useEffect } from "react";
// import axios from "axios";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import remarkMath from "remark-math";
// import rehypeKatex from "rehype-katex";
// import { backendUrl } from "./config";
// import "katex/dist/katex.min.css";

// // // Updated template configurations using standard, unmistakable placeholder formats
// // const ANALYTICAL_SUGGESTIONS = [
// //   {
// //     id: "variance",
// //     title: "📊 Variance Report",
// //     templateText:
// //       "Generate variance report for project [PROJECT_ID] budget version 1 vs EAC version 3",
// //     placeholderToSelect: "[PROJECT_ID]",
// //   },
// //   {
// //     id: "revenue",
// //     title: "📈 Revenue Analysis",
// //     templateText: "Get revenue analysis for project [PROJECT_ID] for year 2026",
// //     placeholderToSelect: "[PROJECT_ID]",
// //   },
// //   {
// //     id: "stats",
// //     title: "🔍 Project Stats",
// //     templateText: "Show stats for project [PROJECT_ID]",
// //     placeholderToSelect: "[PROJECT_ID]",
// //   },
// //   {
// //     id: "employee",
// //     title: "👥 Employee Performance",
// //     templateText: "Get performance summary for employee [EMPLOYEE_ID]",
// //     placeholderToSelect: "[EMPLOYEE_ID]",
// //   },
// //   {
// //     id: "budget_eac",
// //     title: "🛠️ Create Budget",
// //     templateText:
// //       "Create budget version for project [PROJECT_ID] from latest approved EAC",
// //     placeholderToSelect: "[PROJECT_ID]",
// //   },
// // ];

// const ChatBot = () => {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);

//   const messagesEndRef = useRef(null);
//   // Separate DOM references tracking active view state inputs
//   const activeChatInputRef = useRef(null);
//   const landingInputRef = useRef(null);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const sendMessage = async () => {
//     const messageText = input.trim();
//     if (!messageText) return;

//     setMessages((prev) => [...prev, { sender: "user", text: messageText }]);
//     setInput("");
//     setLoading(true);

//     try {
//       const response = await axios.post(
//         `${backendUrl}/api/Chat`,
//         JSON.stringify(messageText),
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Accept: "text/html, text/plain",
//           },
//           responseType: "text",
//         },
//       );

//       let botResponse =
//         response.data.answer ||
//         response.data.response ||
//         response.data.message ||
//         (typeof response.data === "string" ? response.data : "");

//       if (typeof botResponse === "string") {
//         if (botResponse.includes("```html")) {
//           const parts = botResponse.split("```html");
//           const introText = parts[0];
//           const htmlContent = parts[1].split("```")[0];
//           botResponse = { text: introText, html: htmlContent };
//         } else if (
//           botResponse.trim().startsWith("<!DOCTYPE") ||
//           botResponse.trim().startsWith("<html")
//         ) {
//           botResponse = { text: "", html: botResponse };
//         }
//       }

//       setMessages((prev) => [...prev, { sender: "bot", text: botResponse }]);
//     } catch (err) {
//       if (err.response && err.response.status === 503) {
//         window.location.href = "/service-unavailable";
//         return;
//       }

//       setMessages((prev) => [
//         ...prev,
//         { sender: "bot", text: "Error! Please try again." },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       if (!loading) sendMessage();
//     }
//   };

//   // Sets text, targets the target placeholder token, and applies selection ranges automatically
//   const handleApplyTemplate = (item) => {
//     setInput(item.templateText);

//     // Determine which textarea element is active in current DOM state layout
//     const targetInputEl =
//       messages.length > 0
//         ? activeChatInputRef.current
//         : landingInputRef.current;

//     if (targetInputEl) {
//       // Small timeout allows React state sync to finish drawing raw values into the DOM field layout
//       setTimeout(() => {
//         targetInputEl.focus();
//         const startIdx = item.templateText.indexOf(item.placeholderToSelect);
//         if (startIdx !== -1) {
//           const endIdx = startIdx + item.placeholderToSelect.length;
//           targetInputEl.setSelectionRange(startIdx, endIdx);
//         }
//       }, 50);
//     }
//   };

//   const hasStartedChat = messages.length > 0;

//   return (
//     <div className="w-full h-screen flex flex-col bg-white overflow-hidden font-sans">
//       {/* Top Professional Header */}
//       {hasStartedChat && (
//         <div className="w-full bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center select-none shrink-0 z-10">
//           <div className="flex items-center gap-3">
//             <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0F3A46] to-[#1d5869] flex items-center justify-center shadow-sm">
//               <svg
//                 className="w-4 h-4 text-white"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth={2.5}
//                 viewBox="0 0 24 24"
//               >
//                 <path d="M9.813 15.904L9 21L14.907 15.904L21 18L18 3L3 12L9.813 15.904Z" />
//               </svg>
//             </div>
//             <div>
//               <h2 className="font-semibold text-gray-800 text-base leading-none">
//                 R-AI
//               </h2>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Main Container Area */}
//       <div className="flex-1 flex flex-col bg-[#F9FBFC] relative overflow-hidden">
//         {hasStartedChat ? (
//           <>
//             {/* Active History Feed View Container */}
//             <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
//               {messages.map((msg, i) => (
//                 <div
//                   key={i}
//                   className={`flex gap-3 w-full max-w-7xl mx-auto ${msg.sender === "bot" ? "justify-start" : "justify-end"}`}
//                 >
//                   {msg.sender === "bot" && (
//                     <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-xs text-[#0F3A46] font-bold shrink-0 shadow-sm mt-1">
//                       AI
//                     </div>
//                   )}

//                   <div
//                     className={`p-5 rounded-2xl break-words transition-all duration-200 ${msg.sender === "bot" ? "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm w-full md:max-w-[85%]" : "bg-gradient-to-br from-[#0F3A46] to-[#154b5a] text-white shadow-md rounded-tr-sm max-w-[75%] shrink-0 ml-auto"}`}
//                   >
//                     {typeof msg.text === "string" && (
//                       <div className="whitespace-pre-wrap text-sm leading-relaxed tracking-normal font-normal">
//                         <ReactMarkdown
//                           remarkPlugins={[remarkGfm, remarkMath]}
//                           rehypePlugins={[rehypeKatex]}
//                         >
//                           {msg.text}
//                         </ReactMarkdown>
//                       </div>
//                     )}

//                     {typeof msg.text === "object" && (
//                       <div className="flex flex-col gap-3 w-full">
//                         {msg.text.text && (
//                           <div className="whitespace-pre-wrap text-sm leading-relaxed">
//                             {msg.text.text}
//                           </div>
//                         )}
//                         <div className="w-full bg-white rounded-xl border border-gray-100 overflow-hidden shadow-inner">
//                           <iframe
//                             srcDoc={msg.text.html}
//                             title="Embedded Report"
//                             sandbox="allow-scripts"
//                             className="w-full border-0"
//                             style={{ height: "520px" }}
//                           />
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ))}

//               {loading && (
//                 <div className="flex gap-3 items-center self-start w-full max-w-7xl mx-auto">
//                   <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs animate-spin text-[#0F3A46] font-bold shrink-0">
//                     ✦
//                   </div>
//                   <div className="px-4 py-3 rounded-2xl bg-white border border-gray-100 text-gray-400 italic text-sm animate-pulse shadow-sm rounded-tl-sm">
//                     Analyzing data workspace...
//                   </div>
//                 </div>
//               )}
//               <div ref={messagesEndRef} />
//             </div>

//             {/* Persistent Input Dashboard Footer */}
//             <div className="border-t border-gray-100 p-4 bg-white shrink-0">
//               {/* <div className="max-w-5xl mx-auto mb-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
//                 <span className="text-xs font-semibold text-gray-400 shrink-0 mr-1">
//                   Templates:
//                 </span>
//                 {ANALYTICAL_SUGGESTIONS.map((item) => (
//                   <button
//                     key={item.id}
//                     type="button"
//                     onClick={() => handleApplyTemplate(item)}
//                     className="text-xs bg-gray-50 border border-gray-200 text-gray-700 font-medium px-3 py-1.5 rounded-full hover:border-[#0F3A46] hover:bg-white hover:text-[#0F3A46] transition whitespace-nowrap shadow-sm"
//                   >
//                     {item.title}
//                   </button>
//                 ))}
//               </div> */}

//               <div className="max-w-5xl mx-auto flex gap-2.5 items-center bg-gray-50 border border-gray-200 rounded-xl p-2 focus-within:border-[#0F3A46] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0F3A46]/5 transition-all">
//                 <textarea
//                   ref={activeChatInputRef}
//                   value={input}
//                   onChange={(e) => setInput(e.target.value)}
//                   onKeyDown={handleKeyDown}
//                   placeholder="Type an analytical request or use a macro template chip above..."
//                   disabled={loading}
//                   rows={1}
//                   className="flex-1 bg-transparent border-none outline-none resize-none overflow-y-auto max-h-32 text-sm text-gray-800 placeholder-gray-400 py-1.5 px-2"
//                 />
//                 <button
//                   onClick={sendMessage}
//                   disabled={loading || !input.trim()}
//                   className="bg-[#0F3A46] text-white px-4 py-2 rounded-lg hover:bg-[#0C2A35] transition font-medium text-xs shadow-sm disabled:opacity-30 shrink-0 h-9"
//                 >
//                   {loading ? "..." : "Send"}
//                 </button>
//               </div>
//             </div>
//           </>
//         ) : (
//           /* PREMIUM DOCK CENTERING SYSTEM (ZERO CONTENT LANDING STATE) */
//           <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-b from-white to-[#F9FBFC]">
//             <div className="w-full max-w-4xl flex flex-col items-center gap-8 text-center px-4">
//               <div className="flex flex-col items-center gap-3">
//                 <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0F3A46] to-[#154b5a] flex items-center justify-center text-white shadow-xl mb-2">
//                   <svg
//                     className="w-8 h-8"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth={2}
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       d="M9.813 15.904L9 21L14.907 15.904L21 18L18 3L3 12L9.813 15.904Z"
//                     />
//                   </svg>
//                 </div>
//                 <h1 className="text-3xl font-bold tracking-tight text-gray-900">
//                   How can{" "}
//                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F3A46] to-blue-600">
//                     R-AI
//                   </span>{" "}
//                   assist you today?
//                 </h1>
//                 {/* <p className="text-gray-500 text-sm max-w-md">
//                   Query project operational statuses, structural reports, or
//                   financial variants instantly.
//                 </p> */}
//               </div>

//               {/* Suggestions Quick Chips Section */}
//               {/* <div className="w-full max-w-2xl flex flex-wrap justify-center gap-2.5">
//                 {ANALYTICAL_SUGGESTIONS.map((item) => (
//                   <button
//                     key={item.id}
//                     type="button"
//                     onClick={() => handleApplyTemplate(item)}
//                     className="text-xs font-medium bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:border-[#0F3A46] hover:text-[#0F3A46] hover:shadow-sm transition flex items-center gap-1.5"
//                   >
//                     {item.title}
//                   </button>
//                 ))}
//               </div> */}

//               {/* Main Landing Text Area Zone Input */}
//               <div className="w-full max-w-2xl bg-white rounded-2xl border border-gray-200 p-3.5 flex items-center gap-3 shadow-md focus-within:border-[#0F3A46] focus-within:ring-2 focus-within:ring-[#0F3A46]/10 transition-all duration-300">
//                 <textarea
//                   ref={landingInputRef}
//                   value={input}
//                   onChange={(e) => setInput(e.target.value)}
//                   onKeyDown={handleKeyDown}
//                   placeholder="Ask any unit budgets, forecast figures..."
//                   disabled={loading}
//                   rows={1}
//                   className="flex-1 bg-transparent border-none outline-none resize-none overflow-y-auto max-h-24 text-sm text-gray-800 placeholder-gray-400 self-center py-2 pl-2"
//                 />
//                 <button
//                   onClick={sendMessage}
//                   disabled={loading || !input.trim()}
//                   className="p-2.5 rounded-xl text-white bg-[#0F3A46] hover:bg-[#0C2A35] shadow-sm transition-all duration-200 disabled:opacity-20 shrink-0"
//                 >
//                   <svg
//                     className="w-4 h-4 transform rotate-90"
//                     fill="currentColor"
//                     viewBox="0 0 20 20"
//                   >
//                     <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
//                   </svg>
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ChatBot;

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { backendUrl } from "./config";
import "katex/dist/katex.min.css";

const FONT_IMPORT = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
`;

const colorForCell = (text) => {
  if (typeof text !== "string") return "#374151";
  const t = text.trim();
  if (!/^-?\$/.test(t)) return "#374151";
  return t.startsWith("-") ? "#DC2626" : "#16A34A";
};

// Groups sessions into Today / Yesterday / Previous 7 Days / Older, the
// same bucketing convention most chat history panels use.
const groupSessionsByDate = (sessions) => {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const sevenDaysAgo = new Date(startOfToday);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const buckets = {
    Today: [],
    Yesterday: [],
    "Previous 7 Days": [],
    Older: [],
  };

  sessions.forEach((s) => {
    const updated = new Date(s.lastUpdated || s.LastUpdated);
    if (updated >= startOfToday) buckets.Today.push(s);
    else if (updated >= startOfYesterday) buckets.Yesterday.push(s);
    else if (updated >= sevenDaysAgo) buckets["Previous 7 Days"].push(s);
    else buckets.Older.push(s);
  });

  return Object.entries(buckets).filter(([, items]) => items.length > 0);
};

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // History state
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const activeChatInputRef = useRef(null);
  const landingInputRef = useRef(null);

  const getUserId = () => {
    try {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        return parsedUser.userId || null;
      }
    } catch (e) {
      console.error("Failed to parse currentUser from localStorage", e);
    }
    return null;
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    const userId = getUserId();
    if (!userId) {
      setSessionsLoading(false);
      return;
    }
    try {
      const res = await axios.get(
        `${backendUrl}/api/chat/sessions?userId=${userId}`,
      );
      if (res.data) {
        setSessions(res.data);
      }
    } catch (err) {
      console.error("Error fetching chat sessions", err);
    } finally {
      setSessionsLoading(false);
    }
  };

  // Safely format/parse bot responses and HTML dashboards
  const formatBotResponse = (rawData) => {
    try {
      if (
        typeof rawData === "string" &&
        (rawData.trim().startsWith("{") || rawData.trim().startsWith("["))
      ) {
        const parsed = JSON.parse(rawData);
        rawData = parsed.answer || parsed.response || parsed.message || rawData;
      }
    } catch (e) {
      // not JSON, fall through to raw string handling
    }

    if (typeof rawData === "string") {
      if (rawData.includes("```html")) {
        const parts = rawData.split("```html");
        return {
          text: parts[0],
          html: parts[1].split("```")[0],
          mode: "dashboard",
        };
      } else if (
        rawData.trim().startsWith("<!DOCTYPE") ||
        rawData.trim().startsWith("<html")
      ) {
        return { text: "", html: rawData, mode: "dashboard" };
      }
      return { text: rawData, html: null, mode: "text" };
    } else if (typeof rawData === "object" && rawData !== null) {
      return {
        text: rawData.text || rawData.answer || "",
        html: rawData.html || null,
        mode: rawData.html ? "dashboard" : "text",
      };
    }
    return { text: String(rawData), html: null, mode: "text" };
  };

  const loadSession = async (sessionId) => {
    if (sessionId === currentSessionId) return;
    const userId = getUserId();
    if (!userId) return;
    setHistoryLoading(true);
    try {
      const res = await axios.get(
        `${backendUrl}/api/chat/history?sessionId=${sessionId}&userId=${userId}`,
      );
      if (res.data && Array.isArray(res.data)) {
        const loadedMessages = [];
        res.data.forEach((item) => {
          if (item.userQuery) {
            loadedMessages.push({ sender: "user", text: item.userQuery });
          }
          if (item.assistantResponse) {
            loadedMessages.push({
              sender: "bot",
              text: formatBotResponse(item.assistantResponse),
            });
          }
        });
        setMessages(loadedMessages);
        setCurrentSessionId(sessionId);
      }
    } catch (err) {
      console.error("Error loading session history", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setInput("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const messageText = input.trim();
    if (!messageText) return;

    const userId = getUserId();
    setMessages((prev) => [...prev, { sender: "user", text: messageText }]);
    setInput("");
    setLoading(true);

    try {
      const payload = currentSessionId
        ? {
            prompt: messageText,
            userId: userId,
            sessionId: currentSessionId,
          }
        : {
            prompt: messageText,
            userId: userId,
          };

      const response = await axios.post(
        `${backendUrl}/api/Chat`,
        JSON.stringify(payload),
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "text/html, text/plain, application/json",
          },
          responseType: "text",
        },
      );

      let rawData = response.data;

      // Pull the sessionId out of the envelope BEFORE formatBotResponse
      // unwraps/discards it, and lock the conversation onto it. This is
      // the piece that was missing — without it, every message left
      // currentSessionId as null, so the backend minted a new session
      // per query instead of appending to one thread.
      try {
        if (typeof rawData === "string" && rawData.trim().startsWith("{")) {
          const parsedEnvelope = JSON.parse(rawData);
          if (parsedEnvelope.sessionId) {
            setCurrentSessionId(parsedEnvelope.sessionId);
          }
        }
      } catch (e) {
        // not a JSON envelope, nothing to capture
      }

      const botResponse = formatBotResponse(rawData);
      setMessages((prev) => [...prev, { sender: "bot", text: botResponse }]);
      fetchSessions();
    } catch (err) {
      if (err.response && err.response.status === 503) {
        window.location.href = "/service-unavailable";
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: {
            text: "An error occurred while communicating with the planning service workspace. Please verify your connection or try again.",
            html: null,
            mode: "text",
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading) sendMessage();
    }
  };

  const hasStartedChat = messages.length > 0;
  const groupedSessions = groupSessionsByDate(sessions);

  const tableComponents = {
    table: ({ node, ...props }) => (
      <div
        className="overflow-x-auto my-3 rounded-md"
        style={{ border: "1px solid #E5E7EB" }}
      >
        <table className="min-w-full text-left text-xs" {...props} />
      </div>
    ),
    thead: ({ node, ...props }) => (
      <thead style={{ background: "#F3F4F6" }} {...props} />
    ),
    th: ({ node, ...props }) => (
      <th
        className="px-3 py-2  tracking-wider text-[10px] font-semibold"
        style={{ color: "#4B5563", borderBottom: "1px solid #E5E7EB" }}
        {...props}
      />
    ),
    td: ({ node, children, ...props }) => {
      const text = Array.isArray(children) ? children.join("") : children;
      return (
        <td
          className="px-3 py-2 whitespace-nowrap text-xs"
          style={{ color: colorForCell(text), borderTop: "1px solid #F1F2F4" }}
          {...props}
        >
          {children}
        </td>
      );
    },
    code: ({ node, ...props }) => (
      <code
        style={{
          background: "#F3F4F6",
          padding: "1px 5px",
          borderRadius: "4px",
          fontSize: "12px",
        }}
        {...props}
      />
    ),
  };

  return (
    <div
      className="w-full h-[95vh] flex overflow-hidden bg-white"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <style>{FONT_IMPORT}</style>

      {/* History Sidebar */}
      <div
        className={`flex flex-col shrink-0 transition-all duration-300 border-r ${
          sidebarOpen ? "w-72" : "w-0 overflow-hidden"
        }`}
        style={{ background: "#0E2F38", borderColor: "#154B5A" }}
      >
        <div className="p-3.5 border-b" style={{ borderColor: "#154B5A" }}>
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-xs font-semibold  tracking-wider"
              style={{ color: "#9FC2CE" }}
            >
              Chat History
            </span>
          </div>
          <button
            onClick={startNewChat}
            className="w-full text-xs px-3 py-2 cursor-pointer rounded-md transition flex items-center justify-center gap-1.5 font-semibold"
            style={{ background: "#FFFFFF", color: "#17414d" }}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-3">
          {sessionsLoading ? (
            <div
              className="text-center py-6 text-xs"
              style={{ color: "#7B9EAC" }}
            >
              Loading history…
            </div>
          ) : sessions.length === 0 ? (
            <div
              className="text-center py-6 px-3 text-xs leading-relaxed"
              style={{ color: "#7B9EAC" }}
            >
              No past conversations yet. Start a chat and it will show up here.
            </div>
          ) : (
            groupedSessions.map(([label, items]) => (
              <div key={label}>
                <div
                  className="px-2.5 pb-1.5 text-[10px] cursor-pointer font-semibold  tracking-wider"
                  style={{ color: "#5F8896" }}
                >
                  {label}
                </div>
                <div className="flex flex-col gap-0.5">
                  {items.map((session) => {
                    const sId = session.sessionId || session.SessionId;
                    const sTitle =
                      session.title || session.Title || "New conversation";
                    const isSelected = currentSessionId === sId;

                    return (
                      <button
                        key={sId}
                        onClick={() => loadSession(sId)}
                        className="w-full text-left px-2.5 py-2 rounded-md cursor-pointer text-xs truncate transition flex items-center gap-2"
                        style={{
                          background: isSelected ? "#154B5A" : "transparent",
                          color: isSelected ? "#FFFFFF" : "#C5DCE4",
                        }}
                      >
                        <svg
                          className="w-3.5 h-3.5 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                          />
                        </svg>
                        <span className="truncate">{sTitle}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-white">
        {/* Header */}
        <div
          className="w-full px-4 py-3.5 flex justify-between items-center select-none shrink-0 z-10"
          style={{ background: "linear-gradient(90deg, #0E2F38, #154B5A)" }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-md cursor-pointer transition text-white hover:bg-white/10"
              title="Toggle Sidebar"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="#5EA8C4"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path d="M9.813 15.904L9 21L14.907 15.904L21 18L18 3L3 12L9.813 15.904Z" />
              </svg>
            </div>
            <div className="leading-tight">
              <h2 className="text-sm font-semibold text-white">R-AI</h2>
              <p className="text-[11px]" style={{ color: "#9FC2CE" }}>
                Planning Assistant
              </p>
            </div>
          </div>
          <div
            className="hidden sm:flex items-center gap-2 text-[11px]"
            style={{ color: "#9FC2CE" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: loading ? "#FBBF24" : "#34D399" }}
            />
            {loading ? "Working" : "Connected"}
          </div>
        </div>

        {/* Message Container / Landing */}
        <div
          className="flex-1 flex flex-col relative overflow-hidden"
          style={{ background: "#F8FAFB" }}
        >
          {historyLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div
                className="flex items-center gap-2 text-sm"
                style={{ color: "#6B7280" }}
              >
                <span className="flex gap-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: "#2563EB" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: "#2563EB", animationDelay: "0.12s" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: "#2563EB", animationDelay: "0.24s" }}
                  />
                </span>
                Loading conversation…
              </div>
            </div>
          ) : hasStartedChat ? (
            <>
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 w-full max-w-5xl mx-auto ${msg.sender === "bot" ? "justify-start" : "justify-end"}`}
                  >
                    {msg.sender === "bot" && (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-1"
                        style={{ background: "#0E2F38", color: "#5EA8C4" }}
                      >
                        AI
                      </div>
                    )}
                    <div
                      className={`p-4 rounded-xl break-words ${
                        msg.sender === "bot"
                          ? typeof msg.text === "object" && msg.text?.html
                            ? "w-full max-w-4xl"
                            : "max-w-[85%] md:max-w-[75%]"
                          : "ml-auto max-w-[85%] md:max-w-[75%]"
                      }`}
                      style={
                        msg.sender === "bot"
                          ? {
                              background: "#FFFFFF",
                              color: "#1F2937",
                              border: "1px solid #E5E7EB",
                              boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
                            }
                          : {
                              background:
                                "linear-gradient(135deg, #0E2F38, #154B5A)",
                              color: "#FFFFFF",
                            }
                      }
                    >
                      {typeof msg.text === "string" && (
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                          >
                            {msg.text}
                          </ReactMarkdown>
                        </div>
                      )}

                      {typeof msg.text === "object" && msg.text !== null && (
                        <div className="flex flex-col gap-3 w-full">
                          {msg.text.text && (
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                                components={tableComponents}
                              >
                                {msg.text.text}
                              </ReactMarkdown>
                            </div>
                          )}

                          {msg.text.html && (
                            <div
                              className="w-full rounded-lg overflow-hidden mt-1 flex flex-col"
                              style={{
                                border: "1px solid #E5E7EB",
                                width: "100%",
                              }}
                            >
                              <div
                                className="px-3 py-1.5 text-[10px]  tracking-wider flex items-center gap-2 font-medium shrink-0"
                                style={{
                                  background: "#F3F4F6",
                                  color: "#6B7280",
                                  borderBottom: "1px solid #E5E7EB",
                                }}
                              >
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ background: "#2563EB" }}
                                />
                                Report Dashboard
                              </div>
                              <iframe
                                srcDoc={msg.text.html}
                                title="Embedded Dashboard Report"
                                sandbox="allow-scripts"
                                className="w-full border-0"
                                style={{ height: "500px" }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-3 items-center self-start w-full max-w-5xl mx-auto">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                      style={{ background: "#0E2F38", color: "#5EA8C4" }}
                    >
                      AI
                    </div>
                    <div
                      className="px-4 py-3 rounded-xl text-xs flex items-center gap-2"
                      style={{
                        background: "#FFFFFF",
                        color: "#6B7280",
                        border: "1px solid #E5E7EB",
                      }}
                    >
                      <span className="flex gap-1">
                        <span
                          className="w-1.5 h-1.5 rounded-full animate-bounce"
                          style={{ background: "#2563EB" }}
                        />
                        <span
                          className="w-1.5 h-1.5 rounded-full animate-bounce"
                          style={{
                            background: "#2563EB",
                            animationDelay: "0.12s",
                          }}
                        />
                        <span
                          className="w-1.5 h-1.5 rounded-full animate-bounce"
                          style={{
                            background: "#2563EB",
                            animationDelay: "0.24s",
                          }}
                        />
                      </span>
                      Analyzing data
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Persistent Input Footer */}
              <div
                className="p-4 shrink-0"
                style={{
                  background: "#FFFFFF",
                  borderTop: "1px solid #E5E7EB",
                }}
              >
                <div
                  className="max-w-4xl mx-auto flex gap-2.5 items-center rounded-lg p-2 transition-all focus-within:ring-2"
                  style={{ background: "#F8FAFB", border: "1px solid #E5E7EB" }}
                >
                  <textarea
                    ref={activeChatInputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about budgets, variances, forecasts…"
                    disabled={loading}
                    rows={1}
                    className="flex-1 bg-transparent border-none outline-none resize-none overflow-y-auto max-h-32 text-sm py-1.5 px-2"
                    style={{ color: "#1F2937" }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="px-4 py-2 rounded-md transition font-semibold text-xs shrink-0 h-9 disabled:opacity-30"
                    style={{ background: "#2563EB", color: "#FFFFFF" }}
                  >
                    {loading ? "…" : "Send"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* LANDING STATE */
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="w-full max-w-2xl flex flex-col items-center gap-8 text-center px-4">
                <div className="flex flex-col items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-1"
                    style={{
                      background: "linear-gradient(135deg, #0E2F38, #154B5A)",
                    }}
                  >
                    <svg
                      className="w-7 h-7"
                      fill="none"
                      stroke="#5EA8C4"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.813 15.904L9 21L14.907 15.904L21 18L18 3L3 12L9.813 15.904Z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h1
                      className="text-3xl font-bold tracking-tight"
                      style={{ color: "#111827" }}
                    >
                      How can <span style={{ color: "#2563EB" }}>R-AI</span>{" "}
                      assist you today?
                    </h1>
                    <p className="text-sm mt-2" style={{ color: "#6B7280" }}>
                      Budgets, forecasts, and variance — answered in plain
                      terms.
                    </p>
                  </div>
                </div>

                <div
                  className="w-full rounded-xl p-3.5 flex items-center gap-3 transition-all duration-200 focus-within:ring-2"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
                  }}
                >
                  <textarea
                    ref={landingInputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about unit budgets, forecast figures…"
                    disabled={loading}
                    rows={1}
                    className="flex-1 bg-transparent border-none outline-none resize-none overflow-y-auto max-h-24 text-sm self-center py-2 pl-2"
                    style={{ color: "#1F2937" }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="p-2.5 rounded-lg transition-all duration-200 shrink-0 disabled:opacity-20"
                    style={{ background: "#17414d", color: "#FFFFFF" }}
                  >
                    <svg
                      className="w-4 h-4 transform rotate-90"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  </button>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    "Show me all system budget assumptions",
                    "Find all vacant units with market rent under $4000/month",
                    "Which leases are expiring next month for property PROPERTY100?",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="text-xs px-3 py-1.5 rounded-full transition-colors hover:bg-gray-50"
                      style={{
                        border: "1px solid #E5E7EB",
                        color: "#4B5563",
                        background: "#FFFFFF",
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
