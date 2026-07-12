import React, { useState, useEffect } from "react";
import { localDB, supabase } from "./db";

// View Layout Segments imports
import Sidebar from "./components/Sidebar";
import HomepageView from "./components/HomepageView";
import IndexListView from "./components/IndexListView";
import ArchivedScheduleView from "./components/ArchivedScheduleView";
import AuthView from "./components/AuthView"; // Import your new component

export default function App() {
    // Infrastructure View Control State Engine
    const [currentView, setView] = useState("homepage"); // 'homepage' | 'index-list' | 'archived'

    // Authentication States
    const [session, setSession] = useState(null);
    const [authMode, setAuthMode] = useState("login");
    const [emailInput, setEmailInput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");
    const [authError, setAuthError] = useState("");

    // Data Engine States
    const [appointments, setAppointments] = useState([]);
    const [syncStatus, setSyncStatus] = useState("Initializing...");
    const [sortCriteria, setSortCriteria] = useState("date-asc");

    // UI Toggles
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeClient, setActiveClient] = useState(null);

    // Calendar Engine States
    const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
    const [selectedDateStr, setSelectedDateStr] = useState(
        new Date().toISOString().split("T")[0],
    );

    // Creation States
    const [newName, setNewName] = useState("");
    const [newService, setNewService] = useState("General Admin Support");
    const [timeHour, setTimeHour] = useState("");
    const [timeMinute, setTimeMinute] = useState("");
    const [timePeriod, setTimePeriod] = useState("");

    // Modification States
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editService, setEditService] = useState("");
    const [editHour, setEditHour] = useState("");
    const [editMinute, setEditMinute] = useState("");
    const [editPeriod, setEditPeriod] = useState("");
    const [editNotes, setEditNotes] = useState("");
    const [editIsCompleted, setEditIsCompleted] = useState(false);

    useEffect(() => {
        if (activeClient) {
            setEditName(activeClient.client_name || "");
            setEditService(activeClient.service || "");
            setEditNotes(activeClient.notes || "");
            setEditIsCompleted(activeClient.is_completed || false);

            if (activeClient.appointment_time) {
                const timeParts = activeClient.appointment_time.split(" ");
                if (timeParts[0] && timeParts[1]) {
                    const hm = timeParts[0].split(":");
                    setEditHour(hm[0] || "");
                    setEditMinute(hm[1] || "");
                    setEditPeriod(timeParts[1] || "");
                }
            }
        } else {
            setIsEditing(false);
        }
    }, [activeClient]);

    useEffect(() => {
        supabase.auth
            .getSession()
            .then(({ data: { session } }) => setSession(session));
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) =>
            setSession(session),
        );

        const setOnline = () => {
            setSyncStatus("Connected");
            triggerCloudSync();
        };
        const setOffline = () => setSyncStatus("Offline Mode");

        window.addEventListener("online", setOnline);
        window.addEventListener("offline", setOffline);

        return () => {
            subscription.unsubscribe();
            window.removeEventListener("online", setOnline);
            window.removeEventListener("offline", setOffline);
        };
    }, []);

    useEffect(() => {
        if (session?.user?.id) {
            loadIsolatedLocalData();
            if (navigator.onLine) triggerCloudSync();
        } else {
            setAppointments([]);
        }
    }, [session, currentCalendarDate]);

    const loadIsolatedLocalData = async () => {
        if (!session?.user?.id) return;
        const localRecords = await localDB.appointments
            .where("user_id")
            .equals(session.user.id)
            .toArray();
        setAppointments(localRecords);
    };

    const handleGoogleSignIn = async () => {
        setAuthError("");
        const isProd = window.location.hostname !== "localhost";
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                // This forces the redirect back to the correct host
                redirectTo: isProd
                    ? "https://client-scheduler-orcin.vercel.app"
                    : "http://localhost:3000",
            },
        });
        if (error) setAuthError(error.message);
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setAuthError("");
        if (authMode === "login") {
            const { error } = await supabase.auth.signInWithPassword({
                email: emailInput,
                password: passwordInput,
            });
            if (error) setAuthError(error.message);
        } else {
            const { error } = await supabase.auth.signUp({
                email: emailInput,
                password: passwordInput,
            });
            if (error) setAuthError(error.message);
            else alert("Verification link dispatched.");
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setSession(null);
    };

    const triggerCloudSync = async () => {
        if (!navigator.onLine || !session?.user?.id) return;
        setSyncStatus("Synchronizing...");
        try {
            const unsyncedItems = await localDB.appointments
                .where("user_id")
                .equals(session.user.id)
                .and((item) => item.synced === 0)
                .toArray();
            for (const item of unsyncedItems) {
                const { synced, ...dbPayload } = item;
                const { error } = await supabase
                    .from("appointments")
                    .upsert(dbPayload);
                if (!error)
                    await localDB.appointments.update(item.id, { synced: 1 });
            }
            const { data: cloudData, error } = await supabase
                .from("appointments")
                .select("*")
                .eq("user_id", session.user.id);
            if (cloudData && !error) {
                await localDB.appointments.bulkPut(
                    cloudData.map((item) => ({ ...item, synced: 1 })),
                );
            }
            setSyncStatus("Synced");
            loadIsolatedLocalData();
        } catch (err) {
            setSyncStatus("Offline Backup Active");
        }
    };

    const handleDownloadHardBackup = async () => {
        if (!session?.user?.id) return;
        const localRecords = await localDB.appointments
            .where("user_id")
            .equals(session.user.id)
            .toArray();
        const dataStr =
            "data:text/json;charset=utf-8," +
            encodeURIComponent(JSON.stringify(localRecords, null, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute(
            "download",
            `scheduler_backup_${new Date().toISOString().split("T")[0]}.json`,
        );
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

    const handleUploadBackupJson = async (e) => {
        const fileReader = new FileReader();
        const targetFile = e.target.files[0];
        if (!targetFile || !session?.user?.id) return;
        fileReader.onload = async (event) => {
            try {
                const parsedData = JSON.parse(event.target.result);
                if (!Array.isArray(parsedData))
                    throw new Error("Format configuration invalid.");
                const validatedRecords = parsedData.map((record) => ({
                    ...record,
                    user_id: session.user.id,
                    synced: 0,
                }));
                await localDB.appointments.bulkPut(validatedRecords);
                setIsBackupModalOpen(false);
                loadIsolatedLocalData();
                triggerCloudSync();
            } catch (err) {
                alert("Verification aborted: " + err.message);
            }
        };
        fileReader.readAsText(targetFile);
    };

    const handleCreateAppointment = async (e) => {
        e.preventDefault();
        const compiledTimeStr = `${timeHour.padStart(2, "0")}:${timeMinute.padStart(2, "0")} ${timePeriod.toUpperCase()}`;
        const newRecord = {
            id: crypto.randomUUID(),
            user_id: session.user.id,
            client_name: newName.trim(),
            appointment_date: selectedDateStr,
            appointment_time: compiledTimeStr,
            service: newService,
            notes: "",
            is_completed: false,
            synced: 0,
        };
        await localDB.appointments.put(newRecord);
        setNewName("");
        setTimeHour("");
        setTimeMinute("");
        setTimePeriod("");
        setIsModalOpen(false);
        loadIsolatedLocalData();
        if (navigator.onLine) {
            const { synced, ...dbPayload } = newRecord;
            const { error } = await supabase
                .from("appointments")
                .insert([dbPayload]);
            if (!error)
                await localDB.appointments.update(newRecord.id, { synced: 1 });
            triggerCloudSync();
        }
    };

    const handleUpdateAppointment = async (e) => {
        e.preventDefault();
        if (!activeClient) return;
        const compiledTimeStr = `${editHour.padStart(2, "0")}:${editMinute.padStart(2, "0")} ${editPeriod.toUpperCase()}`;
        const updatedRecord = {
            ...activeClient,
            client_name: editName.trim(),
            appointment_time: compiledTimeStr,
            service: editService.trim(),
            notes: editNotes,
            is_completed: editIsCompleted,
            synced: 0,
        };

        await localDB.appointments.put(updatedRecord);
        setActiveClient(updatedRecord);
        setIsEditing(false);
        loadIsolatedLocalData();
        if (navigator.onLine) {
            const { synced, ...dbPayload } = updatedRecord;
            const { error } = await supabase
                .from("appointments")
                .upsert(dbPayload);
            if (!error)
                await localDB.appointments.update(updatedRecord.id, {
                    synced: 1,
                });
            triggerCloudSync();
        }
    };

    const handleCancelAppointment = async (appointmentId) => {
        await localDB.appointments.delete(appointmentId);
        setActiveClient(null);
        loadIsolatedLocalData();
        if (navigator.onLine && session?.user?.id) {
            await supabase
                .from("appointments")
                .delete()
                .eq("id", appointmentId)
                .eq("user_id", session.user.id);
        }
    };

    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const startingGridOffset = new Date(year, month, 1).getDay();

    const getSortedMasterList = () => {
        return [...appointments].sort((a, b) => {
            if (sortCriteria === "date-asc")
                return (
                    new Date(a.appointment_date) - new Date(b.appointment_date)
                );
            if (sortCriteria === "date-desc")
                return (
                    new Date(b.appointment_date) - new Date(a.appointment_date)
                );
            if (sortCriteria === "name-asc")
                return a.client_name.localeCompare(b.client_name);
            return 0;
        });
    };

    const todayISOString = new Date().toISOString().split("T")[0];

    if (!session) {
        return (
            <AuthView
                authError={authError}
                handleGoogleSignIn={handleGoogleSignIn}
                authMode={authMode}
                setAuthMode={setAuthMode}
                handleEmailAuth={handleEmailAuth}
                emailInput={emailInput}
                setEmailInput={setEmailInput}
                passwordInput={passwordInput}
                setPasswordInput={setPasswordInput}
            />
        );
    }

    return (
        <div className="app-container">
            {isSidebarOpen && window.innerWidth <= 1024 && (
                <div
                    className="sidebar-mobile-backdrop"
                    onClick={() => setIsSidebarOpen(false)}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0,0,0,0.2)",
                        backdropFilter: "blur(2px)",
                        zIndex: 90,
                    }}
                />
            )}
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                session={session}
                syncStatus={syncStatus}
                triggerCloudSync={triggerCloudSync}
                setIsBackupModalOpen={setIsBackupModalOpen}
                handleSignOut={handleSignOut}
                currentView={currentView}
                setView={setView}
            />

            <main className="main-content">
                <header className="main-header">
                    <div className="header-left">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="icon-toggle-btn"
                            title="Toggle Sidebar"
                            aria-label="Toggle Sidebar"
                        >
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ display: "block" }}
                            >
                                {/* Modern Sidebar Icon Representation */}
                                <rect
                                    x="3"
                                    y="3"
                                    width="18"
                                    height="18"
                                    rx="2"
                                    ry="2"
                                ></rect>
                                <line x1="9" y1="3" x2="9" y2="21"></line>
                            </svg>
                        </button>
                        <div className="date-badge">
                            {new Date().toLocaleDateString("default", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                            })}
                        </div>
                    </div>

                    {/* Month Slider Navigation Box */}
                    <div className="date-slider-box">
                        <button
                            onClick={() =>
                                setCurrentCalendarDate(
                                    new Date(year, month - 1, 1),
                                )
                            }
                            className="inline-arrow-btn"
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>
                        <span className="current-month-label">
                            {currentCalendarDate.toLocaleString("default", {
                                month: "short",
                                year: "numeric",
                            })}
                        </span>
                        <button
                            onClick={() =>
                                setCurrentCalendarDate(
                                    new Date(year, month + 1, 1),
                                )
                            }
                            className="inline-arrow-btn"
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>
                </header>

                {/* Modular Routing Engine Router Switches */}
                {currentView === "homepage" && (
                    <HomepageView
                        year={year}
                        month={month}
                        startingGridOffset={startingGridOffset}
                        totalDaysInMonth={totalDaysInMonth}
                        appointments={appointments}
                        todayISOString={todayISOString}
                        selectedDateStr={selectedDateStr}
                        setSelectedDateStr={setSelectedDateStr}
                        setActiveClient={setActiveClient}
                        setIsModalOpen={setIsModalOpen}
                    />
                )}

                {currentView === "index-list" && (
                    <IndexListView
                        appointments={appointments}
                        sortCriteria={sortCriteria}
                        setSortCriteria={setSortCriteria}
                        getSortedMasterList={getSortedMasterList}
                        setActiveClient={setActiveClient}
                    />
                )}

                {currentView === "archived" && (
                    <ArchivedScheduleView
                        getSortedMasterList={getSortedMasterList}
                        setActiveClient={setActiveClient}
                    />
                )}

                {/* MODALS INJECTIONS */}
                {isBackupModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-body-container">
                            <h3 className="modal-heading">Data Sync Center</h3>
                            <div className="modal-flex-box">
                                <button
                                    onClick={handleDownloadHardBackup}
                                    className="primary-btn"
                                >
                                    Download Offline JSON
                                </button>
                                <div className="backup-upload-zone">
                                    <input
                                        type="file"
                                        accept=".json"
                                        onChange={handleUploadBackupJson}
                                        className="file-input-field"
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsBackupModalOpen(false)}
                                className="secondary-btn full-width margin-top"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-body-container">
                            <h3 className="modal-heading">Create Entry</h3>
                            <form
                                onSubmit={handleCreateAppointment}
                                className="modal-form"
                            >
                                <input
                                    type="text"
                                    required
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="text-input"
                                    placeholder="Client Name"
                                />
                                <div className="time-picker-row">
                                    <input
                                        type="text"
                                        required
                                        maxLength="2"
                                        placeholder="HH"
                                        value={timeHour}
                                        onChange={(e) =>
                                            setTimeHour(e.target.value)
                                        }
                                        className="text-input center-text width-60"
                                    />
                                    <span>:</span>
                                    <input
                                        type="text"
                                        required
                                        maxLength="2"
                                        placeholder="MM"
                                        value={timeMinute}
                                        onChange={(e) =>
                                            setTimeMinute(e.target.value)
                                        }
                                        className="text-input center-text width-60"
                                    />
                                    <select
                                        required
                                        value={timePeriod}
                                        onChange={(e) =>
                                            setTimePeriod(e.target.value)
                                        }
                                        className="dropdown-selector"
                                    >
                                        <option value="" disabled hidden>
                                            AM/PM
                                        </option>
                                        <option value="AM">AM</option>
                                        <option value="PM">PM</option>
                                    </select>
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={newService}
                                    onChange={(e) =>
                                        setNewService(e.target.value)
                                    }
                                    className="text-input"
                                    placeholder="Service Details"
                                />
                                <div className="modal-action-row">
                                    <button
                                        type="submit"
                                        className="primary-btn"
                                    >
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="secondary-btn"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {activeClient && (
                    <div className="modal-overlay">
                        <div className="modal-body-container">
                            <h3 className="modal-heading">
                                {isEditing
                                    ? "Edit Assignment"
                                    : "Inspection Registry"}
                            </h3>
                            {isEditing ? (
                                <form
                                    onSubmit={handleUpdateAppointment}
                                    className="modal-form"
                                >
                                    <input
                                        type="text"
                                        required
                                        value={editName}
                                        onChange={(e) =>
                                            setEditName(e.target.value)
                                        }
                                        className="text-input"
                                    />
                                    <div className="time-picker-row">
                                        <input
                                            type="text"
                                            required
                                            maxLength="2"
                                            value={editHour}
                                            onChange={(e) =>
                                                setEditHour(e.target.value)
                                            }
                                            className="text-input center-text width-60"
                                        />
                                        <span>:</span>
                                        <input
                                            type="text"
                                            required
                                            maxLength="2"
                                            value={editMinute}
                                            onChange={(e) =>
                                                setEditMinute(e.target.value)
                                            }
                                            className="text-input center-text width-60"
                                        />
                                        <select
                                            value={editPeriod}
                                            onChange={(e) =>
                                                setEditPeriod(e.target.value)
                                            }
                                            className="dropdown-selector"
                                        >
                                            <option value="AM">AM</option>
                                            <option value="PM">PM</option>
                                        </select>
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={editService}
                                        onChange={(e) =>
                                            setEditService(e.target.value)
                                        }
                                        className="text-input"
                                    />
                                    <textarea
                                        rows="3"
                                        value={editNotes}
                                        onChange={(e) =>
                                            setEditNotes(e.target.value)
                                        }
                                        className="text-input textarea-input"
                                    />
                                    <div className="checkbox-row">
                                        <input
                                            type="checkbox"
                                            id="isCompleted"
                                            checked={editIsCompleted}
                                            onChange={(e) =>
                                                setEditIsCompleted(
                                                    e.target.checked,
                                                )
                                            }
                                        />
                                        <label htmlFor="isCompleted">
                                            Mark Completed (Archive)
                                        </label>
                                    </div>
                                    <div className="modal-action-row">
                                        <button
                                            type="submit"
                                            className="primary-btn"
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="secondary-btn"
                                        >
                                            Back
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="inspection-view">
                                    <div className="inspection-group">
                                        <span className="inspection-label">
                                            Client Name
                                        </span>
                                        <div className="inspection-data">
                                            {activeClient.client_name}
                                        </div>
                                    </div>
                                    <div className="inspection-group">
                                        <span className="inspection-label">
                                            Allocated Schedule
                                        </span>
                                        <div className="inspection-data">
                                            {activeClient.appointment_date} at{" "}
                                            {activeClient.appointment_time}
                                        </div>
                                    </div>
                                    <div className="inspection-group">
                                        <span className="inspection-label">
                                            Service Scope
                                        </span>
                                        <div className="inspection-data">
                                            {activeClient.service}
                                        </div>
                                    </div>
                                    <div className="inspection-group">
                                        <span className="inspection-label">
                                            Internal Documentation Notes
                                        </span>
                                        <div className="notes-display-box">
                                            <p className="notes-content">
                                                {activeClient.notes ||
                                                    "No extra contextual notations documented."}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="modal-action-row margin-top-large">
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="primary-btn"
                                        >
                                            Modify
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleCancelAppointment(
                                                    activeClient.id,
                                                )
                                            }
                                            className="danger-btn"
                                        >
                                            Delete
                                        </button>
                                        <button
                                            onClick={() =>
                                                setActiveClient(null)
                                            }
                                            className="secondary-btn"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
