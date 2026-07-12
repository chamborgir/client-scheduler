import React from "react";

export default function HomepageView({
    year,
    month,
    startingGridOffset,
    totalDaysInMonth,
    appointments,
    todayISOString,
    selectedDateStr,
    setSelectedDateStr,
    setActiveClient,
    setIsModalOpen,
}) {
    const activeAppointments = appointments.filter((a) => !a.is_completed);

    return (
        <div className="dashboard-grid">
            <div className="panel-card">
                <div className="panel-header">
                    <span>Overview</span>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="action-add-btn"
                    >
                        Create Schedule
                    </button>
                </div>

                <div className="calendar-grid-layout">
                    {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                        <div key={i} className="calendar-day-header">
                            {d}
                        </div>
                    ))}

                    {Array.from({ length: startingGridOffset }).map(
                        (_, idx) => (
                            <div
                                key={`empty-${idx}`}
                                className="calendar-cell-empty"
                            ></div>
                        ),
                    )}

                    {Array.from({ length: totalDaysInMonth }).map((_, idx) => {
                        const currentDayNum = idx + 1;
                        const loopDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(currentDayNum).padStart(2, "0")}`;
                        const dayAppointments = activeAppointments.filter(
                            (a) => a.appointment_date === loopDateStr,
                        );

                        const isSystemToday = loopDateStr === todayISOString;
                        const isFocusedDay = loopDateStr === selectedDateStr;

                        return (
                            <div
                                key={loopDateStr}
                                onClick={() => setSelectedDateStr(loopDateStr)}
                                className={`calendar-cell ${isFocusedDay ? "focused" : ""}`}
                                style={{
                                    borderColor: isSystemToday
                                        ? "#171717"
                                        : isFocusedDay
                                          ? "#d4d4d4"
                                          : "#e5e5e5",
                                    borderWidth: isSystemToday ? "2px" : "1px",
                                }}
                            >
                                <span className="cell-day-num">
                                    {currentDayNum}
                                </span>
                                {dayAppointments.length > 0 && (
                                    <span className="cell-counter">
                                        {dayAppointments.length}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="panel-card">
                <span className="panel-title">Details: {selectedDateStr}</span>
                <hr className="panel-divider" />

                {activeAppointments.filter(
                    (a) => a.appointment_date === selectedDateStr,
                ).length === 0 ? (
                    <p className="empty-placeholder">No Active Allocation</p>
                ) : (
                    <div className="agenda-list">
                        {activeAppointments
                            .filter(
                                (a) => a.appointment_date === selectedDateStr,
                            )
                            .map((app) => (
                                <div
                                    key={app.id}
                                    onClick={() => setActiveClient(app)}
                                    className="strip-row-card"
                                >
                                    <div className="strip-row-header">
                                        <strong>{app.client_name}</strong>
                                        <span className="time-tag-chip">
                                            {app.appointment_time}
                                        </span>
                                    </div>
                                    <div className="strip-row-service">
                                        {app.service}
                                    </div>
                                    {app.notes && (
                                        <div className="strip-row-notes-indicator">
                                            <svg
                                                width="12"
                                                height="12"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                style={{
                                                    marginRight: "4px",
                                                    verticalAlign: "middle",
                                                }}
                                            >
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 childhood 2h12a2 2 0 0 0 2-2V8z"></path>
                                                <polyline points="14 2 14 8 20 8"></polyline>
                                                <line
                                                    x1="16"
                                                    y1="13"
                                                    x2="8"
                                                    y2="13"
                                                ></line>
                                                <line
                                                    x1="16"
                                                    y1="17"
                                                    x2="8"
                                                    y2="17"
                                                ></line>
                                                <polyline points="10 9 9 9 8 9"></polyline>
                                            </svg>
                                            Has notes
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}
