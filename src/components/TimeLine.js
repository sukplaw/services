import React from "react";
// import "./timeline.css"; // import css แยก

const steps = [
  {
    week: 2,
    title: "REQUIREMENTS",
    desc: "Lorem ipsum ...",
    side: "left",
    iconClass: "bi bi-file-earmark-text",
  },
  {
    week: 4,
    title: "DESIGNING PRODUCT",
    desc: "Lorem ipsum ...",
    side: "right",
    iconClass: "bi bi-lightbulb",
  },
  {
    week: 6,
    title: "CREATING SAMPLES",
    desc: "Lorem ipsum ...",
    side: "left",
    iconClass: "bi bi-phone",
  },
  {
    week: 8,
    title: "CREATING FINAL SAMPLES",
    desc: "Lorem ipsum ...",
    side: "right",
    iconClass: "bi bi-phone",
  },
];

function WeekBadge({ week }) {
  return (
    <div className="week-badge position-relative d-flex justify-content-center align-items-center">
      <svg viewBox="0 0 100 100" className="badge-ring">
        <circle cx="50" cy="50" r="42" className="badge-ring-bg" />
        <path d="M50,8 A42,42 0 0 1 92,50" className="badge-ring-accent" />
      </svg>
      <div className="week-text text-center">
        <div className="fw-semibold text-danger" style={{ fontSize: 28 }}>
          {week}
        </div>
        <div className="text-secondary" style={{ fontSize: 14 }}>
          Week
        </div>
      </div>
    </div>
  );
}

function SideCard({ title, desc, iconClass }) {
  return (
    <div className="d-inline-block text-start card-side">
      <div className="d-inline-flex align-items-center justify-content-center border rounded mb-2 icon-box">
        <i className={iconClass}></i>
      </div>
      <h6 className="fw-bold mb-1 text-uppercase text-danger">{title}</h6>
      <p className="mb-0 text-muted small">{desc}</p>
    </div>
  );
}

export default function TimelineBootstrap() {
  return (
    <div className="contain-status">
      <div className="text-center mb-4">
        <div className="fw-bold fs-3 text-dark">START</div>
      </div>

      <div className="timeline position-relative">
        <div className="d-flex flex-column gap-5">
          {steps.map((s, idx) => {
            const isLeft = s.side === "left";
            return (
              <div key={idx} className="row align-items-center g-3">
                <div
                  className={`col-12 col-md-5 order-2 order-md-1 ${
                    isLeft ? "pe-md-5" : ""
                  }`}
                >
                  {isLeft && (
                    <div className="position-relative d-flex justify-content-md-end align-items-center">
                      <span className="connector-dot d-none d-md-block"></span>
                      <SideCard {...s} />
                    </div>
                  )}
                </div>

                <div className="col-12 col-md-2 order-1 order-md-2 d-flex justify-content-center">
                  <WeekBadge week={s.week} />
                </div>

                <div
                  className={`col-12 col-md-5 order-3 ${
                    !isLeft ? "ps-md-5" : ""
                  }`}
                >
                  {!isLeft && (
                    <div className="position-relative d-flex justify-content-md-start align-items-center">
                      <span className="connector-dot d-none d-md-block"></span>
                      <SideCard {...s} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// import React from "react";

// /**
//  * Vertical Timeline — Bootstrap 5 version (matches the reference layout)
//  *
//  * Requirements:
//  * - Bootstrap 5 CSS loaded in your app
//  * - (Optional) Bootstrap Icons for the small icons next to each section title
//  *   CDN: https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css
//  */

// const steps = [
//   {
//     week: 2,
//     title: "REQUIREMENTS",
//     desc: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//     side: "left",
//     iconClass: "bi bi-file-earmark-text",
//   },
//   {
//     week: 4,
//     title: "DESIGNING PRODUCT",
//     desc: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//     side: "right",
//     iconClass: "bi bi-lightbulb",
//   },
//   {
//     week: 6,
//     title: "CREATING SAMPLES",
//     desc: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//     side: "left",
//     iconClass: "bi bi-phone",
//   },
//   {
//     week: 8,
//     title: "CREATING FINAL SAMPLES",
//     desc: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//     side: "right",
//     iconClass: "bi bi-phone",
//   },
// ];

// function WeekBadge({ week }) {
//   return (
//     <div className="position-relative" style={{ width: 96, height: 96 }}>
//       {/* Outer rings */}
//       <svg
//         viewBox="0 0 100 100"
//         className="position-absolute top-0 start-0 w-100 h-100"
//       >
//         <circle
//           cx="50"
//           cy="50"
//           r="42"
//           fill="none"
//           stroke="#2b2b2b"
//           strokeWidth="6"
//           opacity="0.95"
//         />
//         {/* top-right red arc */}
//         <path
//           d="M50,8 A42,42 0 0 1 92,50"
//           fill="none"
//           stroke="#e11d48"
//           strokeWidth="8"
//           strokeLinecap="round"
//         />
//       </svg>
//       {/* white center */}
//       <div
//         className="position-absolute top-50 start-50 translate-middle bg-white rounded-circle shadow-sm"
//         style={{ width: 86, height: 86 }}
//       />
//       {/* Text */}
//       <div className="position-absolute top-50 start-50 translate-middle text-center">
//         <div
//           className="fw-semibold"
//           style={{ fontSize: 28, lineHeight: 1, color: "#e11d48" }}
//         >
//           {week}
//         </div>
//         <div className="text-secondary" style={{ fontSize: 14 }}>
//           Week
//         </div>
//       </div>
//     </div>
//   );
// }

// function SideCard({ title, desc, iconClass, align }) {
//   return (
//     <div
//       className={`d-inline-block ${
//         align === "left" ? "text-start" : "text-start"
//       }`}
//       style={{ maxWidth: 260 }}
//     >
//       <div
//         className="d-inline-flex align-items-center justify-content-center border rounded me-0 mb-2"
//         style={{ width: 32, height: 32, borderColor: "#fda4af" }}
//       >
//         <i className={`${iconClass}`} style={{ color: "#e11d48" }}></i>
//       </div>
//       <h6
//         className="fw-bold mb-1"
//         style={{ letterSpacing: "0.16em", color: "#be123c" }}
//       >
//         {title}
//       </h6>
//       <p
//         className="mb-0"
//         style={{ fontSize: 13, lineHeight: 1.5, color: "#6b7280" }}
//       >
//         {desc}
//       </p>
//     </div>
//   );
// }

// export default function Timeline() {
//   return (
//     <div className="container py-4 py-md-5">
//       {/* START title */}
//       <div className="text-center mb-4 mb-md-5">
//         <div
//           className="fw-bold"
//           style={{ fontSize: 28, letterSpacing: "0.08em", color: "#1f2937" }}
//         >
//           START
//         </div>
//       </div>

//       {/* Timeline wrapper */}
//       <div className="position-relative timeline pb-3">
//         {/* Steps */}
//         <div className="d-flex flex-column gap-5">
//           {steps.map((s, idx) => {
//             const isLeft = s.side === "left";
//             return (
//               <div key={idx} className="row align-items-center g-3">
//                 {/* Left column (for left card) */}
//                 <div
//                   className={`col-12 col-md-5 order-2 order-md-1 ${
//                     isLeft ? "pe-md-5" : ""
//                   }`}
//                 >
//                   {isLeft && (
//                     <div className="position-relative d-flex justify-content-md-end align-items-center">
//                       <span className="d-none d-md-block connector-dot end-0"></span>
//                       <SideCard
//                         title={s.title}
//                         desc={s.desc}
//                         iconClass={s.iconClass}
//                         align="left"
//                       />
//                     </div>
//                   )}
//                 </div>

//                 {/* Center badge */}
//                 <div className="col-12 col-md-2 order-1 order-md-2 d-flex justify-content-center">
//                   <WeekBadge week={s.week} />
//                 </div>

//                 {/* Right column (for right card) */}
//                 <div
//                   className={`col-12 col-md-5 order-3 ${
//                     !isLeft ? "ps-md-5" : ""
//                   }`}
//                 >
//                   {!isLeft && (
//                     <div className="position-relative d-flex justify-content-md-start align-items-center">
//                       <span className="d-none d-md-block connector-dot start-0"></span>
//                       <SideCard
//                         title={s.title}
//                         desc={s.desc}
//                         iconClass={s.iconClass}
//                         align="right"
//                       />
//                     </div>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* Custom CSS specifically for the timeline visuals */}
//         <style>{`
//           .timeline::before {
//             content: "";
//             position: absolute;
//             top: 0;
//             bottom: 0;
//             left: 50%;
//             width: 3px;
//             background: #d1d5db; /* gray-300 */
//             transform: translateX(-50%);
//           }
//           .connector-dot {
//             position: absolute;
//             width: 12px;
//             height: 12px;
//             background: #1f2937; /* gray-800 */
//             border-radius: 50%;
//             transform: translateY(-50%);
//             top: 50%;
//           }
//         `}</style>
//       </div>
//     </div>
//   );
// }

// import { FileText, Lightbulb, Smartphone } from "lucide-react";
// import { motion } from "framer-motion";

// /**
//  * Vertical Timeline (START → Week 2,4,6,8) — styled to match the reference image
//  * - TailwindCSS required
//  * - Uses lucide-react for icons & framer-motion for subtle fade-ins
//  */

// const steps = [
//   {
//     week: 2,
//     title: "REQUIREMENTS",
//     desc: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//     side: "left",
//     Icon: FileText,
//   },
//   {
//     week: 4,
//     title: "DESIGNING PRODUCT",
//     desc: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//     side: "right",
//     Icon: Lightbulb,
//   },
//   {
//     week: 6,
//     title: "CREATING SAMPLES",
//     desc: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//     side: "left",
//     Icon: Smartphone,
//   },
//   {
//     week: 8,
//     title: "CREATING FINAL SAMPLES",
//     desc: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//     side: "right",
//     Icon: Smartphone,
//   },
// ];

// function WeekBadge({ week }: { week: number }) {
//   return (
//     <div className="relative h-24 w-24 shrink-0">
//       {/* Outer ring (SVG) to recreate the gray ring + red quarter arc */}
//       <svg viewBox="0 0 100 100" className="absolute inset-0">
//         {/* full gray ring */}
//         <circle
//           cx="50"
//           cy="50"
//           r="42"
//           fill="none"
//           stroke="#2b2b2b"
//           strokeWidth="6"
//           opacity={0.95}
//         />
//         {/* red accent arc (top-right quarter ~90deg) */}
//         <path
//           d="M50,8 A42,42 0 0 1 92,50"
//           fill="none"
//           stroke="#e11d48" /* rose-600 */
//           strokeWidth="8"
//           strokeLinecap="round"
//         />
//       </svg>
//       {/* white inner circle */}
//       <div className="absolute inset-1 rounded-full bg-white grid place-items-center shadow-sm" />
//       {/* Text */}
//       <div className="absolute inset-0 grid place-items-center">
//         <div className="text-center">
//           <div className="text-3xl font-semibold text-rose-600 leading-none">
//             {week}
//           </div>
//           <div className="text-sm text-gray-600">Week</div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function SideCard({ title, desc, Icon, align }: any) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 8 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       viewport={{ once: true, margin: "-40px" }}
//       transition={{ duration: 0.4 }}
//       className={`max-w-[260px] ${
//         align === "left" ? "text-left" : "text-left md:text-left"
//       }`}
//     >
//       <div
//         className={`mb-3 inline-flex h-8 w-8 items-center justify-center rounded-md border border-rose-600/50`}
//       >
//         <Icon className="h-5 w-5 text-rose-600" />
//       </div>
//       <h3 className="tracking-[0.16em] text-sm font-extrabold text-rose-700">
//         {title}
//       </h3>
//       <p className="mt-2 text-[13px] leading-5 text-gray-600">{desc}</p>
//     </motion.div>
//   );
// }

// export default function TimelineVertical() {
//   return (
//     <div className="w-full py-10 md:py-16">
//       <div className="mx-auto max-w-5xl px-4">
//         {/* Title */}
//         <div className="mb-8 text-center md:mb-12">
//           <div className="text-2xl md:text-3xl font-bold tracking-widest text-gray-800">
//             START
//           </div>
//         </div>

//         {/* Timeline wrapper */}
//         <div className="relative">
//           {/* Center vertical line */}
//           <div className="absolute left-1/2 top-0 h-full w-[3px] -translate-x-1/2 bg-gray-300" />

//           <div className="space-y-16">
//             {steps.map((s, idx) => {
//               const isLeft = s.side === "left";
//               return (
//                 <div
//                   key={idx}
//                   className="relative grid grid-cols-1 items-center gap-6 md:grid-cols-2"
//                 >
//                   {/* LEFT column (for left-side card) */}
//                   <div
//                     className={`order-2 md:order-1 ${
//                       isLeft ? "md:pr-14" : "md:pr-0"
//                     }`}
//                   >
//                     {isLeft && (
//                       <div className="relative flex items-center md:justify-end">
//                         {/* connector dot */}
//                         <div className="hidden md:block absolute right-[-14px] h-3 w-3 rounded-full bg-gray-800" />
//                         <SideCard
//                           title={s.title}
//                           desc={s.desc}
//                           Icon={s.Icon}
//                           align="left"
//                         />
//                       </div>
//                     )}
//                   </div>

//                   {/* CENTER badge */}
//                   <div className="order-1 md:order-none flex items-center justify-center">
//                     <WeekBadge week={s.week} />
//                   </div>

//                   {/* RIGHT column (for right-side card) */}
//                   <div className={`order-3 ${isLeft ? "" : "md:pl-14"}`}>
//                     {!isLeft && (
//                       <div className="relative flex items-center md:justify-start">
//                         {/* connector dot */}
//                         <div className="hidden md:block absolute left-[-14px] h-3 w-3 rounded-full bg-gray-800" />
//                         <SideCard
//                           title={s.title}
//                           desc={s.desc}
//                           Icon={s.Icon}
//                           align="right"
//                         />
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
