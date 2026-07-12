import React from "react";

export default function IndexListView({
    appointments,
    sortCriteria,
    setSortCriteria,
    getSortedMasterList,
    setActiveClient,
}) {
    const activeItems = getSortedMasterList().filter(
        (item) => !item.is_completed,
    );

    return (
        <section className="panel-card full-width">
            <div className="index-table-header">
                <span className="panel-title">
                    Active Schedule List ({activeItems.length})
                </span>
                <select
                    value={sortCriteria}
                    onChange={(e) => setSortCriteria(e.target.value)}
                    className="dropdown-selector"
                >
                    <option value="date-asc">Date: Ascending</option>
                    <option value="date-desc">Date: Descending</option>
                    <option value="name-asc">Client Name</option>
                </select>
            </div>

            {activeItems.length === 0 ? (
                <div className="table-empty-placeholder">
                    No pending active schedule logged.
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="index-table">
                        <thead>
                            <tr>
                                <th className="table-header-cell">Name</th>
                                <th className="table-header-cell">Date</th>
                                <th className="table-header-cell">Time</th>
                                <th className="table-header-cell">Scope</th>
                                <th className="table-header-cell">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeItems.map((item) => (
                                <tr
                                    key={item.id}
                                    onClick={() => setActiveClient(item)}
                                    className="table-row-node"
                                >
                                    <td className="table-client-name">
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
                                        <span
                                            className={`status-label ${item.synced === 1 ? "synced" : "local"}`}
                                        >
                                            {item.synced === 1
                                                ? "Synced"
                                                : "Local"}
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
