import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import "./Login.css";

type KcContext_Login = Extract<KcContext, { pageId: "login.ftl" }>;

const iconOverrides: Record<string, string> = {
    "stack-overflow": "stackoverflow",
    "stack_overflow": "stackoverflow",
    "microsoft-online": "microsoft",
    "microsoftonline": "microsoft",
    "microsoft-identity": "microsoft",
    "microsoftidentity": "microsoft",
    "microsoft-azure": "microsoftazure",
    "microsoftazure": "microsoftazure",
    "azure-ad": "microsoftazure",
    "azuread": "microsoftazure",
    "azure": "microsoftazure",
    "microsoft": "microsoft",
    "google": "google",
    "github": "github",
    "gitlab": "gitlab",
    "bitbucket": "bitbucket",
    "facebook": "facebook",
    "twitter": "x",
    "linkedin": "linkedin",
    "instagram": "instagram",
    "paypal": "paypal",
    "openshift": "redhatopenshift"
};

function getIconSlug(providerId?: string, alias?: string) {
    const raw = (providerId || alias || "").toLowerCase();
    if (raw in iconOverrides) return iconOverrides[raw];
    if (raw.includes("microsoft")) return "microsoft";
    if (raw.includes("azure")) return "microsoftazure";
    return raw
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function getIconSources(providerId?: string, alias?: string) {
    const slug = getIconSlug(providerId, alias);
    if (slug === "microsoft") {
        return {
            primary: "/images/microsoft.svg"
        };
    }
    return {
        primary: `https://cdn.simpleicons.org/${slug}/6b5d47`,
        fallback: `https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/${slug}.svg`
    };
}

export default function Login(props: { kcContext: KcContext_Login; i18n: I18n }) {
    const { kcContext } = props;

    const { url, realm, login, message, messagesPerField, social, auth, usernameHidden } =
        kcContext;

    const hasFieldError =
        messagesPerField?.existsError?.("username", "password") ??
        messagesPerField?.existsError?.("password") ??
        false;

    const fieldError =
        messagesPerField?.get?.("username") ||
        messagesPerField?.get?.("password") ||
        "";

    return (
        <div className="kc-login-page">
            <div className="kc-login-card">
                <header className="kc-login-header">
                    <h1 className="kc-login-title">Sign in</h1>
                    {message && (
                        <p className={`kc-login-message kc-login-message--${message.type}`}>
                            {message.summary}
                        </p>
                    )}
                </header>

                <form className="kc-login-form" action={url.loginAction} method="post">
                    {!usernameHidden ? (
                        <label className="kc-login-field">
                            <span className="kc-login-label">
                                {realm.loginWithEmailAllowed ? "Username or email" : "Username"}
                            </span>
                            <input
                                className={`kc-login-input ${
                                    hasFieldError ? "kc-login-input--error" : ""
                                }`}
                                id="username"
                                name="username"
                                defaultValue={login.username ?? ""}
                                type="text"
                                autoComplete="username"
                                autoFocus
                            />
                        </label>
                    ) : (
                        <input
                            type="hidden"
                            id="username"
                            name="username"
                            value={auth?.attemptedUsername ?? login.username ?? ""}
                        />
                    )}

                    <label className="kc-login-field">
                        <span className="kc-login-label">Password</span>
                        <input
                            className={`kc-login-input ${
                                hasFieldError ? "kc-login-input--error" : ""
                            }`}
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                        />
                    </label>

                    {hasFieldError && fieldError !== "" && (
                        <div className="kc-login-error">{fieldError}</div>
                    )}

                    {realm.rememberMe && !usernameHidden && (
                        <label className="kc-login-remember">
                            <input
                                id="rememberMe"
                                name="rememberMe"
                                type="checkbox"
                                defaultChecked={login.rememberMe === "on"}
                            />
                            <span>Remember me</span>
                        </label>
                    )}

                    <button className="kc-login-submit" type="submit">
                        Sign in
                    </button>

                    {kcContext.enableWebAuthnConditionalUI && (
                        <button
                            className="kc-login-passkey"
                            type="button"
                            aria-label="Sign in with passkey"
                        >
                            Sign in with passkey
                        </button>
                    )}

                    {realm.resetPasswordAllowed && (
                        <a className="kc-login-link" href={url.loginResetCredentialsUrl}>
                            Forgot password?
                        </a>
                    )}

                    {realm.registrationAllowed && (
                        <a className="kc-login-link" href={url.registrationUrl}>
                            Create account
                        </a>
                    )}
                </form>

                {social?.providers?.length ? (
                    <div className="kc-login-social">
                        <div className="kc-login-social-title">Or continue with</div>
                        <div className="kc-login-social-list">
                            {social.providers.map(provider => (
                                <a
                                    key={provider.providerId}
                                    className="kc-login-social-btn"
                                    href={provider.loginUrl}
                                >
                                    <span className="kc-login-social-icon" aria-hidden="true">
                                        {(() => {
                                            const sources = getIconSources(
                                                provider.providerId,
                                                provider.alias
                                            );
                                            return (
                                                <img
                                                    className="kc-login-social-img"
                                                    alt=""
                                                    src={sources.primary}
                                                    onError={
                                                        sources.fallback
                                                            ? event => {
                                                                  const img = event.currentTarget;
                                                                  if (img.dataset.fallbackApplied === "true") {
                                                                      return;
                                                                  }
                                                                  img.dataset.fallbackApplied = "true";
                                                                  img.src = sources.fallback;
                                                              }
                                                            : undefined
                                                    }
                                                />
                                            );
                                        })()}
                                    </span>
                                    <span className="kc-login-social-text">
                                        {provider.displayName}
                                    </span>
                                </a>
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
