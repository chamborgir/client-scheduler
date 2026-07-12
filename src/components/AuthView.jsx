import React from "react";

export default function AuthView({
    authError,
    handleGoogleSignIn,
    authMode,
    setAuthMode,
    handleEmailAuth,
    emailInput,
    setEmailInput,
    passwordInput,
    setPasswordInput,
}) {
    return (
        <div className="login-wrapper">
            <div className="auth-card">
                <h2>Client Scheduler</h2>
                <p className="auth-subtitle">Authentication Entry Required</p>
                {authError && (
                    <div className="auth-error-block">{authError}</div>
                )}

                <button onClick={handleGoogleSignIn} className="google-btn">
                    Continue with Google
                </button>

                <div className="divider-zone">
                    <hr />
                    <span>OR</span>
                    <hr />
                </div>

                <form onSubmit={handleEmailAuth} className="auth-form">
                    <input
                        type="email"
                        placeholder="Email"
                        className="text-input"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="text-input"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        required
                    />
                    <button type="submit" className="primary-btn">
                        {authMode === "login" ? "Sign In" : "Register"}
                    </button>
                </form>

                <p className="auth-toggle-text">
                    <span
                        onClick={() =>
                            setAuthMode(
                                authMode === "login" ? "signup" : "login",
                            )
                        }
                    >
                        {authMode === "login" ? "Create an account" : "Login"}
                    </span>
                </p>
            </div>
        </div>
    );
}
