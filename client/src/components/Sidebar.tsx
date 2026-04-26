import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "block rounded px-3 py-2 text-sm",
    isActive ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-100",
  ].join(" ");

export default function Sidebar() {
  return (
    <aside className="border-r bg-white p-4">
        <h2 className="font-semibold mb-4">Dashboard</h2>
        <nav className="space-y-2">
            <NavLink to="/dashboard" end className={linkClass}>
                Tổng quan
            </NavLink>
            <NavLink to="/dashboard/instructor" className={linkClass}>
                Instructor
            </NavLink>
            <NavLink to="/dashboard/admin" className={linkClass}>
                Admin
            </NavLink>
        </nav>
    </aside>

    // <>
    //   {/* Navigation Toggle */}
    //   <div className="lg:hidden py-16 text-center">
    //     <button
    //       type="button"
    //       className="py-2 px-3 inline-flex justify-center items-center gap-x-2 text-start bg-secondary border border-secondary-line text-secondary-foreground text-sm font-medium rounded-lg shadow-2xs hover:bg-secondary-hover focus:outline-hidden focus:bg-secondary-focus"
    //       aria-haspopup="dialog"
    //       aria-expanded="false"
    //       aria-controls="hs-sidebar-header"
    //       aria-label="Toggle navigation"
    //       data-hs-overlay="#hs-sidebar-header"
    //     >
    //       Open
    //     </button>
    //   </div>
    //   {/* End Navigation Toggle */}

    //   {/* Sidebar */}
    //   <div
    //     id="hs-sidebar-header"
    //     className="hs-overlay [--auto-close:lg] lg:block lg:translate-x-0 lg:inset-e-auto lg:bottom-0 w-64 hs-overlay-open:translate-x-0 -translate-x-full transition-all duration-300 transform h-full hidden fixed top-0 inset-s-0 bottom-0 z-60 bg-sidebar border-e border-sidebar-line"
    //     role="dialog"
    //     tabIndex={-1}
    //     aria-label="Sidebar"
    //   >
    //     <div className="relative flex flex-col h-full max-h-full ">
    //       {/* Header */}
    //       <header className=" p-4 flex justify-between items-center gap-x-2">
    //         <a
    //           className="flex-none font-semibold text-xl text-layer-foreground focus:outline-hidden focus:opacity-80 "
    //           href="#"
    //           aria-label="Brand"
    //         >
    //           Brand
    //         </a>

    //         <div className="lg:hidden -me-2">
    //           {/* Close Button */}
    //           <button
    //             type="button"
    //             className="flex justify-center items-center gap-x-3 size-6 bg-layer border border-layer-line text-sm text-muted-foreground-2 hover:bg-layer-hover rounded-full disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:bg-layer-focus"
    //             data-hs-overlay="#hs-sidebar-header"
    //           >
    //             <svg
    //               className="shrink-0 size-4"
    //               xmlns="http://www.w3.org/2000/svg"
    //               width="24"
    //               height="24"
    //               viewBox="0 0 24 24"
    //               fill="none"
    //               stroke="currentColor"
    //               strokeWidth="2"
    //               strokeLinecap="round"
    //               strokeLinejoin="round"
    //             >
    //               <path d="M18 6 6 18" />
    //               <path d="m6 6 12 12" />
    //             </svg>
    //             <span className="sr-only">Close</span>
    //           </button>
    //           {/* End Close Button */}
    //         </div>

    //         {/* Note: Removed the placeholder '@@sidebar.header.minifyToggle.class' from Preline docs */}
    //         <div>
    //           {/* Toggle Button */}
    //           <button
    //             type="button"
    //             className="flex justify-center items-center flex-none gap-x-3 size-9 text-sm text-muted-foreground-2 hover:bg-muted-hover rounded-full disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:bg-muted-focus"
    //             aria-haspopup="dialog"
    //             aria-expanded="false"
    //             aria-controls="hs-sidebar-header"
    //             aria-label="Minify navigation"
    //             data-hs-overlay-minifier="#hs-sidebar-header"
    //           >
    //             <svg
    //               className="hidden hs-overlay-minified:block shrink-0 size-4"
    //               xmlns="http://www.w3.org/2000/svg"
    //               width="24"
    //               height="24"
    //               viewBox="0 0 24 24"
    //               fill="none"
    //               stroke="currentColor"
    //               strokeWidth="2"
    //               strokeLinecap="round"
    //               strokeLinejoin="round"
    //             >
    //               <rect width="18" height="18" x="3" y="3" rx="2" />
    //               <path d="M15 3v18" />
    //               <path d="m8 9 3 3-3 3" />
    //             </svg>
    //             <svg
    //               className="hs-overlay-minified:hidden shrink-0 size-4"
    //               xmlns="http://www.w3.org/2000/svg"
    //               width="24"
    //               height="24"
    //               viewBox="0 0 24 24"
    //               fill="none"
    //               stroke="currentColor"
    //               strokeWidth="2"
    //               strokeLinecap="round"
    //               strokeLinejoin="round"
    //             >
    //               <rect width="18" height="18" x="3" y="3" rx="2" />
    //               <path d="M15 3v18" />
    //               <path d="m10 15-3-3 3-3" />
    //             </svg>
    //             <span className="sr-only">Navigation Toggle</span>
    //           </button>
    //           {/* End Toggle Button */}
    //         </div>
    //       </header>
    //       {/* End Header */}

    //       {/* Header Profile */}
    //       <div className="mt-auto p-2 border-y border-sidebar-divider">
    //         {/* Account Dropdown */}
    //         <div className="hs-dropdown [--strategy:absolute] [--auto-close:inside] relative w-full inline-flex">
    //           <button
    //             id="hs-sidebar-header-example-with-dropdown"
    //             type="button"
    //             className="w-full inline-flex shrink-0 items-center gap-x-2 p-2 text-start text-sm text-foreground rounded-md hover:bg-muted-hover focus:outline-hidden focus:bg-muted-focus"
    //             aria-haspopup="menu"
    //             aria-expanded="false"
    //             aria-label="Dropdown"
    //           >
    //             <img
    //               className="shrink-0 size-5 rounded-full"
    //               src="https://images.unsplash.com/photo-1734122415415-88cb1d7d5dc0?q=80&w=320&h=320&auto=format&fit=facearea&facepad=3&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    //               alt="Avatar"
    //             />
    //             Mia Hudson
    //             <svg
    //               className="shrink-0 size-3.5 ms-auto"
    //               xmlns="http://www.w3.org/2000/svg"
    //               width="24"
    //               height="24"
    //               viewBox="0 0 24 24"
    //               fill="none"
    //               stroke="currentColor"
    //               strokeWidth="2"
    //               strokeLinecap="round"
    //               strokeLinejoin="round"
    //             >
    //               <path d="m7 15 5 5 5-5" />
    //               <path d="m7 9 5-5 5 5" />
    //             </svg>
    //           </button>

    //           <div
    //             className="hs-dropdown-menu hs-dropdown-open:opacity-100 w-60 transition-[opacity,margin] duration opacity-0 hidden z-20 bg-dropdown border border-dropdown-line rounded-lg shadow-lg"
    //             role="menu"
    //             aria-orientation="vertical"
    //             aria-labelledby="hs-sidebar-header-example-with-dropdown"
    //           >
    //             <div className="p-1">
    //               <a
    //                 className="flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-dropdown-item-foreground hover:bg-dropdown-item-hover focus:outline-hidden focus:bg-dropdown-item-focus"
    //                 href="#"
    //               >
    //                 My account
    //               </a>
    //               <a
    //                 className="flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-dropdown-item-foreground hover:bg-dropdown-item-hover focus:outline-hidden focus:bg-dropdown-item-focus"
    //                 href="#"
    //               >
    //                 Settings
    //               </a>
    //               <a
    //                 className="flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-dropdown-item-foreground hover:bg-dropdown-item-hover focus:outline-hidden focus:bg-dropdown-item-focus"
    //                 href="#"
    //               >
    //                 Billing
    //               </a>
    //               <a
    //                 className="flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-dropdown-item-foreground hover:bg-dropdown-item-hover focus:outline-hidden focus:bg-dropdown-item-focus"
    //                 href="#"
    //               >
    //                 Sign out
    //               </a>
    //             </div>
    //           </div>
    //         </div>
    //         {/* End Account Dropdown */}
    //       </div>
    //       {/* End Header Profile */}

    //       {/* Body */}
    //       <nav className="h-full overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar-track]:bg-scrollbar-track [&::-webkit-scrollbar-thumb]:bg-scrollbar-thumb">
    //         <div
    //           className="hs-accordion-group pb-0 px-2 pt-2 w-full flex flex-col flex-wrap"
    //           data-hs-accordion-always-open
    //         >
    //           <ul className="space-y-1">
    //             <li>
    //               <a
    //                 className=" flex items-center gap-x-3.5 py-2 px-2.5 bg-sidebar-nav-active text-sm text-sidebar-nav-foreground rounded-lg hover:bg-sidebar-nav-hover focus:outline-hidden focus:bg-sidebar-nav-focus"
    //                 href="#"
    //               >
    //                 <svg
    //                   className="size-4"
    //                   xmlns="http://www.w3.org/2000/svg"
    //                   width="24"
    //                   height="24"
    //                   viewBox="0 0 24 24"
    //                   fill="none"
    //                   stroke="currentColor"
    //                   strokeWidth="2"
    //                   strokeLinecap="round"
    //                   strokeLinejoin="round"
    //                 >
    //                   <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    //                   <polyline points="9 22 9 12 15 12 15 22" />
    //                 </svg>
    //                 Dashboard
    //               </a>
    //             </li>

    //             <li className="hs-accordion" id="users-accordion">
    //               <button
    //                 type="button"
    //                 className=" hs-accordion-toggle w-full text-start flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-sidebar-nav-foreground rounded-lg hover:bg-sidebar-nav-hover focus:outline-hidden focus:bg-sidebar-nav-focus"
    //                 aria-expanded="true"
    //                 aria-controls="users-accordion-collapse-1"
    //               >
    //                 <svg
    //                   className="size-4"
    //                   xmlns="http://www.w3.org/2000/svg"
    //                   width="24"
    //                   height="24"
    //                   viewBox="0 0 24 24"
    //                   fill="none"
    //                   stroke="currentColor"
    //                   strokeWidth="2"
    //                   strokeLinecap="round"
    //                   strokeLinejoin="round"
    //                 >
    //                   <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    //                   <circle cx="9" cy="7" r="4" />
    //                   <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    //                   <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    //                 </svg>
    //                 Users
    //                 <svg
    //                   className="hs-accordion-active:block ms-auto hidden size-4 "
    //                   xmlns="http://www.w3.org/2000/svg"
    //                   width="24"
    //                   height="24"
    //                   viewBox="0 0 24 24"
    //                   fill="none"
    //                   stroke="currentColor"
    //                   strokeWidth="2"
    //                   strokeLinecap="round"
    //                   strokeLinejoin="round"
    //                 >
    //                   <path d="m18 15-6-6-6 6" />
    //                 </svg>
    //                 <svg
    //                   className="hs-accordion-active:hidden ms-auto block size-4 "
    //                   xmlns="http://www.w3.org/2000/svg"
    //                   width="24"
    //                   height="24"
    //                   viewBox="0 0 24 24"
    //                   fill="none"
    //                   stroke="currentColor"
    //                   strokeWidth="2"
    //                   strokeLinecap="round"
    //                   strokeLinejoin="round"
    //                 >
    //                   <path d="m6 9 6 6 6-6" />
    //                 </svg>
    //               </button>

    //               <div
    //                 id="users-accordion-collapse-1"
    //                 className="hs-accordion-content w-full overflow-hidden transition-[height] duration-300 hidden"
    //                 role="region"
    //                 aria-labelledby="users-accordion"
    //               >
    //                 <ul
    //                   className="hs-accordion-group pt-1 ps-7 space-y-1"
    //                   data-hs-accordion-always-open
    //                 >
    //                   <li className="hs-accordion" id="users-accordion-sub-1">
    //                     <button
    //                       type="button"
    //                       className="hs-accordion-toggle w-full text-start flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-sidebar-nav-foreground rounded-lg hover:bg-sidebar-nav-hover focus:outline-hidden focus:bg-sidebar-nav-focus"
    //                       aria-expanded="true"
    //                       aria-controls="users-accordion-sub-1-collapse-1"
    //                     >
    //                       Sub Menu 1
    //                       <svg
    //                         className="hs-accordion-active:block ms-auto hidden size-4"
    //                         xmlns="http://www.w3.org/2000/svg"
    //                         width="24"
    //                         height="24"
    //                         viewBox="0 0 24 24"
    //                         fill="none"
    //                         stroke="currentColor"
    //                         strokeWidth="2"
    //                         strokeLinecap="round"
    //                         strokeLinejoin="round"
    //                       >
    //                         <path d="m18 15-6-6-6 6" />
    //                       </svg>
    //                       <svg
    //                         className="hs-accordion-active:hidden ms-auto block size-4"
    //                         xmlns="http://www.w3.org/2000/svg"
    //                         width="24"
    //                         height="24"
    //                         viewBox="0 0 24 24"
    //                         fill="none"
    //                         stroke="currentColor"
    //                         strokeWidth="2"
    //                         strokeLinecap="round"
    //                         strokeLinejoin="round"
    //                       >
    //                         <path d="m6 9 6 6 6-6" />
    //                       </svg>
    //                     </button>

    //                     <div
    //                       id="users-accordion-sub-1-collapse-1"
    //                       className="hs-accordion-content w-full overflow-hidden transition-[height] duration-300 hidden"
    //                       role="region"
    //                       aria-labelledby="users-accordion-sub-1"
    //                     >
    //                       <ul className="pt-1 ps-2 space-y-1">
    //                         <li>
    //                           <a
    //                             className="flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-sidebar-nav-foreground rounded-lg hover:bg-sidebar-nav-hover focus:outline-hidden focus:bg-sidebar-nav-focus"
    //                             href="#"
    //                           >
    //                             Link 1
    //                           </a>
    //                         </li>
    //                         <li>
    //                           <a
    //                             className="flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-sidebar-nav-foreground rounded-lg hover:bg-sidebar-nav-hover focus:outline-hidden focus:bg-sidebar-nav-focus"
    //                             href="#"
    //                           >
    //                             Link 2
    //                           </a>
    //                         </li>
    //                         <li>
    //                           <a
    //                             className="flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-sidebar-nav-foreground rounded-lg hover:bg-sidebar-nav-hover focus:outline-hidden focus:bg-sidebar-nav-focus"
    //                             href="#"
    //                           >
    //                             Link 3
    //                           </a>
    //                         </li>
    //                       </ul>
    //                     </div>
    //                   </li>

    //                   <li className="hs-accordion" id="users-accordion-sub-2">
    //                     <button
    //                       type="button"
    //                       className="hs-accordion-toggle w-full text-start flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-sidebar-nav-foreground rounded-lg hover:bg-sidebar-nav-hover focus:outline-hidden focus:bg-sidebar-nav-focus"
    //                       aria-expanded="true"
    //                       aria-controls="users-accordion-sub-2-collapse-1"
    //                     >
    //                       Sub Menu 2
    //                       <svg
    //                         className="hs-accordion-active:block ms-auto hidden size-4"
    //                         xmlns="http://www.w3.org/2000/svg"
    //                         width="24"
    //                         height="24"
    //                         viewBox="0 0 24 24"
    //                         fill="none"
    //                         stroke="currentColor"
    //                         strokeWidth="2"
    //                         strokeLinecap="round"
    //                         strokeLinejoin="round"
    //                       >
    //                         <path d="m18 15-6-6-6 6" />
    //                       </svg>
    //                       <svg
    //                         className="hs-accordion-active:hidden ms-auto block size-4"
    //                         xmlns="http://www.w3.org/2000/svg"
    //                         width="24"
    //                         height="24"
    //                         viewBox="0 0 24 24"
    //                         fill="none"
    //                         stroke="currentColor"
    //                         strokeWidth="2"
    //                         strokeLinecap="round"
    //                         strokeLinejoin="round"
    //                       >
    //                         <path d="m6 9 6 6 6-6" />
    //                       </svg>
    //                     </button>

    //                     <div
    //                       id="users-accordion-sub-2-collapse-1"
    //                       className="hs-accordion-content w-full overflow-hidden transition-[height] duration-300 hidden"
    //                       role="region"
    //                       aria-labelledby="users-accordion-sub-2"
    //                     >
    //                       <ul className="pt-1 ps-2 space-y-1">
    //                         <li>
    //                           <a
    //                             className="flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-sidebar-nav-foreground rounded-lg hover:bg-sidebar-nav-hover focus:outline-hidden focus:bg-sidebar-nav-focus"
    //                             href="#"
    //                           >
    //                             Link 1
    //                           </a>
    //                         </li>
    //                         <li>
    //                           <a
    //                             className="flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-sidebar-nav-foreground rounded-lg hover:bg-sidebar-nav-hover focus:outline-hidden focus:bg-sidebar-nav-focus"
    //                             href="#"
    //                           >
    //                             Link 2
    //                           </a>
    //                         </li>
    //                         <li>
    //                           <a
    //                             className="flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-sidebar-nav-foreground rounded-lg hover:bg-sidebar-nav-hover focus:outline-hidden focus:bg-sidebar-nav-focus"
    //                             href="#"
    //                           >
    //                             Link 3
    //                           </a>
    //                         </li>
    //                       </ul>
    //                     </div>
    //                   </li>
    //                 </ul>
    //               </div>
    //             </li>

    //             <li className="hs-accordion" id="account-accordion">
    //               <button
    //                 type="button"
    //                 className=" hs-accordion-toggle w-full text-start flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-sidebar-nav-foreground rounded-lg hover:bg-sidebar-nav-hover focus:outline-hidden focus:bg-sidebar-nav-focus"
    //                 aria-expanded="true"
    //                 aria-controls="account-accordion-sub-1-collapse-1"
    //               >
    //                 <svg
    //                   className="size-4"
    //                   xmlns="http://www.w3.org/2000/svg"
    //                   width="24"
    //                   height="24"
    //                   viewBox="0 0 24 24"
    //                   fill="none"
    //                   stroke="currentColor"
    //                   strokeWidth="2"
    //                   strokeLinecap="round"
    //                   strokeLinejoin="round"
    //                 >
    //                   <circle cx="18" cy="15" r="3" />
    //                   <circle cx="9" cy="7" r="4" />
    //                   <path d="M10 15H6a4 4 0 0 0-4 4v2" />
    //                   <path d="m21.7 16.4-.9-.3" />
    //                   <path d="m15.2 13.9-.9-.3" />
    //                   <path d="m16.6 18.7.3-.9" />
    //                   <path d="m19.1 12.2.3-.9" />
    //                   <path d="m19.6 18.7-.4-1" />
    //                   <path d="m16.8 12.3-.4-1" />
    //                   <path d="m14.3 16.6 1-.4" />
    //                   <path d="m20.7 13.8 1-.4" />
    //                 </svg>
    //                 Account
    //                 <svg
    //                   className="hs-accordion-active:block ms-auto hidden size-4 "
    //                   xmlns="http://www.w3.org/2000/svg"
    //                   width="24"
    //                   height="24"
    //                   viewBox="0 0 24 24"
    //                   fill="none"
    //                   stroke="currentColor"
    //                   strokeWidth="2"
    //                   strokeLinecap="round"
    //                   strokeLinejoin="round"
    //                 >
    //                   <path d="m18 15-6-6-6 6" />
    //                 </svg>
    //                 <svg
    //                   className="hs-accordion-active:hidden ms-auto block size-4 "
    //                   xmlns="http://www.w3.org/2000/svg"
    //                   width="24"
    //                   height="24"
    //                   viewBox="0 0 24 24"
    //                   fill="none"
    //                   stroke="currentColor"
    //                   strokeWidth="2"
    //                   strokeLinecap="round"
    //                   strokeLinejoin="round"
    //                 >
    //                   <path d="m6 9 6 6 6-6" />
    //                 </svg>
    //               </button>

    //               <div
    //                 id="account-accordion-sub-1-collapse-1"
    //                 className="hs-accordion-content w-full overflow-hidden transition-[height] duration-300 hidden"
    //                 role="region"
    //                 aria-labelledby="account-accordion"
    //               >
    //                 <ul className="pt-1 ps-7 space-y-1">
    //                   <li>
    //                     <a
    //                       className="flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-sidebar-nav-foreground rounded-lg hover:bg-sidebar-nav-hover focus:outline-hidden focus:bg-sidebar-nav-focus"
    //                       href="#"
    //                     >
    //                       Link 1
    //                     </a>
    //                   </li>
    //                   <li>
    //                     <a
    //                       className="flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-sidebar-nav-foreground rounded-lg hover:bg-sidebar-nav-hover focus:outline-hidden focus:bg-sidebar-nav-focus"
    //                       href="#"
    //                     >
    //                       Link 2
    //                     </a>
    //                   </li>
    //                   <li>
    //                     <a
    //                       className="flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-sidebar-nav-foreground rounded-lg hover:bg-sidebar-nav-hover focus:outline-hidden focus:bg-sidebar-nav-focus"
    //                       href="#"
    //                     >
    //                       Link 3
    //                     </a>
    //                   </li>
    //                 </ul>
    //               </div>
    //             </li>

    //             <li className="hs-accordion" id="projects-accordion">
    //               <button
    //                 type="button"
    //                 className=" hs-accordion-toggle w-full text-start flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-sidebar-nav-foreground rounded-lg hover:bg-sidebar-nav-hover focus:outline-hidden focus:bg-sidebar-nav-focus"
    //                 aria-expanded="true"
    //                 aria-controls="projects-accordion-sub-1-collapse-1"
    //               >
    //                 <svg
    //                   className="size-4"
    //                   xmlns="http://www.w3.org/2000/svg"
    //                   width="24"
    //                   height="24"
    //                   viewBox="0 0 24 24"
    //                   fill="none"
    //                   stroke="currentColor"
    //                   strokeWidth="2"
    //                   strokeLinecap="round"
    //                   strokeLinejoin="round"
    //                 >
    //                   <path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8c.4 0 .8-.2 1.1-.5.3-.3.5-.7.5-1.1V6.5L15.5 2z" />
    //                   <path d="M3 7.6v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8" />
    //                   <path d="M15 2v5h5" />
    //                 </svg>
    //                 Projects
    //                 <svg
    //                   className="hs-accordion-active:block ms-auto hidden size-4 "
    //                   xmlns="http://www.w3.org/2000/svg"
    //                   width="24"
    //                   height="24"
    //                   viewBox="0 0 24 24"
    //                   fill="none"
    //                   stroke="currentColor"
    //                   strokeWidth="2"
    //                   strokeLinecap="round"
    //                   strokeLinejoin="round"
    //                 >
    //                   <path d="m18 15-6-6-6 6" />
    //                 </svg>
    //                 <svg
    //                   className="hs-accordion-active:hidden ms-auto block size-4 "
    //                   xmlns="http://www.w3.org/2000/svg"
    //                   width="24"
    //                   height="24"
    //                   viewBox="0 0 24 24"
    //                   fill="none"
    //                   stroke="currentColor"
    //                   strokeWidth="2"
    //                   strokeLinecap="round"
    //                   strokeLinejoin="round"
    //                 >
    //                   <path d="m6 9 6 6 6-6" />
    //                 </svg>
    //               </button>

    //               <div
    //                 id="projects-accordion-sub-1-collapse-1"
    //                 className="hs-accordion-content w-full overflow-hidden transition-[height] duration-300 hidden"
    //                 role="region"
    //                 aria-labelledby="projects-accordion"
    //               >
    //                 <ul className="pt-1 ps-7 space-y-1">
    //                   <li>
    //                     <a
    //                       className="flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-sidebar-nav-foreground rounded-lg hover:bg-sidebar-nav-hover focus:outline-hidden focus:bg-sidebar-nav-focus"
    //                       href="#"
    //                     >
    //                       Link 1
    //                     </a>
    //                   </li>
    //                   <li>
    //                     <a
    //                       className="flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-sidebar-nav-foreground rounded-lg hover:bg-sidebar-nav-hover focus:outline-hidden focus:bg-sidebar-nav-focus"
    //                       href="#"
    //                     >
    //                       Link 2
    //                     </a>
    //                   </li>
    //                   <li>
    //                     <a
    //                       className="flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-sidebar-nav-foreground rounded-lg hover:bg-sidebar-nav-hover focus:outline-hidden focus:bg-sidebar-nav-focus"
    //                       href="#"
    //                     >
    //                       Link 3
    //                     </a>
    //                   </li>
    //                 </ul>
    //               </div>
    //             </li>

    //             <li>
    //               <a
    //                 className=" w-full flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-sidebar-nav-foreground rounded-lg hover:bg-sidebar-nav-hover focus:outline-hidden focus:bg-sidebar-nav-focus"
    //                 href="#"
    //               >
    //                 <svg
    //                   className="size-4"
    //                   xmlns="http://www.w3.org/2000/svg"
    //                   width="24"
    //                   height="24"
    //                   viewBox="0 0 24 24"
    //                   fill="none"
    //                   stroke="currentColor"
    //                   strokeWidth="2"
    //                   strokeLinecap="round"
    //                   strokeLinejoin="round"
    //                 >
    //                   <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    //                   <line x1="16" x2="16" y1="2" y2="6" />
    //                   <line x1="8" x2="8" y1="2" y2="6" />
    //                   <line x1="3" x2="21" y1="10" y2="10" />
    //                   <path d="M8 14h.01" />
    //                   <path d="M12 14h.01" />
    //                   <path d="M16 14h.01" />
    //                   <path d="M8 18h.01" />
    //                   <path d="M12 18h.01" />
    //                   <path d="M16 18h.01" />
    //                 </svg>
    //                 Calendar{" "}
    //                 <span className="ms-auto py-0.5 px-1.5 inline-flex items-center gap-x-1.5 text-xs bg-surface-1 text-surface-foreground rounded-full">
    //                   New
    //                 </span>
    //               </a>
    //             </li>
    //             <li>
    //               <a
    //                 className=" w-full flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-sidebar-nav-foreground rounded-lg hover:bg-sidebar-nav-hover focus:outline-hidden focus:bg-sidebar-nav-focus"
    //                 href="#"
    //               >
    //                 <svg
    //                   className="size-4"
    //                   xmlns="http://www.w3.org/2000/svg"
    //                   width="24"
    //                   height="24"
    //                   viewBox="0 0 24 24"
    //                   fill="none"
    //                   stroke="currentColor"
    //                   strokeWidth="2"
    //                   strokeLinecap="round"
    //                   strokeLinejoin="round"
    //                 >
    //                   <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    //                   <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    //                 </svg>
    //                 Documentation
    //               </a>
    //             </li>
    //           </ul>
    //         </div>
    //       </nav>
    //       {/* End Body */}
    //     </div>
    //   </div>
    //   {/* End Sidebar */}
    // </>

  );
}
