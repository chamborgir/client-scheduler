import React from "react";

export default function Sidebar({
    isSidebarOpen,
    session,
    syncStatus,
    triggerCloudSync,
    setIsBackupModalOpen,
    handleSignOut,
    currentView,
    setView,
}) {
    return (
        <aside
            className="sidebar"
            style={{
                width: isSidebarOpen ? "260px" : "0px",
                padding: isSidebarOpen ? "20px" : "0px",
                borderRight: isSidebarOpen ? "1px solid #e5e5e5" : "none",
            }}
        >
            {isSidebarOpen && (
                <div className="sidebar-content">
                    <div className="sidebar-header">
                        <div className="sidebar-token">Session</div>
                        <div className="sidebar-email">
                            {session?.user?.email}
                        </div>
                        <div className="sidebar-status">
                            <span
                                className={`status-dot ${syncStatus.includes("Offline") ? "offline" : "online"}`}
                            ></span>
                            {syncStatus}
                        </div>
                    </div>

                    <nav className="sidebar-nav">
                        <button
                            onClick={() => setView("homepage")}
                            className={`sidebar-link-btn ${currentView === "homepage" ? "focused" : ""}`}
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                            </svg>
                            Calendar Dashboard
                        </button>
                        <button
                            onClick={() => setView("index-list")}
                            className={`sidebar-link-btn ${currentView === "index-list" ? "focused" : ""}`}
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="8" y1="6" x2="21" y2="6"></line>
                                <line x1="8" y1="12" x2="21" y2="12"></line>
                                <line x1="8" y1="18" x2="21" y2="18"></line>
                                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                                <line x1="3" y1="18" x2="3.01" y2="18"></line>
                            </svg>
                            Full Registry Index
                        </button>
                        <button
                            onClick={() => setView("archived")}
                            className={`sidebar-link-btn ${currentView === "archived" ? "focused" : ""}`}
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="21 8 21 21 3 21 3 8"></polyline>
                                <rect
                                    x="1"
                                    y="3"
                                    width="22"
                                    height="5"
                                    rx="1"
                                ></rect>
                                <line x1="10" y1="12" x2="14" y2="12"></line>
                            </svg>
                            Archived Schedule
                        </button>
                        <hr className="panel-divider" />
                        <button
                            onClick={triggerCloudSync}
                            className="sidebar-link-btn"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="23 4 23 10 17 10"></polyline>
                                <polyline points="1 20 1 14 7 14"></polyline>
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                            </svg>
                            Sync Schedules
                        </button>
                        <button
                            onClick={() => setIsBackupModalOpen(true)}
                            className="sidebar-link-btn"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            Data Sync Backup
                        </button>
                    </nav>

                    <div className="sidebar-footer">
                        <button
                            onClick={handleSignOut}
                            className="disconnect-btn"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </aside>
    );
}
