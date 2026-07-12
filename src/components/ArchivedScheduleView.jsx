import React from "react";

export default function ArchivedScheduleView({
    getSortedMasterList,
    setActiveClient,
}) {
    const archivedItems = getSortedMasterList().filter(
        (item) => item.is_completed,
    );

    return (
        <section className="panel-card full-width">
            <div className="index-table-header">
                <span className="panel-title">
                    🗄️ Historical Archive Records ({archivedItems.length})
                </span>
            </div>

            {archivedItems.length === 0 ? (
                <div className="table-empty-placeholder">
                    No archive historical logs found.
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="index-table">
                        <thead>
                            <tr>
                                <th className="table-header-cell">Name</th>
                                <th className="table-header-cell">
                                    Execution Date
                                </th>
                                <th className="table-header-cell">Time Slot</th>
                                <th className="table-header-cell">
                                    Closed Scope
                                </th>
                                <th className="table-header-cell">
                                    Status Map
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {archivedItems.map((item) => (
                                <tr
                                    key={item.id}
                                    onClick={() => setActiveClient(item)}
                                    className="table-row-node row-completed"
                                >
                                    <td className="table-client-name strike-text">
                                        {item.client_name}
                                    </td>
                                    <td className="table-cell-date">
                                        {item.appointment_date}
                                    </td>
                                    <td className="table-cell-time">
                                        {item.appointment_time}
                                    </td>
                                    <td className="table-cell-service">
                                        {item.service}
                                    </td>
                                    <td>
                                        <span className="status-label completed">
                                            ✓ Completed
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
